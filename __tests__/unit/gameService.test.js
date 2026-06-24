import { mock, beforeEach } from 'bun:test';

// ── module mocks ───────────────────────────────────────────────────────────────

const mockFindUsersWithScore = mock(() => Promise.resolve([]));
const mockFindUserById = mock(() => Promise.resolve(null));
const mockUpdateUserRhythm = mock(() => Promise.resolve());

mock.module('../../backend/models/index.js', () => ({
  findUsersWithScore: mockFindUsersWithScore,
  findUserById: mockFindUserById,
  updateUserRhythm: mockUpdateUserRhythm,
}));

const { getLeaderboard, updateUserScore, getUserStats } =
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

  test('does NOT update the score when new score is lower than current peak', async () => {
    mockFindUserById.mockImplementation(() =>
      Promise.resolve({ rhythmGame: { peakPLevel: 200, difficulty: 'hard' } }),
    );
    mockUpdateUserRhythm.mockClear();
    const result = await updateUserScore({
      userId: 'u1',
      rawBody: { score: 50, difficulty: 'easy' },
    });
    expect(mockUpdateUserRhythm).not.toHaveBeenCalled();
    expect(result.peakPLevel).toBe(200);
    expect(result.difficulty).toBe('hard');
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
});
