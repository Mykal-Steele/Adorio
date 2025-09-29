import multer from 'multer';
import { Router } from 'express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import verifyToken from '../middleware/verifyToken.js';
import cloudinary from '../config/cloudinary.js';
import {
  createPostHandler,
  getPostsHandler,
  getSinglePostHandler,
  toggleLikeHandler,
  addCommentHandler,
} from '../controllers/postController.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'feelio/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    quality: 'auto:best',
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
      { fetch_format: 'auto' },
    ],
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  },
});

// gotta make sure users don't upload weird files or viruses
const fileFilter = (req, file, cb) => {
  if (
    ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.post('/', verifyToken, upload.single('image'), createPostHandler);
router.get('/', getPostsHandler);
router.get('/:id', getSinglePostHandler);
router.put('/:id/like', verifyToken, toggleLikeHandler);
router.post('/:id/comment', verifyToken, addCommentHandler);

export default router;
