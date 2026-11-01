import crypto from 'crypto';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import ApiError from './ApiError.js';

export const postImageParams = {
  folder: 'feelio/posts',
  // A random name keeps the uploader's filename out of the public URL.
  public_id: () => crypto.randomUUID(),
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  quality: 'auto:best',
  transformation: [{ width: 1000, height: 1000, crop: 'limit' }, { fetch_format: 'auto' }],
  overwrite: false,
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: postImageParams,
});

const fileFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;
