import asyncHandler from '../utils/asyncHandler.js';
import {
  uploadFile,
  getUserFiles,
  getFileContent,
  removeFile,
  getAllFilesAdmin,
} from '../services/hostedFileService.js';

export const upload = asyncHandler(async (req, res) => {
  const file = await uploadFile({ userId: req.user.id, rawBody: req.body });
  res.status(201).json(file);
});

export const listMine = asyncHandler(async (req, res) => {
  const files = await getUserFiles(req.user.id);
  res.json(files);
});

export const serveFile = asyncHandler(async (req, res) => {
  const html = await getFileContent(req.params.slug);
  res.set('Content-Type', 'text/html; charset=utf-8').send(html);
});

export const deleteFile = asyncHandler(async (req, res) => {
  await removeFile({
    slug: req.params.slug,
    userId: req.user.id,
    isAdmin: req.user.isAdmin,
  });
  res.status(204).send();
});

export const listAll = asyncHandler(async (req, res) => {
  const files = await getAllFilesAdmin();
  res.json(files);
});
