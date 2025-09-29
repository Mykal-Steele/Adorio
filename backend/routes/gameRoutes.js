import { Router } from 'express';
import { optional } from '../middleware/verifyToken.js';
import {
  getLeaderboardHandler,
  updateScoreHandler,
  getUserStatsHandler,
} from '../controllers/gameController.js';

const router = Router();

router.get('/leaderboard', getLeaderboardHandler);
router.post('/update-score', optional, updateScoreHandler);
router.get('/user-stats', optional, getUserStatsHandler);

export default router;
