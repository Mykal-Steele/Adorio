import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { secretLimiter } from '../config/rateLimiters.js';
import {
  storeSecretMessage,
  retrieveSecretMessageHandler,
} from '../controllers/secretEnvController.js';

const router = Router();

router.post('/', verifyToken, secretLimiter, storeSecretMessage);
// no auth on purpose, it's a curl-friendly message saver and the passphrase protects the content
router.get('/', secretLimiter, retrieveSecretMessageHandler);
router.get('/:name', secretLimiter, retrieveSecretMessageHandler);

export default router;
