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
    test('health endpoint returns healthy', async () => {
      const res = await axios.get(`${BASE_URL}/api/health`);
      expect(res.status).toBe(200);
      expect(res.data.isHealthy).toBe(true);
    });

    test('frontend loads with correct title and no JS errors', async () => {
      const page = await browser.newPage();
      const jsErrors = [];
      page.on('pageerror', (err) => jsErrors.push(err.message));
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      expect(await page.title()).toBe('Oakar Oo — Portfolio | Adorio');
      expect(jsErrors).toHaveLength(0);
      await page.close();
    }, 30_000);

    test('frontend can reach /api/health', async () => {
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

    test('/cao redirects to /cao/', async () => {
      const res = await axios.get(`${BASE_URL}/cao`, {
        maxRedirects: 0,
        validateStatus: null,
      });
      expect(res.status).toBe(301);
    });
  });

  // ── Required env vars ─────────────────────────────────────────────────────

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
    // Use a unique username/email per run to avoid conflicts with existing data
    const ts = Date.now();
    const username = `testuser_${ts}`;
    const email = `testuser_${ts}@integration.test`;
    const password = 'Integration_Test_123!';
    let accessToken;
    let refreshToken;

    test('register creates a new user and returns a token', async () => {
      const res = await axios.post(`${BASE_URL}/api/users/register`, { username, email, password });
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('token');
      expect(res.data).toHaveProperty('user');
      expect(res.data.user.username).toBe(username);
      accessToken = res.data.token;
    });

    test('login returns access and refresh tokens', async () => {
      const res = await axios.post(`${BASE_URL}/api/users/login`, { email, password });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('token');
      expect(res.data).toHaveProperty('refreshToken');
      accessToken = res.data.token;
      refreshToken = res.data.refreshToken;
    });

    test('GET /api/users/me without token returns 401', async () => {
      const res = await axios.get(`${BASE_URL}/api/users/me`, { validateStatus: null });
      expect(res.status).toBe(401);
    });

    test('GET /api/users/me with valid token returns the user', async () => {
      const res = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(res.status).toBe(200);
      expect(res.data.username).toBe(username);
    });

    test('refresh-token returns a new access token', async () => {
      const res = await axios.post(`${BASE_URL}/api/users/refresh-token`, { refreshToken });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('token');
    });

    test('login with wrong password returns 401', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/users/login`,
        { email, password: 'wrong_password' },
        { validateStatus: null },
      );
      expect(res.status).toBe(401);
    });
  });

  // ── Posts API ─────────────────────────────────────────────────────────────

  describe('Posts API', () => {
    test('GET /api/posts returns posts array', async () => {
      const res = await axios.get(`${BASE_URL}/api/posts`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.posts)).toBe(true);
      if (res.data.posts.length > 0) {
        expect(res.data.posts[0]).toHaveProperty('_id');
        expect(res.data.posts[0]).toHaveProperty('content');
      }
    });

    test('POST /api/posts without token returns 401', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/posts`,
        { content: 'test' },
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

  // ── Security ──────────────────────────────────────────────────────────────

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
    // Share one page load across all SEO checks — no reason to navigate 3 times
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
  });

  // ── Performance ───────────────────────────────────────────────────────────

  describe('Performance', () => {
    test('/api/health responds within 500ms', async () => {
      const start = Date.now();
      await axios.get(`${BASE_URL}/api/health`);
      expect(Date.now() - start).toBeLessThan(500);
    });

    test('homepage TTFB is under 2000ms', async () => {
      const start = Date.now();
      await axios.get(BASE_URL, { validateStatus: null });
      expect(Date.now() - start).toBeLessThan(2000);
    });

    test('/_next/static/ assets are served with long-cache headers', async () => {
      const html = (await axios.get(BASE_URL)).data;
      const match = html.match(/\/_next\/static\/[^"' ]+\.js/);
      if (!match) return; // no static JS on this page — skip gracefully
      const assetRes = await axios.get(`${BASE_URL}${match[0]}`, { validateStatus: null });
      expect(assetRes.headers['cache-control']).toMatch(/max-age=31536000/);
    });
  });
});
