const axios = require('axios');
const puppeteer = require('puppeteer');
const { BASE_URL, waitForBackend } = require('./helpers');

describe('Smoke, Environment, Security, SEO, Performance', () => {
  let browser;
  let nodeEnv;

  beforeAll(async () => {
    await waitForBackend();
    const res = await axios.get(`${BASE_URL}/api/test-env`, { validateStatus: null });
    nodeEnv = res.status === 200 ? res.data.NODE_ENV : 'production';
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
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
      expect(res.headers.location).toMatch(/\/cao\/$/);
    });
  });

  // ── Environment ───────────────────────────────────────────────────────────

  describe('Environment', () => {
    test('required backend env vars are set', async () => {
      const res = await axios.get(`${BASE_URL}/api/test-env`, { validateStatus: null });
      if (res.status === 404) {
        console.log('Skipping: /api/test-env not available in production');
        return;
      }
      expect(res.status).toBe(200);
      expect(res.data.MONGO_URI).toBe(true);
      expect(res.data.JWT_SECRET).toBe(true);
      expect(res.data.CLOUDINARY_KEY).toBe(true);
      expect(res.data.CLOUDINARY_SECRET).toBe(true);
      expect(typeof res.data.CLOUDINARY_NAME).toBe('string');
      expect(res.data.CLOUDINARY_NAME.length).toBeGreaterThan(0);
    });
  });

  // ── Security headers ──────────────────────────────────────────────────────

  describe('Security headers', () => {
    test('security headers are present on all routes', async () => {
      const res = await axios.get(BASE_URL);
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
    });
  });

  // ── SEO ───────────────────────────────────────────────────────────────────

  describe('SEO', () => {
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

    test.concurrent('robots.txt is accessible and disallows /api/', async () => {
      const res = await axios.get(`${BASE_URL}/robots.txt`);
      expect(res.status).toBe(200);
      expect(res.data).toContain('Disallow: /api/');
    });

    test.concurrent('/sitemap.xml is accessible and returns valid XML', async () => {
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

    test.concurrent('/api/posts responds within 3000ms', async () => {
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
