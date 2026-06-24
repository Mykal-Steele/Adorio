import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { uploadFileSchema } from '../schemas/index.js';
import {
  createHostedFile,
  findHostedFileBySlug,
  findHostedFilesByUserId,
  deleteHostedFileBySlug,
  incrementFileViews,
  findAllHostedFiles,
  slugExists,
} from '../models/index.js';

const toSlug = (filename) =>
  filename
    .replace(/\.html$/i, '')
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

export const uploadFile = async ({ userId, rawBody }) => {
  const { filename, content } = validate(uploadFileSchema, rawBody);
  const slug = await uniqueSlug(toSlug(filename));
  const file = await createHostedFile({
    userId,
    slug,
    originalFilename: filename,
    content,
    size: Buffer.byteLength(content, 'utf8'),
  });
  return {
    _id: file._id,
    slug: file.slug,
    originalFilename: file.originalFilename,
    size: file.size,
    views: 0,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };
};

export const getUserFiles = (userId) => findHostedFilesByUserId(userId);

export const getFileContent = async (slug) => {
  const file = await findHostedFileBySlug(slug);
  if (!file) throw ApiError.notFound('File not found');
  await incrementFileViews(slug);
  return file.content;
};

export const removeFile = async ({ slug, userId, isAdmin }) => {
  const file = await findHostedFileBySlug(slug);
  if (!file) throw ApiError.notFound('File not found');
  if (!isAdmin && file.userId.toString() !== userId) throw ApiError.forbidden('Not authorized');
  await deleteHostedFileBySlug(slug);
};

export const getAllFilesAdmin = () => findAllHostedFiles();
