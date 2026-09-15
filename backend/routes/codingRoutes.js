import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { codingLimiter } from '../config/rateLimiters.js';
import { runCodingSubmissionHandler } from '../controllers/codingController.js';

const router = Router();

router.post('/run', verifyToken, codingLimiter, runCodingSubmissionHandler);

export default router;
