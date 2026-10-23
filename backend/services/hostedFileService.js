import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { environment } from '../config/environment.js';
import { presignUploadSchema, confirmUploadSchema } from '../schemas/index.js';
import {
  createUploadUrl,
  headObject,
  deleteObject,
  publicUrlFor,
  r2Configured,
} from '../utils/r2.js';
import { verifyTurnstile, turnstileSiteKey } from '../utils/turnstile.js';
import {
  createHostedFile,
  findHostedFileBySlug,
  findHostedFilesByUserId,
  findStalePendingHostedFiles,
  deleteHostedFileBySlug,
  incrementFileViews,
  markHostedFileConfirmed,
  findAllHostedFiles,
  slugExists,
  sumHostedR2Bytes,
  storageLedgerExists,
  initStorageLedger,
  reserveStorage,
  releaseStorage,
  getStorageTotal,
} from '../models/index.js';

// A presigned URL that is never confirmed holds its reserved bytes forever.
// Anything still pending after this long is treated as abandoned and reclaimed.
const PENDING_UPLOAD_TTL_MS = 2 * 60 * 60 * 1000;

const extensionOf = (filename) => {
  const match = /\.([a-z0-9]{1,12})$/i.exec(filename);
  return match ? `.${match[1].toLowerCase()}` : '';
};

const toSlug = (filename) =>
  filename
    .replace(/\.[^./\\]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file';

const uniqueSlug = async (base) => {
  if (!(await slugExists(base))) return base;
  for (let i = 0; i < 8; i++) {
    const candidate = `${base}-${Math.random().toString(36).slice(2, 7)}`;
    if (!(await slugExists(candidate))) return candidate;
  }
  throw ApiError.internalServerError('Could not generate a unique slug');
};

const toResponse = (file) => ({
  _id: file._id,
  slug: file.slug,
  originalFilename: file.originalFilename,
  contentType: file.contentType,
  size: file.size,
  views: file.views ?? 0,
  createdAt: file.createdAt,
  updatedAt: file.updatedAt,
});

const storageFullError = () =>
  ApiError.conflict(
    'Storage is full — the file host has reached its size limit. Delete a file to free space.',
    { code: 'STORAGE_LIMIT_REACHED', limitBytes: environment.hostedStorageLimitBytes },
  );

// Seeds the ledger from any R2 files that existed before it (no-op after the
// first call). Runs before every reservation so a fresh database never starts
// the count at zero while files are already stored.
const ensureStorageLedger = async () => {
  if (await storageLedgerExists()) return;
  await initStorageLedger(await sumHostedR2Bytes());
};

// Reclaims reservations held by presigned uploads that were never confirmed.
const sweepStalePending = async () => {
  const stale = await findStalePendingHostedFiles(new Date(Date.now() - PENDING_UPLOAD_TTL_MS));
  for (const file of stale) {
    if (file.r2Key) await deleteObject(file.r2Key).catch(() => {});
    await deleteHostedFileBySlug(file.slug);
    await releaseStorage(file.size ?? 0);
  }
};

export const presignUpload = async ({ userId, rawBody, remoteIp }) => {
  const { filename, contentType, size, turnstileToken } = validate(presignUploadSchema, rawBody);

  if (!(await verifyTurnstile(turnstileToken, remoteIp))) {
    throw ApiError.badRequest('Captcha check failed — please reload the page and try again');
  }

  await ensureStorageLedger();
  await sweepStalePending();

  if (!(await reserveStorage(size, environment.hostedStorageLimitBytes))) {
    throw storageFullError();
  }

  let key;
  try {
    const slug = await uniqueSlug(toSlug(filename));
    key = `${slug}${extensionOf(filename)}`;
    const uploadUrl = await createUploadUrl({ key, contentType });
    const file = await createHostedFile({
      userId,
      slug,
      originalFilename: filename,
      contentType,
      size,
      storage: 'r2',
      r2Key: key,
      pending: true,
    });
    return { slug: file.slug, uploadUrl, publicUrl: publicUrlFor(key) };
  } catch (error) {
    // Never leak a reservation when the placeholder row or URL signing fails.
    await releaseStorage(size);
    throw error;
  }
};

export const confirmUpload = async ({ userId, rawBody }) => {
  const { slug } = validate(confirmUploadSchema, rawBody);
  const file = await findHostedFileBySlug(slug);
  if (!file) throw ApiError.notFound('Upload not found');
  if (file.userId.toString() !== userId) throw ApiError.forbidden('Not authorized');
  if (!file.pending) return toResponse(file);

  let head;
  try {
    head = await headObject(file.r2Key);
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404) {
      // The PUT never landed — drop the placeholder and its reservation.
      await deleteHostedFileBySlug(slug);
      await releaseStorage(file.size);
      throw ApiError.badRequest('Upload did not complete — no file was received');
    }
    throw error;
  }

  const actualSize = head.ContentLength ?? file.size;

  if (actualSize > file.size) {
    // The real object is bigger than declared. Reserve the difference; if that
    // trips the cap, discard the object and the placeholder entirely.
    if (!(await reserveStorage(actualSize - file.size, environment.hostedStorageLimitBytes))) {
      await deleteObject(file.r2Key).catch(() => {});
      await deleteHostedFileBySlug(slug);
      await releaseStorage(file.size);
      throw storageFullError();
    }
  } else if (actualSize < file.size) {
    await releaseStorage(file.size - actualSize);
  }

  await markHostedFileConfirmed(slug, actualSize);
  return toResponse({ ...file.toObject(), size: actualSize });
};

export const getUserFiles = (userId) => findHostedFilesByUserId(userId);

export const getStorageUsage = async () => {
  let usedBytes = 0;
  if (r2Configured) {
    await ensureStorageLedger();
    usedBytes = await getStorageTotal();
  }
  const limitBytes = environment.hostedStorageLimitBytes;
  return {
    usedBytes,
    limitBytes,
    remainingBytes: Math.max(0, limitBytes - usedBytes),
    turnstileSiteKey: turnstileSiteKey || null,
  };
};

export const getFileTarget = async (slug) => {
  const file = await findHostedFileBySlug(slug);
  if (!file) throw ApiError.notFound('File not found');
  await incrementFileViews(slug);

  if (file.r2Key) return { redirectUrl: publicUrlFor(file.r2Key) };
  return { contentType: 'text/html; charset=utf-8', body: file.content };
};

export const removeFile = async ({ slug, userId, isAdmin }) => {
  const file = await findHostedFileBySlug(slug);
  if (!file) throw ApiError.notFound('File not found');
  if (!isAdmin && file.userId.toString() !== userId) throw ApiError.forbidden('Not authorized');
  if (file.r2Key) {
    await deleteObject(file.r2Key).catch((error) =>
      console.error(`R2 delete failed for ${file.r2Key}:`, error.message),
    );
    await releaseStorage(file.size ?? 0);
  }
  await deleteHostedFileBySlug(slug);
};

export const getAllFilesAdmin = () => findAllHostedFiles();
