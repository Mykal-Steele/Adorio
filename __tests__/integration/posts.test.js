const axios = require('axios');
const { BASE_URL, waitForBackend, makeCredentials } = require('./helpers');

describe('Posts API', () => {
  const creds = makeCredentials();
  let accessToken = null;
  let userId = null;
  let createdPostId = null;

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

  // ── Unauthenticated guards ────────────────────────────────────────────────

  describe('Unauthenticated guards', () => {
    test('POST /api/posts without token returns 401', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/posts`,
        { title: 'Test', content: 'test' },
        { validateStatus: null },
      );
      expect(res.status).toBe(401);
    });

    test('PUT /api/posts/:id/like without token returns 401', async () => {
      const res = await axios.put(
        `${BASE_URL}/api/posts/000000000000000000000000/like`,
        {},
        { validateStatus: null },
      );
      expect(res.status).toBe(401);
    });

    test('POST /api/posts/:id/comment without token returns 401', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/posts/000000000000000000000000/comment`,
        { text: 'test' },
        { validateStatus: null },
      );
      expect(res.status).toBe(401);
    });
  });

  // ── Public read ───────────────────────────────────────────────────────────

  describe('Public read', () => {
    test('GET /api/posts returns posts array with pagination meta', async () => {
      const res = await axios.get(`${BASE_URL}/api/posts`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.posts)).toBe(true);
      expect(typeof res.data.totalPosts).toBe('number');
      expect(typeof res.data.currentPage).toBe('number');
      expect(typeof res.data.totalPages).toBe('number');
      expect(typeof res.data.hasMore).toBe('boolean');
      if (res.data.posts.length > 0) {
        const post = res.data.posts[0];
        expect(post).toHaveProperty('_id');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('user');
      }
    });

    test('GET /api/posts respects ?limit param', async () => {
      const res = await axios.get(`${BASE_URL}/api/posts?limit=2&page=1`);
      expect(res.status).toBe(200);
      expect(res.data.posts.length).toBeLessThanOrEqual(2);
    });

    test('GET /api/posts/:id with a non-existent ID returns 404', async () => {
      const res = await axios.get(`${BASE_URL}/api/posts/000000000000000000000000`, {
        validateStatus: null,
      });
      expect(res.status).toBe(404);
    });

    test('GET /api/posts/:id with a malformed ID returns an error', async () => {
      const res = await axios.get(`${BASE_URL}/api/posts/not-a-valid-id`, {
        validateStatus: null,
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ── Sad paths with auth ───────────────────────────────────────────────────

  describe('Sad paths with auth', () => {
    test('PUT /api/posts/:id/like on non-existent post returns 404', async () => {
      const res = await axios.put(
        `${BASE_URL}/api/posts/000000000000000000000000/like`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          validateStatus: null,
        },
      );
      expect(res.status).toBe(404);
    });

    test('POST /api/posts/:id/comment on non-existent post returns 404', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/posts/000000000000000000000000/comment`,
        { text: 'comment on ghost post' },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          validateStatus: null,
        },
      );
      expect(res.status).toBe(404);
    });
  });

  // ── Full flow ─────────────────────────────────────────────────────────────

  describe('Full flow: create → read → like → comment', () => {
    test('POST /api/posts creates a post and returns it', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/posts`,
        { title: 'Integration Test Post', content: 'Created by integration test suite.' },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('_id');
      expect(res.data.content).toBe('Created by integration test suite.');
      createdPostId = res.data._id;
    });

    test('GET /api/posts/:id returns the created post', async () => {
      const res = await axios.get(`${BASE_URL}/api/posts/${createdPostId}`);
      expect(res.status).toBe(200);
      expect(res.data._id).toBe(createdPostId);
      expect(res.data.content).toBe('Created by integration test suite.');
    });

    test('PUT /api/posts/:id/like toggles like and verifies count changes', async () => {
      const like = await axios.put(
        `${BASE_URL}/api/posts/${createdPostId}/like`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      expect(like.status).toBe(200);
      expect(like.data.action).toBe('liked');
      expect(like.data.likes.length).toBe(1);

      const unlike = await axios.put(
        `${BASE_URL}/api/posts/${createdPostId}/like`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      expect(unlike.status).toBe(200);
      expect(unlike.data.action).toBe('unliked');
      expect(unlike.data.likes.length).toBe(0);
    });

    test('POST /api/posts/:id/comment adds a comment to the post', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/posts/${createdPostId}/comment`,
        { text: 'Test comment from integration suite.' },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      expect(res.status).toBe(201);
      const found = res.data.comments?.some(
        (c) => c.text === 'Test comment from integration suite.',
      );
      expect(found).toBe(true);
    });
  });

  // ── Input validation ──────────────────────────────────────────────────────

  describe('Input validation', () => {
    test('POST /api/posts with missing content returns 400', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/posts`,
        { title: 'No content here' },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          validateStatus: null,
        },
      );
      expect(res.status).toBe(400);
    });

    test('POST /api/posts/:id/comment with empty text returns 400', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/posts/${createdPostId}/comment`,
        { text: '' },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          validateStatus: null,
        },
      );
      expect(res.status).toBe(400);
    });
  });
});
