import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { secretLimiter } from '../config/rateLimiters.js';
import {
  storeSecretMessage,
  retrieveSecretMessageHandler,
} from '../controllers/secretEnvController.js';

const router = Router();

router.post('/', verifyToken, secretLimiter, storeSecretMessage);
// No auth by design — curl-friendly personal message saver; the passphrase protects the content
router.get('/', secretLimiter, retrieveSecretMessageHandler);
router.get('/:name', secretLimiter, retrieveSecretMessageHandler);

export default router;
