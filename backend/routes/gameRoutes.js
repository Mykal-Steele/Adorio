import { Router } from 'express';
import { optional, verifyToken } from '../middleware/verifyToken.js';
import {
  getLeaderboardHandler,
  updateScoreHandler,
  updateAchievementsHandler,
  getUserStatsHandler,
} from '../controllers/gameController.js';

const router = Router();

router.get('/leaderboard', getLeaderboardHandler);
router.post('/update-score', optional, updateScoreHandler);
router.post('/achievements', verifyToken, updateAchievementsHandler);
router.get('/user-stats', optional, getUserStatsHandler);

export default router;
