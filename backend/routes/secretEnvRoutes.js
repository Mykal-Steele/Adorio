import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { secretLimiter } from '../config/rateLimiters.js';
import {
  storeSecretMessage,
  retrieveSecretMessageHandler,
} from '../controllers/secretEnvController.js';

const router = Router();

router.post('/', verifyToken, storeSecretMessage);
// No auth by design — curl-friendly personal message saver; password hash protects the content
router.get('/', secretLimiter, retrieveSecretMessageHandler);

export default router;
