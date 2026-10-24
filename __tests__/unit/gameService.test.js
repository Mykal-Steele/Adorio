import { describe, test, expect, mock, beforeEach } from 'bun:test';

// ── module mocks ───────────────────────────────────────────────────────────────

const mockFindUsersWithScore = mock(() => Promise.resolve([]));
const mockFindUserById = mock(() => Promise.resolve(null));
const mockUpdateUserRhythm = mock(() => Promise.resolve());

mock.module('../../backend/models/index.js', () => ({
  findUsersWithScore: mockFindUsersWithScore,
  findUserById: mockFindUserById,
  updateUserRhythm: mockUpdateUserRhythm,
}));

const { getLeaderboard, updateUserScore, updateUserAchievements, getUserStats } =
  await import('../../backend/services/gameService.js');

// ── getLeaderboard ─────────────────────────────────────────────────────────────

describe('getLeaderboard', () => {
  test('sorts users by peakPLevel descending', async () => {
    mockFindUsersWithScore.mockImplementation(() =>
      Promise.resolve([
        { username: 'alice', rhythmGame: { peakPLevel: 50, difficulty: 'normal' } },
        { username: 'bob', rhythmGame: { peakPLevel: 100, difficulty: 'normal' } },
        { username: 'carol', rhythmGame: { peakPLevel: 75, difficulty: 'normal' } },
      ]),
    );
    const result = await getLeaderboard();
    expect(result[0].username).toBe('bob');
    expect(result[1].username).toBe('carol');
    expect(result[2].username).toBe('alice');
  });

  test('breaks peakPLevel ties by difficulty: hard > normal > easy', async () => {
    mockFindUsersWithScore.mockImplementation(() =>
      Promise.resolve([
        { username: 'easy_player', rhythmGame: { peakPLevel: 100, difficulty: 'easy' } },
        { username: 'hard_player', rhythmGame: { peakPLevel: 100, difficulty: 'hard' } },
        { username: 'normal_player', rhythmGame: { peakPLevel: 100, difficulty: 'normal' } },
      ]),
    );
    const result = await getLeaderboard();
    expect(result[0].username).toBe('hard_player');
    expect(result[1].username).toBe('normal_player');
    expect(result[2].username).toBe('easy_player');
  });

  test('returns empty array when no scored users exist', async () => {
    mockFindUsersWithScore.mockImplementation(() => Promise.resolve([]));
    const result = await getLeaderboard();
    expect(result).toEqual([]);
  });

  test('adds rank and strips private fields', async () => {
    mockFindUsersWithScore.mockImplementation(() =>
      Promise.resolve([
        {
          _id: 'a',
          username: 'alice',
          email: 'a@a.com',
          rhythmGame: { peakPLevel: 60, difficulty: 'hard', lastPlayed: new Date() },
        },
        { _id: 'b', username: 'bob', rhythmGame: { peakPLevel: 30, difficulty: 'easy' } },
      ]),
    );
    const result = await getLeaderboard();
    expect(result[0]).toEqual({
      _id: 'a',
      username: 'alice',
      rank: 1,
      rhythmGame: {
        peakPLevel: 60,
        difficulty: 'hard',
        lastPlayed: expect.any(Date),
      },
    });
    expect(result[1].rank).toBe(2);
    expect(result[0]).not.toHaveProperty('email');
  });
});

// ── updateUserScore ────────────────────────────────────────────────────────────

describe('updateUserScore', () => {
  beforeEach(() => {
    mockFindUserById.mockImplementation(() => Promise.resolve(null));
    mockUpdateUserRhythm.mockImplementation(() => Promise.resolve());
  });

  test('throws 401 when userId is not provided', async () => {
    let caught;
    try {
      await updateUserScore({ userId: null, rawBody: { score: 10, difficulty: 'easy' } });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(401);
  });

  test('throws 400 for invalid difficulty value', async () => {
    let caught;
    try {
      await updateUserScore({ userId: 'u1', rawBody: { score: 10, difficulty: 'extreme' } });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
  });

  test('throws 400 for negative score', async () => {
    let caught;
    try {
      await updateUserScore({ userId: 'u1', rawBody: { score: -1, difficulty: 'easy' } });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
  });

  test('throws 404 when user is not found', async () => {
    mockFindUserById.mockImplementation(() => Promise.resolve(null));
    let caught;
    try {
      await updateUserScore({ userId: 'nonexistent', rawBody: { score: 10, difficulty: 'easy' } });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(404);
  });

  test('updates the score when new score exceeds current peak', async () => {
    mockFindUserById.mockImplementation(() =>
      Promise.resolve({ rhythmGame: { peakPLevel: 50, difficulty: 'easy' } }),
    );
    const result = await updateUserScore({
      userId: 'u1',
      rawBody: { score: 100, difficulty: 'hard' },
    });
    expect(mockUpdateUserRhythm).toHaveBeenCalled();
    expect(result.peakPLevel).toBe(100);
    expect(result.difficulty).toBe('hard');
  });

  test('keeps the peak when a lower score is submitted but refreshes activity', async () => {
    mockFindUserById.mockImplementation(() =>
      Promise.resolve({ rhythmGame: { peakPLevel: 200, difficulty: 'hard' } }),
    );
    mockUpdateUserRhythm.mockClear();
    const result = await updateUserScore({
      userId: 'u1',
      rawBody: { score: 50, difficulty: 'easy' },
    });
    expect(mockUpdateUserRhythm).toHaveBeenCalled();
    expect(result.peakPLevel).toBe(200);
    expect(result.difficulty).toBe('hard');
  });

  test('rejects fractional scores', async () => {
    mockFindUserById.mockImplementation(() => Promise.resolve({ rhythmGame: null }));
    let caught;
    try {
      await updateUserScore({ userId: 'u1', rawBody: { score: 1.5, difficulty: 'easy' } });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
  });

  test('updates when user has no prior rhythm game data', async () => {
    mockFindUserById.mockImplementation(() => Promise.resolve({ rhythmGame: null }));
    const result = await updateUserScore({
      userId: 'u1',
      rawBody: { score: 10, difficulty: 'normal' },
    });
    expect(mockUpdateUserRhythm).toHaveBeenCalled();
    expect(result.peakPLevel).toBe(10);
  });
});

// ── getUserStats ───────────────────────────────────────────────────────────────

describe('getUserStats', () => {
  test('returns anonymous stats when userId is null', async () => {
    const result = await getUserStats(null);
    expect(result.anonymous).toBe(true);
    expect(result.peakPLevel).toBe(0);
  });

  test('throws 404 when user does not exist', async () => {
    mockFindUserById.mockImplementation(() => Promise.resolve(null));
    let caught;
    try {
      await getUserStats('nonexistent');
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(404);
  });

  test('returns peakPLevel and difficulty for an existing user', async () => {
    mockFindUserById.mockImplementation(() =>
      Promise.resolve({
        rhythmGame: { peakPLevel: 150, difficulty: 'hard', lastPlayed: new Date() },
      }),
    );
    const result = await getUserStats('u1');
    expect(result.peakPLevel).toBe(150);
    expect(result.difficulty).toBe('hard');
    expect(result).not.toHaveProperty('anonymous');
  });

  test('defaults to 0 and normal when user has no rhythmGame data', async () => {
    mockFindUserById.mockImplementation(() => Promise.resolve({ rhythmGame: null }));
    const result = await getUserStats('u1');
    expect(result.peakPLevel).toBe(0);
    expect(result.difficulty).toBe('normal');
  });

  test('includes default achievement flags', async () => {
    mockFindUserById.mockImplementation(() => Promise.resolve({ rhythmGame: null }));
    const result = await getUserStats('u1');
    expect(result.achievements).toEqual({
      firstPlay: false,
      reach10PLevel: false,
      reach25PLevel: false,
      reach50PLevel: false,
    });
  });
});

// ── updateUserAchievements ─────────────────────────────────────────────────────

describe('updateUserAchievements', () => {
  beforeEach(() => {
    mockFindUserById.mockImplementation(() => Promise.resolve(null));
    mockUpdateUserRhythm.mockImplementation(() => Promise.resolve());
    mockUpdateUserRhythm.mockClear();
  });

  test('requires auth', async () => {
    let caught;
    try {
      await updateUserAchievements({ userId: null, rawBody: { achievements: {} } });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(401);
  });

  test('throws 404 when user is not found', async () => {
    let caught;
    try {
      await updateUserAchievements({
        userId: 'nonexistent',
        rawBody: { achievements: { firstPlay: true } },
      });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(404);
  });

  test('rejects unknown achievement keys', async () => {
    mockFindUserById.mockImplementation(() => Promise.resolve({ rhythmGame: null }));
    let caught;
    try {
      await updateUserAchievements({
        userId: 'u1',
        rawBody: { achievements: { hacked: true } },
      });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
  });

  test('merges new unlocks without ever unsetting existing one', async () => {
    mockFindUserById.mockImplementation(() =>
      Promise.resolve({ rhythmGame: { achievements: { firstPlay: true } } }),
    );

    const result = await updateUserAchievements({
      userId: 'u1',
      rawBody: { achievements: { firstPlay: false, reach10PLevel: true } },
    });

    expect(result.achievements).toEqual({
      firstPlay: true,
      reach10PLevel: true,
      reach25PLevel: false,
      reach50PLevel: false,
    });
    expect(mockUpdateUserRhythm).toHaveBeenCalledWith('u1', {
      'achievements.reach10PLevel': true,
    });
  });

  test('skips the write when no new achievement is unlocked', async () => {
    mockFindUserById.mockImplementation(() =>
      Promise.resolve({ rhythmGame: { achievements: { firstPlay: true } } }),
    );

    const result = await updateUserAchievements({
      userId: 'u1',
      rawBody: { achievements: { firstPlay: true } },
    });

    expect(result.achievements.firstPlay).toBe(true);
    expect(mockUpdateUserRhythm).not.toHaveBeenCalled();
  });
});
