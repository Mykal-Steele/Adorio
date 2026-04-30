import API, { request } from './index';

const leaderboardFallback = [];
const anonymousScoreFallback = {
  anonymous: true,
  localScore: true,
};
const anonymousStatsFallback = {
  peakPLevel: 0,
  difficulty: 'normal',
  anonymous: true,
};

export const fetchLeaderboard = async () => {
  try {
    return await request(API.get('/game/leaderboard'));
  } catch {
    return leaderboardFallback;
  }
};

export const updateScore = async (score, difficulty) => {
  try {
    return await request(API.post('/game/update-score', { score, difficulty }));
  } catch {
    return anonymousScoreFallback;
  }
};

export const fetchUserGameStats = async () => {
  try {
    return await request(API.get('/game/user-stats'));
  } catch (error) {
    if (error?.statusCode === 401 && process.env.NODE_ENV !== 'production') {
      console.log('User not authenticated, using local stats');
    }

    return anonymousStatsFallback;
  }
};
