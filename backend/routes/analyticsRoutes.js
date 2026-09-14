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
import { optional, protect, admin } from '../middleware/verifyToken.js';
import visitorIdentifier from '../middleware/visitorIdentifier.js';

const router = Router();

router.post('/track', visitorIdentifier, optional, trackVisit);
router.get('/page-views', protect, admin, getPageViewSummary);
router.get('/recent', protect, admin, getRecentVisitEntries);
router.get('/visitor-stats', protect, admin, getVisitorSummary);
router.get('/visitor/:visitorId', protect, admin, getVisitorDetailsInfo);
router.get('/health', getHealthStatus);
router.get('/stats', protect, admin, getSystemStats);

export default router;
