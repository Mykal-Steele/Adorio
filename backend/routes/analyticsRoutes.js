import { Router } from 'express';
import {
  trackVisit,
  getPageViewSummary,
  getRecentVisitEntries,
} from '../controllers/analyticsController.js';
import { optional, protect } from '../middleware/verifyToken.js';
import visitorIdentifier from '../middleware/visitorIdentifier.js';

const router = Router();

router.post('/track', visitorIdentifier, optional, trackVisit);
router.get('/page-views', protect, getPageViewSummary);
router.get('/recent', protect, getRecentVisitEntries);

export default router;
