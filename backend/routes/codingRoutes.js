import { Router } from 'express';
import { verifyToken, admin } from '../middleware/verifyToken.js';
import { codingLimiter, codeRunnerLimiter } from '../config/rateLimiters.js';
import {
  runCodingSubmissionHandler,
  getCodeRunnerStatusHandler,
  requestCodeRunnerSessionHandler,
  holdCodeRunnerHandler,
} from '../controllers/codingController.js';

const router = Router();

router.post('/run', verifyToken, codingLimiter, runCodingSubmissionHandler);

router.get('/runner', verifyToken, codeRunnerLimiter, getCodeRunnerStatusHandler);
router.post('/runner/sessions', verifyToken, codeRunnerLimiter, requestCodeRunnerSessionHandler);
router.post('/runner/holds', verifyToken, admin, codeRunnerLimiter, holdCodeRunnerHandler);

export default router;
