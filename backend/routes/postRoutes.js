import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';
import upload from '../utils/cloudinaryUpload.js';
import {
  createPostHandler,
  getPostsHandler,
  getSinglePostHandler,
  toggleLikeHandler,
  addCommentHandler,
  deletePostHandler,
} from '../controllers/postController.js';

const router = Router();

router.post('/', verifyToken, upload.single('image'), createPostHandler);
router.get('/', getPostsHandler);
router.get('/:id', getSinglePostHandler);
router.put('/:id/like', verifyToken, toggleLikeHandler);
router.post('/:id/comment', verifyToken, addCommentHandler);
router.delete('/:id', verifyToken, deletePostHandler);

export default router;
