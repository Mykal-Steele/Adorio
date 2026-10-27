import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { environment } from '../config/environment.js';
import {
  presignUploadSchema,
  confirmUploadSchema,
  MAX_HOSTED_FILE_BYTES,
} from '../schemas/index.js';
import {
  createUploadUrl,
  headObject,
  deleteObject,
  setObjectCacheControl,
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
  deletePendingHostedFile,
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

// Uploads get their own folder in the bucket, so a file named like something else stored
// there (learn-korean.html) can never overwrite it.
const UPLOAD_PREFIX = 'h/';

// A presigned PUT doesn't bind the size, so a URL is an open door until it expires. Short
// enough to limit that, long enough for a 100 MB upload on a slow connection.
const UPLOAD_URL_TTL_SECONDS = 15 * 60;

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

// R2 being down or rejecting a call answers 409, not 500: the Cloudflare failover worker
// reads two 5xx in a row as the whole backend being down and moves the site to Northflank.
const storageUnavailable = (error, action) => {
  console.error(`R2 ${action} failed`, { message: error?.message });
  return ApiError.conflict('File storage is not responding right now. Please try again.', {
    code: 'STORAGE_UNAVAILABLE',
  });
};

// Removes a pending upload: its record, its object and its reserved bytes. Does nothing
// when another request (a confirm, a delete, the sweep) already settled it.
const discardPending = async (slug) => {
  const removed = await deletePendingHostedFile(slug);
  if (!removed) return;
  if (removed.r2Key) {
    await deleteObject(removed.r2Key).catch((error) =>
      console.error('R2 delete of a discarded upload failed', {
        key: removed.r2Key,
        message: error.message,
      }),
    );
  }
  await releaseStorage(removed.size ?? 0);
};

// Reclaims reservations held by presigned uploads that were never confirmed.
const sweepStalePending = async () => {
  const stale = await findStalePendingHostedFiles(new Date(Date.now() - PENDING_UPLOAD_TTL_MS));
  for (const file of stale) await discardPending(file.slug);
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
    key = `${UPLOAD_PREFIX}${slug}${extensionOf(filename)}`;
    const uploadUrl = await createUploadUrl({
      key,
      contentType,
      expiresIn: UPLOAD_URL_TTL_SECONDS,
    }).catch((error) => {
      throw error instanceof ApiError ? error : storageUnavailable(error, 'presign');
    });
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
      await discardPending(slug);
      throw ApiError.badRequest('Upload did not complete — no file was received');
    }
    throw error instanceof ApiError ? error : storageUnavailable(error, 'head');
  }

  const actualSize = head.ContentLength ?? file.size;

  // The signed URL can't stop a bigger body than declared, so this is where the 100 MB
  // limit actually holds.
  if (actualSize > MAX_HOSTED_FILE_BYTES) {
    await discardPending(slug);
    throw ApiError.badRequest('File must be under 100 MB');
  }

  // The real object is bigger than declared: reserve the difference first, and if that
  // trips the cap, discard the upload entirely.
  const extra = Math.max(0, actualSize - file.size);
  if (extra && !(await reserveStorage(extra, environment.hostedStorageLimitBytes))) {
    await discardPending(slug);
    throw storageFullError();
  }

  // A short cache lifetime before it goes public, so deleting it later takes effect within
  // a minute instead of the edge's default two hours
  try {
    await setObjectCacheControl(file.r2Key, file.contentType);
  } catch (error) {
    if (extra) await releaseStorage(extra);
    throw storageUnavailable(error, 'cache header');
  }

  const confirmed = await markHostedFileConfirmed(slug, actualSize);
  if (!confirmed) {
    // Another confirm or a delete settled this upload first, storage included
    if (extra) await releaseStorage(extra);
    const current = await findHostedFileBySlug(slug);
    if (!current) throw ApiError.notFound('Upload not found');
    return toResponse(current);
  }

  if (actualSize < file.size) await releaseStorage(file.size - actualSize);
  return toResponse(confirmed);
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
    // False on a server without R2 keys (the failover copy, or before they're set), so the
    // page can say uploads are off up front
    uploadsEnabled: r2Configured,
    turnstileSiteKey: turnstileSiteKey || null,
  };
};

export const getFileTarget = async (slug) => {
  const file = await findHostedFileBySlug(slug);
  // An unconfirmed upload may never finish, so it isn't served (or counted) yet
  if (!file || file.pending) throw ApiError.notFound('File not found');
  await incrementFileViews(slug);

  if (file.r2Key) return { redirectUrl: publicUrlFor(file.r2Key) };
  return { contentType: 'text/html; charset=utf-8', body: file.content };
};

export const removeFile = async ({ slug, userId, isAdmin }) => {
  const file = await findHostedFileBySlug(slug);
  if (!file) throw ApiError.notFound('File not found');
  if (!isAdmin && file.userId.toString() !== userId) throw ApiError.forbidden('Not authorized');
  // The object goes first. If R2 refuses, the record stays so the delete can be retried,
  // instead of the bytes being released while the object still takes up space.
  if (file.r2Key) {
    await deleteObject(file.r2Key).catch((error) => {
      throw storageUnavailable(error, 'delete');
    });
  }
  const removed = await deleteHostedFileBySlug(slug);
  // Only the request that actually removed the record gives its bytes back
  if (removed?.r2Key) await releaseStorage(removed.size ?? 0);
};

export const getAllFilesAdmin = () => findAllHostedFiles();
