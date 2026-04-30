import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import ApiError from './ApiError.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'feelio/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    quality: 'auto:best',
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }, { fetch_format: 'auto' }],
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  },
});

const fileFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;
