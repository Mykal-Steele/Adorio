import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';
import {
  getCurrentUser,
  registerUser,
  loginUser,
  refreshToken,
} from '../controllers/userController.js';

const router = Router();

router.get('/me', verifyToken, getCurrentUser);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);

export default router;
