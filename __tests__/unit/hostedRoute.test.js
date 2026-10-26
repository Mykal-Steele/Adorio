import { afterEach, describe, expect, test } from 'bun:test';

const realFetch = globalThis.fetch;
const html = '<!doctype html><script>localStorage.getItem("token")</script>';

const { GET } = await import('../../src/app/h/[slug]/route.ts');
const visit = (slug) =>
  GET(new Request(`https://adorio.space/h/${slug}`), { params: Promise.resolve({ slug }) });

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('/h/[slug]', () => {
  // Files from before R2 are someone's HTML served on adorio.space itself. Without a
  // sandbox their scripts run as the site and can read the visitor's login token.
  test('should sandbox old inline HTML files away from the site origin', async () => {
    globalThis.fetch = async () => new Response(html, { status: 200 });
    const res = await visit('old-page');
    const csp = res.headers.get('content-security-policy') || '';
    expect(csp).toContain('sandbox');
    expect(csp).not.toContain('allow-same-origin');
    expect(await res.text()).toBe(html);
  });

  test('should redirect R2 files to their storage URL', async () => {
    globalThis.fetch = async () =>
      new Response(null, {
        status: 302,
        headers: { location: 'https://files.adorio.space/h/a.pdf' },
      });
    const res = await visit('a');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://files.adorio.space/h/a.pdf');
    // The zone caches everything outside /api, so a cached redirect would outlive a delete
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});
