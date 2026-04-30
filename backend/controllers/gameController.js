import asyncHandler from '../utils/asyncHandler.js';
import { getLeaderboard, updateUserScore, getUserStats } from '../services/gameService.js';

const getLeaderboardHandler = asyncHandler(async (req, res) => {
  const leaderboard = await getLeaderboard();
  res.status(200).json(leaderboard);
});

const updateScoreHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    res
      .status(200)
      .json({ message: 'Score recorded locally only (not logged in)', anonymous: true });
    return;
  }

  const result = await updateUserScore({ userId: req.user.id, rawBody: req.body });
  res.status(200).json({ message: 'Score updated successfully', ...result });
});

const getUserStatsHandler = asyncHandler(async (req, res) => {
  const stats = await getUserStats(req.user?.id);
  res.status(200).json(stats);
});

export { getLeaderboardHandler, updateScoreHandler, getUserStatsHandler };
