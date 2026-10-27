import { Router } from 'express';
import { verifyToken, admin } from '../middleware/verifyToken.js';
import { hostedUploadLimiter } from '../config/rateLimiters.js';
import {
  presign,
  confirm,
  listMine,
  usage,
  serveFile,
  deleteFile,
  listAll,
} from '../controllers/hostedFileController.js';

const router = Router();

router.post('/presign', verifyToken, hostedUploadLimiter, presign);
router.post('/confirm', verifyToken, confirm);
router.get('/all', verifyToken, admin, listAll);
router.get('/usage', verifyToken, usage);
router.get('/', verifyToken, listMine);
router.get('/:slug', serveFile);
router.delete('/:slug', verifyToken, deleteFile);

export default router;
