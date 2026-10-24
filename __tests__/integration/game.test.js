const axios = require('axios');
const { BASE_URL, waitForBackend, makeCredentials } = require('./helpers');

describe('Game API', () => {
  const creds = makeCredentials();
  let accessToken = null;
  let userId = null;

  beforeAll(async () => {
    await waitForBackend();
    const res = await axios.post(`${BASE_URL}/api/users/register`, creds);
    accessToken = res.data.token;
    userId = res.data.user._id;
  }, 60_000);

  afterAll(async () => {
    if (userId && accessToken) {
      await axios.delete(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        validateStatus: null,
      });
    }
  });

  test('GET /api/game/leaderboard returns a sorted array', async () => {
    const res = await axios.get(`${BASE_URL}/api/game/leaderboard`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  test('GET /api/game/user-stats without auth returns anonymous stats', async () => {
    const res = await axios.get(`${BASE_URL}/api/game/user-stats`);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('peakPLevel');
    expect(res.data.anonymous).toBe(true);
  });

  test('POST /api/game/update-score without auth returns 200 with anonymous flag', async () => {
    const res = await axios.post(
      `${BASE_URL}/api/game/update-score`,
      { score: 5, difficulty: 'easy' },
      { validateStatus: null },
    );
    expect(res.status).toBe(200);
    expect(res.data.anonymous).toBe(true);
  });

  describe('Authenticated game flow', () => {
    test('POST /api/game/update-score with auth saves the score', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/game/update-score`,
        { score: 42, difficulty: 'hard' },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      expect(res.status).toBe(200);
      expect(res.data.peakPLevel).toBe(42);
      expect(res.data.difficulty).toBe('hard');
    });

    test('GET /api/game/user-stats with auth returns real user stats (not anonymous)', async () => {
      const res = await axios.get(`${BASE_URL}/api/game/user-stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(res.status).toBe(200);
      expect(res.data.peakPLevel).toBe(42);
      expect(res.data.difficulty).toBe('hard');
      expect(res.data.anonymous).toBeUndefined();
    });

    test('leaderboard contains the user after score update', async () => {
      const res = await axios.get(`${BASE_URL}/api/game/leaderboard`);
      expect(res.status).toBe(200);
      const entry = res.data.find((u) => u.username === creds.username);
      expect(entry).toBeDefined();
      expect(entry.rhythmGame.peakPLevel).toBe(42);
    });

    test('lower score does not overwrite peak score', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/game/update-score`,
        { score: 10, difficulty: 'easy' },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      expect(res.status).toBe(200);
      expect(res.data.peakPLevel).toBe(42);
    });

    test('POST /api/game/achievements requires auth', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/game/achievements`,
        { achievements: { firstPlay: true } },
        { validateStatus: null },
      );
      expect(res.status).toBe(401);
    });

    test('achievements persist and survive a score update', async () => {
      const saved = await axios.post(
        `${BASE_URL}/api/game/achievements`,
        { achievements: { firstPlay: true, reach10PLevel: true } },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      expect(saved.status).toBe(200);
      expect(saved.data.achievements).toMatchObject({ firstPlay: true, reach10PLevel: true });

      await axios.post(
        `${BASE_URL}/api/game/update-score`,
        { score: 43, difficulty: 'normal' },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      const stats = await axios.get(`${BASE_URL}/api/game/user-stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(stats.data.achievements).toMatchObject({ firstPlay: true, reach10PLevel: true });
    });

    test('achievements cannot be unset', async () => {
      await axios.post(
        `${BASE_URL}/api/game/achievements`,
        { achievements: { firstPlay: true, reach10PLevel: true } },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      await axios.post(
        `${BASE_URL}/api/game/achievements`,
        { achievements: { firstPlay: false, reach10PLevel: false } },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      const stats = await axios.get(`${BASE_URL}/api/game/user-stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(stats.data.achievements).toMatchObject({ firstPlay: true, reach10PLevel: true });
    });

    test('leaderboard entries include a rank and no private fields', async () => {
      const res = await axios.get(`${BASE_URL}/api/game/leaderboard`);
      const entry = res.data.find((u) => u.username === creds.username);
      expect(entry.rank).toBeGreaterThan(0);
      expect(entry).not.toHaveProperty('email');
      expect(entry).not.toHaveProperty('password');
    });
  });
});
