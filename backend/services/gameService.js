import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const difficultyRank = {
  hard: 3,
  normal: 2,
  easy: 1,
};

const getLeaderboard = async () => {
  const users = await User.find(
    { 'rhythmGame.peakPLevel': { $gt: 0 } },
    'username rhythmGame'
  ).lean();

  return users.sort((a, b) => {
    if (b.rhythmGame.peakPLevel !== a.rhythmGame.peakPLevel) {
      return b.rhythmGame.peakPLevel - a.rhythmGame.peakPLevel;
    }

    return (
      difficultyRank[b.rhythmGame.difficulty || 'normal'] -
      difficultyRank[a.rhythmGame.difficulty || 'normal']
    );
  });
};

const updateUserScore = async ({ userId, score, difficulty }) => {
  if (!userId) {
    throw ApiError.unauthorized('Authentication required to save score');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!user.rhythmGame || score > user.rhythmGame.peakPLevel) {
    user.rhythmGame = {
      peakPLevel: score,
      difficulty,
      lastPlayed: new Date(),
    };

    await user.save();
  }

  return {
    peakPLevel: user.rhythmGame.peakPLevel,
    difficulty: user.rhythmGame.difficulty,
  };
};

const getUserStats = async (userId) => {
  if (!userId) {
    return {
      peakPLevel: 0,
      difficulty: 'normal',
      anonymous: true,
    };
  }

  const user = await User.findById(userId).select('rhythmGame');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return {
    peakPLevel: user.rhythmGame?.peakPLevel || 0,
    difficulty: user.rhythmGame?.difficulty || 'normal',
    lastPlayed: user.rhythmGame?.lastPlayed,
  };
};

export { getLeaderboard, updateUserScore, getUserStats };
