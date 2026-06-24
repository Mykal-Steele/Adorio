import { Router } from 'express';
import { verifyToken, admin } from '../middleware/verifyToken.js';
import {
  upload,
  listMine,
  serveFile,
  deleteFile,
  listAll,
} from '../controllers/hostedFileController.js';

const router = Router();

router.post('/', verifyToken, upload);
router.get('/all', verifyToken, admin, listAll);
router.get('/', verifyToken, listMine);
router.get('/:slug', serveFile);
router.delete('/:slug', verifyToken, deleteFile);

export default router;
