import { afterEach, describe, expect, test } from 'bun:test';

const R2_URL = 'https://resume.adorio.space/Oakar-Oo-Resume.pdf';
const realFetch = globalThis.fetch;
const pdf = new Uint8Array([37, 80, 68, 70]); // "%PDF"

// Each test gets a fresh copy of the route, so the in-memory copy starts empty
let n = 0;
const loadRoute = () => import(`../../src/app/resume/route.ts?case=${n++}`);
const visit = (headers = {}) => new Request('https://adorio.space/resume', { headers });

const r2Serves = (status, headers = {}) => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(status === 200 ? pdf : null, { status, headers });
  };
  return calls;
};

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('/resume', () => {
  test('should serve the PDF from R2 with its ETag', async () => {
    const calls = r2Serves(200, {
      etag: '"abc"',
      'last-modified': 'Sat, 25 Oct 2026 12:00:00 GMT',
    });
    const { GET } = await loadRoute();
    const res = await GET(visit());
    expect(calls[0].url).toBe(R2_URL);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('etag')).toBe('"abc"');
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(pdf);
  });

  test('should answer 304 when the visitor already has this version', async () => {
    r2Serves(200, { etag: '"abc"' });
    const { GET } = await loadRoute();
    const res = await GET(visit({ 'if-none-match': '"abc"' }));
    expect(res.status).toBe(304);
  });

  test('should keep serving the last copy when R2 says it has not changed', async () => {
    r2Serves(200, { etag: '"abc"' });
    const { GET } = await loadRoute();
    await GET(visit());
    const calls = r2Serves(304, { etag: '"abc"' });
    const res = await GET(visit());
    expect(calls[0].init.headers.get('if-none-match')).toBe('"abc"');
    expect(res.status).toBe(200);
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(pdf);
  });

  test('should keep serving the last copy when R2 is down', async () => {
    r2Serves(200, { etag: '"abc"' });
    const { GET } = await loadRoute();
    await GET(visit());
    globalThis.fetch = async () => {
      throw new Error('network down');
    };
    const res = await GET(visit());
    expect(res.status).toBe(200);
  });

  test('should redirect instead of a 5xx when R2 is down and nothing is cached', async () => {
    r2Serves(503);
    const { GET } = await loadRoute();
    const res = await GET(visit());
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(R2_URL);
  });
});
