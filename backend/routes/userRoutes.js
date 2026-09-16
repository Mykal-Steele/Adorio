import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';
import {
  getCurrentUser,
  registerUser,
  loginUser,
  refreshToken,
  deleteUserHandler,
  searchUsersHandler,
} from '../controllers/userController.js';

const router = Router();

router.get('/me', verifyToken, getCurrentUser);
router.get('/search', verifyToken, searchUsersHandler);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.delete('/me', verifyToken, deleteUserHandler);

export default router;
