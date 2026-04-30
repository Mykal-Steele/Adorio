import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { updateScoreSchema } from '../schemas/index.js';
import { findUsersWithScore, findUserById, updateUserRhythm } from '../models/index.js';

const difficultyRank = { hard: 3, normal: 2, easy: 1 };

export const getLeaderboard = async () => {
  const users = await findUsersWithScore();
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

export const updateUserScore = async ({ userId, rawBody }) => {
  if (!userId) throw ApiError.unauthorized('Authentication required to save score');

  const { score, difficulty } = validate(updateScoreSchema, rawBody);

  const user = await findUserById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (!user.rhythmGame || score > user.rhythmGame.peakPLevel) {
    await updateUserRhythm(userId, { peakPLevel: score, difficulty, lastPlayed: new Date() });
    return { peakPLevel: score, difficulty };
  }

  return { peakPLevel: user.rhythmGame.peakPLevel, difficulty: user.rhythmGame.difficulty };
};

export const getUserStats = async (userId) => {
  if (!userId) return { peakPLevel: 0, difficulty: 'normal', anonymous: true };

  const user = await findUserById(userId);
  if (!user) throw ApiError.notFound('User not found');

  return {
    peakPLevel: user.rhythmGame?.peakPLevel || 0,
    difficulty: user.rhythmGame?.difficulty || 'normal',
    lastPlayed: user.rhythmGame?.lastPlayed,
  };
};
