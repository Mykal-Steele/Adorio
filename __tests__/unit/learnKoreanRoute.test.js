import { afterEach, describe, expect, test } from 'bun:test';

const R2_URL = 'https://files.adorio.space/learn-korean.html';
const realFetch = globalThis.fetch;
const html = '<!doctype html><title>Learn Korean</title>';

// Each test gets a fresh copy of the route, so the in-memory copy starts empty
let n = 0;
const loadRoute = () => import(`../../src/app/learn-korean/route.ts?case=${n++}`);
const visit = (headers = {}) => new Request('https://adorio.space/learn-korean', { headers });

const r2Serves = (status, headers = {}) => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(status === 200 ? html : null, { status, headers });
  };
  return calls;
};

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('/learn-korean', () => {
  test('should serve the page from R2 as HTML', async () => {
    const calls = r2Serves(200, { etag: '"k1"' });
    const { GET } = await loadRoute();
    const res = await GET(visit());
    expect(calls[0].url).toBe(R2_URL);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(await res.text()).toBe(html);
  });

  test('should answer 304 when the visitor already has this version', async () => {
    r2Serves(200, { etag: '"k1"' });
    const { GET } = await loadRoute();
    const res = await GET(visit({ 'if-none-match': '"k1"' }));
    expect(res.status).toBe(304);
  });

  test('should keep serving the last copy when R2 is down', async () => {
    r2Serves(200, { etag: '"k1"' });
    const { GET } = await loadRoute();
    await GET(visit());
    globalThis.fetch = async () => {
      throw new Error('network down');
    };
    const res = await GET(visit());
    expect(res.status).toBe(200);
    expect(await res.text()).toBe(html);
  });

  test('should redirect instead of a 5xx when R2 is down and nothing is cached', async () => {
    r2Serves(503);
    const { GET } = await loadRoute();
    const res = await GET(visit());
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(R2_URL);
  });
});
