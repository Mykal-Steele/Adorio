import { Router } from 'express';
import {
  trackVisit,
  getPageViewSummary,
  getRecentVisitEntries,
  getVisitorSummary,
  getVisitorDetailsInfo,
  getHealthStatus,
  getSystemStats,
} from '../controllers/analyticsController.js';
import { optional, protect } from '../middleware/verifyToken.js';
import visitorIdentifier from '../middleware/visitorIdentifier.js';

const router = Router();

router.post('/track', visitorIdentifier, optional, trackVisit);
router.get('/page-views', protect, getPageViewSummary);
router.get('/recent', protect, getRecentVisitEntries);
router.get('/visitor-stats', protect, getVisitorSummary);
router.get('/visitor/:visitorId', protect, getVisitorDetailsInfo);
router.get('/health', getHealthStatus);
router.get('/stats', protect, getSystemStats);

export default router;
