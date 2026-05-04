import { Router } from 'express';
import { getMetrics, getUptime } from '../controllers/monitoringController.js';

const router = Router();

router.get('/metrics', getMetrics);
router.get('/uptime', getUptime);

export default router;
