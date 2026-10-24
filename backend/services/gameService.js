import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { environment } from '../config/environment.js';
import { updateScoreSchema, updateAchievementsSchema } from '../schemas/index.js';
import { findUsersWithScore, findUserById, updateUserRhythm } from '../models/index.js';

const difficultyRank = { hard: 3, normal: 2, easy: 1 };
const ACHIEVEMENT_KEYS = ['firstPlay', 'reach10PLevel', 'reach25PLevel', 'reach50PLevel'];

const normalizeAchievements = (value) => {
  const raw = typeof value?.toObject === 'function' ? value.toObject() : value || {};
  return Object.fromEntries(ACHIEVEMENT_KEYS.map((key) => [key, Boolean(raw[key])]));
};

export const getLeaderboard = async () => {
  const playedSince = new Date(Date.now() - environment.leaderboardMaxAgeDays * 86400000);
  const users = await findUsersWithScore({ playedSince });

  return users
    .sort((a, b) => {
      if (b.rhythmGame.peakPLevel !== a.rhythmGame.peakPLevel) {
        return b.rhythmGame.peakPLevel - a.rhythmGame.peakPLevel;
      }
      return (
        difficultyRank[b.rhythmGame.difficulty || 'normal'] -
        difficultyRank[a.rhythmGame.difficulty || 'normal']
      );
    })
    .map((user, index) => ({
      _id: user._id,
      username: user.username,
      rank: index + 1,
      rhythmGame: {
        peakPLevel: user.rhythmGame.peakPLevel,
        difficulty: user.rhythmGame.difficulty || 'normal',
        lastPlayed: user.rhythmGame.lastPlayed || null,
      },
    }));
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

  // Not a new peak, but the player is still active — keep their existing
  // best score visible on the recency-filtered leaderboard by refreshing
  // lastPlayed instead of leaving it pinned to whenever they set that peak.
  await updateUserRhythm(userId, {
    peakPLevel: user.rhythmGame.peakPLevel,
    difficulty: user.rhythmGame.difficulty,
    lastPlayed: new Date(),
  });
  return { peakPLevel: user.rhythmGame.peakPLevel, difficulty: user.rhythmGame.difficulty };
};

export const updateUserAchievements = async ({ userId, rawBody }) => {
  if (!userId) throw ApiError.unauthorized('Authentication required to save achievements');

  const { achievements } = validate(updateAchievementsSchema, rawBody);

  const user = await findUserById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const merged = normalizeAchievements(user.rhythmGame?.achievements);
  for (const key of ACHIEVEMENT_KEYS) {
    if (achievements[key]) merged[key] = true;
  }

  await updateUserRhythm(userId, { achievements: merged });
  return { achievements: merged };
};

export const getUserStats = async (userId) => {
  if (!userId) return { peakPLevel: 0, difficulty: 'normal', anonymous: true };

  const user = await findUserById(userId);
  if (!user) throw ApiError.notFound('User not found');

  return {
    peakPLevel: user.rhythmGame?.peakPLevel || 0,
    difficulty: user.rhythmGame?.difficulty || 'normal',
    lastPlayed: user.rhythmGame?.lastPlayed,
    achievements: normalizeAchievements(user.rhythmGame?.achievements),
  };
};
