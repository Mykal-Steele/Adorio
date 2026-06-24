const axios = require('axios');
const { BASE_URL, waitForBackend } = require('./helpers');

describe('Analytics API', () => {
  beforeAll(async () => {
    await waitForBackend();
  }, 60_000);

  test('POST /api/stats/track accepts a page view event', async () => {
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

  test('GET /api/stats/page-views returns 200, 401, or 403 — never 500', async () => {
    const res = await axios.get(`${BASE_URL}/api/stats/page-views`, {
      validateStatus: null,
    });
    expect(res.status).not.toBe(500);
    expect([200, 401, 403]).toContain(res.status);
  });
});
