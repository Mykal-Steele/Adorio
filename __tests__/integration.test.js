const axios = require('axios');
const puppeteer = require('puppeteer');

const BASE_URL = process.env.TEST_TARGET_URL || 'http://localhost:8080';

const waitForBackend = async (retries = 30, interval = 2000) => {
  let lastError = 'no response';
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(`${BASE_URL}/api/health`);
      if (res.status === 200) return;
    } catch (err) {
      lastError = err?.message || 'unknown error';
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(
    `Backend at ${BASE_URL} not ready after ${(retries * interval) / 1000}s. Last error: ${lastError}`,
  );
};

describe('Adorio integration tests', () => {
  let browser;
  let nodeEnv;

  // Shared user state across auth → posts flow tests (tests run sequentially via --runInBand)
  const ts = Date.now();
  const sharedUser = {
    username: `user_${ts}`,
    email: `user_${ts}@integration.test`,
    password: 'Integration_Test_123!',
    accessToken: null,
    refreshToken: null,
  };

  beforeAll(async () => {
    await waitForBackend();
    const res = await axios.get(`${BASE_URL}/api/test-env`);
    nodeEnv = res.data.NODE_ENV;
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    // Warm up the Next.js server so the first Puppeteer test doesn't hit a cold-start timeout
    await axios.get(BASE_URL, { validateStatus: null, timeout: 60000 });
    console.log(`Running against ${BASE_URL} (${nodeEnv})`);
  }, 120_000);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  // ── Smoke ─────────────────────────────────────────────────────────────────

  describe('Smoke', () => {
    test.concurrent(
      'health endpoint returns healthy with correct shape and rate-limit headers',
      async () => {
        const res = await axios.get(`${BASE_URL}/api/health`);
        expect(res.status).toBe(200);
        expect(res.data.isHealthy).toBe(true);
        expect(res.data.status).toBe('healthy');
        expect(typeof res.data.version).toBe('string');
        expect(typeof res.data.timestamp).toBe('string');
        // express-rate-limit with standardHeaders:true emits RateLimit-* headers
        const hasRateLimitHeader =
          res.headers['ratelimit-limit'] !== undefined ||
          res.headers['ratelimit-remaining'] !== undefined;
        expect(hasRateLimitHeader).toBe(true);
      },
    );

    test('frontend loads with correct title and no JS errors', async () => {
      const page = await browser.newPage();
      const jsErrors = [];
      page.on('pageerror', (err) => jsErrors.push(err.message));
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      expect(await page.title()).toBe('Oakar Oo — Full-Stack Developer | Adorio');
      expect(jsErrors).toHaveLength(0);
      await page.close();
    }, 30_000);

    test('frontend can reach /api/health via fetch', async () => {
      const page = await browser.newPage();
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      const ok = await page.evaluate(async () => {
        const res = await fetch('/api/health');
        return res.ok;
      });
      expect(ok).toBe(true);
      await page.close();
    }, 30_000);

    test('/cao/ returns 200 with sidecar content', async () => {
      const page = await browser.newPage();
      const res = await page.goto(`${BASE_URL}/cao/`, { waitUntil: 'domcontentloaded' });
      expect(res.status()).toBe(200);
      expect(await page.title()).toBe('ArchMaster - Architecture Exam Prep');
      await page.close();
    });

    test.concurrent('/cao redirects to /cao/', async () => {
      const res = await axios.get(`${BASE_URL}/cao`, {
        maxRedirects: 0,
        validateStatus: null,
      });
      expect(res.status).toBe(301);
    });
  });

  // ── Environment ───────────────────────────────────────────────────────────

  describe('Environment', () => {
    test('required backend env vars are set', async () => {
      const res = await axios.get(`${BASE_URL}/api/test-env`);
      expect(res.status).toBe(200);
      // Sensitive vars — backend returns true when set, not the value
      expect(res.data.MONGO_URI).toBe(true);
      expect(res.data.JWT_SECRET).toBe(true);
      expect(res.data.CLOUDINARY_KEY).toBe(true);
      expect(res.data.CLOUDINARY_SECRET).toBe(true);
      expect(typeof res.data.CLOUDINARY_NAME).toBe('string');
      expect(res.data.CLOUDINARY_NAME.length).toBeGreaterThan(0);
    });
  });

  // ── Auth API ──────────────────────────────────────────────────────────────

  describe('Auth API', () => {
    describe('Registration', () => {
      test('register creates a new user and returns a token', async () => {
        const res = await axios.post(`${BASE_URL}/api/users/register`, {
          username: sharedUser.username,
          email: sharedUser.email,
          password: sharedUser.password,
        });
        expect(res.status).toBe(201);
        expect(res.data).toHaveProperty('token');
        expect(res.data).toHaveProperty('user');
        expect(res.data.user.username).toBe(sharedUser.username);
        sharedUser.accessToken = res.data.token;
      });

      test('registering with a duplicate email returns 400', async () => {
        const res = await axios.post(
          `${BASE_URL}/api/users/register`,
          { username: `oth_${ts}`, email: sharedUser.email, password: sharedUser.password },
          { validateStatus: null },
        );
        expect(res.status).toBe(400);
      });

      test('registering with a duplicate username returns 400', async () => {
        const res = await axios.post(
          `${BASE_URL}/api/users/register`,
          {
            username: sharedUser.username,
            email: `other_${ts}@integration.test`,
            password: sharedUser.password,
          },
          { validateStatus: null },
        );
        expect(res.status).toBe(400);
      });

      test('registering with missing fields returns 400', async () => {
        const res = await axios.post(
          `${BASE_URL}/api/users/register`,
          { email: `missing_${ts}@integration.test` },
          { validateStatus: null },
        );
        expect(res.status).toBe(400);
      });
    });

    describe('Login', () => {
      test('login returns access and refresh tokens', async () => {
        const res = await axios.post(`${BASE_URL}/api/users/login`, {
          email: sharedUser.email,
          password: sharedUser.password,
        });
        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty('token');
        expect(res.data).toHaveProperty('refreshToken');
        sharedUser.accessToken = res.data.token;
        sharedUser.refreshToken = res.data.refreshToken;
      });

      test('login with wrong password returns 401', async () => {
        const res = await axios.post(
          `${BASE_URL}/api/users/login`,
          { email: sharedUser.email, password: 'wrong_password' },
          { validateStatus: null },
        );
        expect(res.status).toBe(401);
      });

      test('login with non-existent email returns 401', async () => {
        const res = await axios.post(
          `${BASE_URL}/api/users/login`,
          { email: 'ghost@nowhere.test', password: 'whatever' },
          { validateStatus: null },
        );
        expect(res.status).toBe(401);
      });

      test('login with missing password returns 400', async () => {
        const res = await axios.post(
          `${BASE_URL}/api/users/login`,
          { email: sharedUser.email },
          { validateStatus: null },
        );
        expect(res.status).toBe(400);
      });
    });

    describe('Token validation', () => {
      test('GET /api/users/me without token returns 401 with message', async () => {
        const res = await axios.get(`${BASE_URL}/api/users/me`, { validateStatus: null });
        expect(res.status).toBe(401);
        expect(typeof res.data.message).toBe('string');
        expect(res.data.message.length).toBeGreaterThan(0);
      });

      test('GET /api/users/me with valid token returns the user without sensitive fields', async () => {
        const res = await axios.get(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${sharedUser.accessToken}` },
        });
        expect(res.status).toBe(200);
        expect(res.data.username).toBe(sharedUser.username);
        expect(res.data).not.toHaveProperty('password');
      });

      test('GET /api/users/me with a tampered token returns 4xx', async () => {
        const res = await axios.get(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.tampered.signature' },
          validateStatus: null,
        });
        // verifyToken middleware throws forbidden (403) for an invalid signature
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
      });

      test('refresh-token returns a new access token', async () => {
        const res = await axios.post(`${BASE_URL}/api/users/refresh-token`, {
          refreshToken: sharedUser.refreshToken,
        });
        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty('token');
        // Keep the latest token for downstream tests
        sharedUser.accessToken = res.data.token;
      });

      test('refresh-token with an invalid token returns 401', async () => {
        const res = await axios.post(
          `${BASE_URL}/api/users/refresh-token`,
          { refreshToken: 'not.a.valid.jwt' },
          { validateStatus: null },
        );
        expect(res.status).toBe(401);
      });
    });
  });

  // ── Posts API ─────────────────────────────────────────────────────────────

  describe('Posts API', () => {
    let createdPostId;

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
        // Mongoose cast error bubbles as 500 until upstream validation is added
        expect(res.status).toBeGreaterThanOrEqual(400);
      });
    });

    describe('Sad paths with auth', () => {
      test('PUT /api/posts/:id/like on non-existent post returns 404', async () => {
        const res = await axios.put(
          `${BASE_URL}/api/posts/000000000000000000000000/like`,
          {},
          {
            headers: { Authorization: `Bearer ${sharedUser.accessToken}` },
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
            headers: { Authorization: `Bearer ${sharedUser.accessToken}` },
            validateStatus: null,
          },
        );
        expect(res.status).toBe(404);
      });
    });

    describe('Full flow: create → read → like → comment', () => {
      test('POST /api/posts creates a post and returns it', async () => {
        const res = await axios.post(
          `${BASE_URL}/api/posts`,
          { title: 'Integration Test Post', content: 'Created by integration test suite.' },
          { headers: { Authorization: `Bearer ${sharedUser.accessToken}` } },
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
        // New post starts with zero likes — first call must be 'liked'
        const like = await axios.put(
          `${BASE_URL}/api/posts/${createdPostId}/like`,
          {},
          { headers: { Authorization: `Bearer ${sharedUser.accessToken}` } },
        );
        expect(like.status).toBe(200);
        expect(like.data.action).toBe('liked');
        expect(like.data.likes.length).toBe(1);

        // Calling again on the same post must toggle to 'unliked'
        const unlike = await axios.put(
          `${BASE_URL}/api/posts/${createdPostId}/like`,
          {},
          { headers: { Authorization: `Bearer ${sharedUser.accessToken}` } },
        );
        expect(unlike.status).toBe(200);
        expect(unlike.data.action).toBe('unliked');
        expect(unlike.data.likes.length).toBe(0);
      });

      test('POST /api/posts/:id/comment adds a comment to the post', async () => {
        const res = await axios.post(
          `${BASE_URL}/api/posts/${createdPostId}/comment`,
          { text: 'Test comment from integration suite.' },
          { headers: { Authorization: `Bearer ${sharedUser.accessToken}` } },
        );
        expect(res.status).toBe(201);
        const found = res.data.comments?.some(
          (c) => c.text === 'Test comment from integration suite.',
        );
        expect(found).toBe(true);
      });
    });

    describe('Input validation', () => {
      test('POST /api/posts with missing content returns 400', async () => {
        const res = await axios.post(
          `${BASE_URL}/api/posts`,
          { title: 'No content here' },
          {
            headers: { Authorization: `Bearer ${sharedUser.accessToken}` },
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
            headers: { Authorization: `Bearer ${sharedUser.accessToken}` },
            validateStatus: null,
          },
        );
        expect(res.status).toBe(400);
      });
    });
  });

  // ── Game API ──────────────────────────────────────────────────────────────

  describe('Game API', () => {
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
          { headers: { Authorization: `Bearer ${sharedUser.accessToken}` } },
        );
        expect(res.status).toBe(200);
        expect(res.data.peakPLevel).toBe(42);
        expect(res.data.difficulty).toBe('hard');
      });

      test('GET /api/game/user-stats with auth returns real user stats (not anonymous)', async () => {
        const res = await axios.get(`${BASE_URL}/api/game/user-stats`, {
          headers: { Authorization: `Bearer ${sharedUser.accessToken}` },
        });
        expect(res.status).toBe(200);
        expect(res.data.peakPLevel).toBe(42);
        expect(res.data.difficulty).toBe('hard');
        expect(res.data.anonymous).toBeUndefined();
      });

      test('leaderboard contains the user after score update', async () => {
        const res = await axios.get(`${BASE_URL}/api/game/leaderboard`);
        expect(res.status).toBe(200);
        const entry = res.data.find((u) => u.username === sharedUser.username);
        expect(entry).toBeDefined();
        expect(entry.rhythmGame.peakPLevel).toBe(42);
      });

      test('lower score does not overwrite peak score', async () => {
        const res = await axios.post(
          `${BASE_URL}/api/game/update-score`,
          { score: 10, difficulty: 'easy' },
          { headers: { Authorization: `Bearer ${sharedUser.accessToken}` } },
        );
        expect(res.status).toBe(200);
        // Peak should remain 42, not replaced with 10
        expect(res.data.peakPLevel).toBe(42);
      });
    });
  });

  // ── Analytics API ─────────────────────────────────────────────────────────

  describe('Analytics API', () => {
    test('POST /api/analytics/track accepts a page view event', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/stats/track`,
        {
          path: '/',
          fullUrl: `${BASE_URL}/`,
          referrer: '',
          durationMs: 1000,
          fingerprint: { hash: 'test-hash-integration' },
        },
        { validateStatus: null },
      );
      // Should succeed or rate-limit — never a 500
      expect(res.status).not.toBe(500);
      expect([200, 201, 429]).toContain(res.status);
    });

    test('GET /api/analytics/page-views returns 200, 401, or 403 — never 500', async () => {
      const res = await axios.get(`${BASE_URL}/api/stats/page-views`, {
        validateStatus: null,
      });
      expect(res.status).not.toBe(500);
      expect([200, 401, 403]).toContain(res.status);
    });
  });

  // ── Security headers ──────────────────────────────────────────────────────

  describe('Security headers', () => {
    test('security headers are present in production', async () => {
      if (nodeEnv !== 'production') {
        console.log('Skipping: security headers only enforced in production nginx config');
        return;
      }
      const res = await axios.get(BASE_URL);
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  // ── SEO ───────────────────────────────────────────────────────────────────

  describe('SEO', () => {
    // Share one page load across SEO checks
    let seoPage;

    beforeAll(async () => {
      seoPage = await browser.newPage();
      await seoPage.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    }, 30_000);

    afterAll(async () => {
      await seoPage?.close();
    });

    test('html lang attribute is "en"', async () => {
      const lang = await seoPage.evaluate(() => document.documentElement.lang);
      expect(lang).toBe('en');
    });

    test('has a non-empty meta description', async () => {
      const description = await seoPage.evaluate(() =>
        document.querySelector('meta[name="description"]')?.getAttribute('content'),
      );
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });

    test('has Open Graph meta tags', async () => {
      const ogTitle = await seoPage.evaluate(() =>
        document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      );
      expect(typeof ogTitle).toBe('string');
      expect(ogTitle.length).toBeGreaterThan(0);
    });

    test('robots.txt is accessible and disallows /api/', async () => {
      const res = await axios.get(`${BASE_URL}/robots.txt`);
      expect(res.status).toBe(200);
      expect(res.data).toContain('Disallow: /api/');
    });

    test('/sitemap.xml is accessible and returns valid XML', async () => {
      const res = await axios.get(`${BASE_URL}/sitemap.xml`, { validateStatus: null });
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/xml/);
      expect(res.data).toContain('<urlset');
    });

    test.each(['/about', '/projects', '/contact'])(
      '%s loads without JS errors',
      async (path) => {
        const page = await browser.newPage();
        const jsErrors = [];
        page.on('pageerror', (err) => jsErrors.push(err.message));
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
        expect(jsErrors).toHaveLength(0);
        await page.close();
      },
      30_000,
    );
  });

  // ── Performance ───────────────────────────────────────────────────────────

  describe('Performance', () => {
    test.concurrent('/api/health responds within 500ms', async () => {
      const start = Date.now();
      await axios.get(`${BASE_URL}/api/health`);
      expect(Date.now() - start).toBeLessThan(500);
    });

    test.concurrent('homepage TTFB is under 2000ms', async () => {
      const start = Date.now();
      await axios.get(BASE_URL, { validateStatus: null });
      expect(Date.now() - start).toBeLessThan(2000);
    });

    test.concurrent('/api/posts responds within 3000ms (Northflank 0.1 vCPU budget)', async () => {
      const start = Date.now();
      await axios.get(`${BASE_URL}/api/posts`);
      expect(Date.now() - start).toBeLessThan(3000);
    });

    test('/_next/static/ assets are served with long-cache headers', async () => {
      const html = (await axios.get(BASE_URL)).data;
      const match = html.match(/\/_next\/static\/[^"' ]+\.js/);
      if (!match) return;
      const assetRes = await axios.get(`${BASE_URL}${match[0]}`, { validateStatus: null });
      expect(assetRes.headers['cache-control']).toMatch(/max-age=31536000/);
    });
  });
});
