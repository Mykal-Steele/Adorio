import {
  registerSchema,
  loginSchema,
  createPostSchema,
  addCommentSchema,
  getPostsQuerySchema,
  updateScoreSchema,
  createSecretSchema,
  pageViewsQuerySchema,
  recentVisitsQuerySchema,
  visitorStatsQuerySchema,
} from '../../backend/schemas/index.js';

const pass = (schema, data) => expect(schema.safeParse(data).success).toBe(true);
const fail = (schema, data) => expect(schema.safeParse(data).success).toBe(false);

// ── registerSchema ─────────────────────────────────────────────────────────────

describe('registerSchema', () => {
  const base = { username: 'alice_1', email: 'alice@example.com', password: 'pass123' };

  test('accepts valid registration data', () => pass(registerSchema, base));
  test('accepts username at min length (3 chars)', () =>
    pass(registerSchema, { ...base, username: 'abc' }));
  test('accepts username at max length (20 chars)', () =>
    pass(registerSchema, { ...base, username: 'a'.repeat(20) }));
  test('accepts username with underscores', () =>
    pass(registerSchema, { ...base, username: 'my_user_1' }));

  test('rejects username shorter than 3 chars', () =>
    fail(registerSchema, { ...base, username: 'ab' }));
  test('rejects username longer than 20 chars', () =>
    fail(registerSchema, { ...base, username: 'a'.repeat(21) }));
  test('rejects username with spaces', () =>
    fail(registerSchema, { ...base, username: 'alice bob' }));
  test('rejects username with special chars', () =>
    fail(registerSchema, { ...base, username: 'alice!' }));
  test('rejects username with hyphen', () =>
    fail(registerSchema, { ...base, username: 'alice-bob' }));

  test('rejects invalid email format', () =>
    fail(registerSchema, { ...base, email: 'not-an-email' }));
  test('rejects email without domain', () => fail(registerSchema, { ...base, email: 'user@' }));
  test('rejects email longer than 254 chars', () =>
    fail(registerSchema, { ...base, email: 'a'.repeat(248) + '@b.com' }));

  test('rejects empty password', () => fail(registerSchema, { ...base, password: '' }));
  test('rejects missing fields', () => fail(registerSchema, {}));
});

// ── loginSchema ────────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  test('accepts valid email and password', () =>
    pass(loginSchema, { email: 'a@b.com', password: 'pass' }));
  test('rejects empty email', () => fail(loginSchema, { email: '', password: 'pass' }));
  test('rejects empty password', () => fail(loginSchema, { email: 'a@b.com', password: '' }));
  test('rejects missing email', () => fail(loginSchema, { password: 'pass' }));
  test('rejects missing password', () => fail(loginSchema, { email: 'a@b.com' }));
  test('rejects empty object', () => fail(loginSchema, {}));
});

// ── createPostSchema ───────────────────────────────────────────────────────────

describe('createPostSchema', () => {
  const base = { title: 'Hello World', content: 'Some content here' };

  test('accepts valid post data', () => pass(createPostSchema, base));
  test('accepts title at max length (200 chars)', () =>
    pass(createPostSchema, { ...base, title: 'x'.repeat(200) }));
  test('accepts content at max length (50000 chars)', () =>
    pass(createPostSchema, { ...base, content: 'x'.repeat(50000) }));

  test('rejects empty title', () => fail(createPostSchema, { ...base, title: '' }));
  test('rejects title over 200 chars', () =>
    fail(createPostSchema, { ...base, title: 'x'.repeat(201) }));
  test('rejects empty content', () => fail(createPostSchema, { ...base, content: '' }));
  test('rejects content over 50000 chars', () =>
    fail(createPostSchema, { ...base, content: 'x'.repeat(50001) }));
  test('rejects missing title', () => fail(createPostSchema, { content: 'hi' }));
  test('rejects missing content', () => fail(createPostSchema, { title: 'hi' }));
});

// ── addCommentSchema ───────────────────────────────────────────────────────────

describe('addCommentSchema', () => {
  test('accepts non-empty text', () => pass(addCommentSchema, { text: 'nice post!' }));
  test('accepts text at max length (5000 chars)', () =>
    pass(addCommentSchema, { text: 'x'.repeat(5000) }));
  test('rejects empty text', () => fail(addCommentSchema, { text: '' }));
  test('rejects text over 5000 chars', () => fail(addCommentSchema, { text: 'x'.repeat(5001) }));
  test('rejects missing text field', () => fail(addCommentSchema, {}));
});

// ── getPostsQuerySchema ────────────────────────────────────────────────────────

describe('getPostsQuerySchema', () => {
  test('defaults page to 1 and limit to 5 when empty', () => {
    const r = getPostsQuerySchema.safeParse({});
    expect(r.success).toBe(true);
    expect(r.data.page).toBe(1);
    expect(r.data.limit).toBe(5);
  });

  test('coerces string numbers', () => {
    const r = getPostsQuerySchema.safeParse({ page: '3', limit: '10' });
    expect(r.success).toBe(true);
    expect(r.data.page).toBe(3);
    expect(r.data.limit).toBe(10);
  });

  test('accepts limit at max (50)', () => pass(getPostsQuerySchema, { limit: 50 }));
  test('rejects limit over 50', () => fail(getPostsQuerySchema, { limit: 51 }));
  test('rejects page 0', () => fail(getPostsQuerySchema, { page: 0 }));
  test('rejects negative page', () => fail(getPostsQuerySchema, { page: -1 }));
});

// ── updateScoreSchema ──────────────────────────────────────────────────────────

describe('updateScoreSchema', () => {
  test('accepts score and valid difficulty', () =>
    pass(updateScoreSchema, { score: 42, difficulty: 'normal' }));
  test('accepts score of 0 (non-negative boundary)', () =>
    pass(updateScoreSchema, { score: 0, difficulty: 'easy' }));
  test('accepts all three difficulty values', () => {
    pass(updateScoreSchema, { score: 1, difficulty: 'easy' });
    pass(updateScoreSchema, { score: 1, difficulty: 'normal' });
    pass(updateScoreSchema, { score: 1, difficulty: 'hard' });
  });

  test('rejects negative score', () => fail(updateScoreSchema, { score: -1, difficulty: 'easy' }));
  test('rejects invalid difficulty', () =>
    fail(updateScoreSchema, { score: 10, difficulty: 'extreme' }));
  test('rejects non-numeric score', () =>
    fail(updateScoreSchema, { score: 'high', difficulty: 'easy' }));
  test('rejects missing score', () => fail(updateScoreSchema, { difficulty: 'easy' }));
  test('rejects missing difficulty', () => fail(updateScoreSchema, { score: 10 }));
});

// ── createSecretSchema ─────────────────────────────────────────────────────────

describe('createSecretSchema', () => {
  test('accepts message and password', () =>
    pass(createSecretSchema, { message: 'hello', password: 'pw' }));
  test('rejects empty message', () => fail(createSecretSchema, { message: '', password: 'pw' }));
  test('rejects empty password', () => fail(createSecretSchema, { message: 'hi', password: '' }));
  test('rejects missing fields', () => fail(createSecretSchema, {}));
});

// ── pageViewsQuerySchema ───────────────────────────────────────────────────────

describe('pageViewsQuerySchema', () => {
  test('accepts empty query (all optional)', () => pass(pageViewsQuerySchema, {}));
  test('accepts all optional fields', () => {
    pass(pageViewsQuerySchema, {
      start: '2024-01-01',
      end: '2024-12-31',
      path: '/home',
      limit: 10,
      timezone: 'UTC',
    });
  });
  test('rejects limit over 500', () => fail(pageViewsQuerySchema, { limit: 501 }));
  test('rejects negative limit', () => fail(pageViewsQuerySchema, { limit: -1 }));
});

// ── recentVisitsQuerySchema ────────────────────────────────────────────────────

describe('recentVisitsQuerySchema', () => {
  test('accepts empty query', () => pass(recentVisitsQuerySchema, {}));
  test('accepts limit and visitorId', () =>
    pass(recentVisitsQuerySchema, { limit: 20, visitorId: 'abc123' }));
  test('rejects limit over 500', () => fail(recentVisitsQuerySchema, { limit: 501 }));
});

// ── visitorStatsQuerySchema ────────────────────────────────────────────────────

describe('visitorStatsQuerySchema', () => {
  test('accepts empty query', () => pass(visitorStatsQuerySchema, {}));
  test('accepts deduplicate=true', () => pass(visitorStatsQuerySchema, { deduplicate: 'true' }));
  test('accepts deduplicate=false', () => pass(visitorStatsQuerySchema, { deduplicate: 'false' }));
  test('rejects deduplicate=yes', () => fail(visitorStatsQuerySchema, { deduplicate: 'yes' }));
  test('rejects limit over 500', () => fail(visitorStatsQuerySchema, { limit: 501 }));
});
