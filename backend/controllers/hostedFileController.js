import asyncHandler from '../utils/asyncHandler.js';
import {
  presignUpload,
  confirmUpload,
  getUserFiles,
  getFileTarget,
  getStorageUsage,
  removeFile,
  getAllFilesAdmin,
} from '../services/hostedFileService.js';

export const presign = asyncHandler(async (req, res) => {
  const result = await presignUpload({
    userId: req.user.id,
    rawBody: req.body,
    remoteIp: req.ip,
  });
  res.status(201).json(result);
});

export const confirm = asyncHandler(async (req, res) => {
  const file = await confirmUpload({ userId: req.user.id, rawBody: req.body });
  res.json(file);
});

export const listMine = asyncHandler(async (req, res) => {
  const files = await getUserFiles(req.user.id);
  res.json(files);
});

export const usage = asyncHandler(async (req, res) => {
  const summary = await getStorageUsage();
  res.json(summary);
});

export const serveFile = asyncHandler(async (req, res) => {
  const target = await getFileTarget(req.params.slug);
  if (target.redirectUrl) return res.redirect(302, target.redirectUrl);
  // Old uploads are someone's HTML served from adorio.space. The sandbox gives it an
  // opaque origin, so its scripts can't read the site's storage or call the API as the visitor.
  res
    .set('Content-Type', target.contentType)
    .set('Content-Security-Policy', 'sandbox allow-scripts allow-forms allow-popups allow-modals')
    .send(target.body);
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
