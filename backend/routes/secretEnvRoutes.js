import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';
import {
  storeSecretMessage,
  retrieveSecretMessageHandler,
} from '../controllers/secretEnvController.js';

const router = Router();

router.post('/', verifyToken, storeSecretMessage);
router.get('/', retrieveSecretMessageHandler);

export default router;
