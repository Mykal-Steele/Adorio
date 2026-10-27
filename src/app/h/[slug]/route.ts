import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let res: Response;
  try {
    res = await fetch(
      `${process.env.BACKEND_INTERNAL_URL}/api/hosted/${encodeURIComponent(slug)}`,
      { redirect: 'manual', cache: 'no-store' },
    );
  } catch {
    return new NextResponse(
      '<!doctype html><html><body style="font-family:sans-serif;padding:2rem"><h1>Service unavailable</h1></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  // Hosted files live in R2 — the backend hands back a presigned location and
  // the browser fetches the object directly (no large payload through here).
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get('location');
    if (location) {
      // Not cached: Cloudflare caches everything outside /api, and a cached redirect would
      // keep pointing at a file after it's deleted
      return NextResponse.redirect(location, {
        status: 302,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
  }

  if (res.status === 404) {
    return new NextResponse(
      '<!doctype html><html><body style="font-family:sans-serif;padding:2rem"><h1>404: File not found</h1></body></html>',
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  if (!res.ok) {
    return new NextResponse(
      '<!doctype html><html><body style="font-family:sans-serif;padding:2rem"><h1>Error loading file</h1></body></html>',
      { status: res.status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  // Legacy: files uploaded before R2 stored their HTML in Mongo directly. It's someone's
  // HTML served on adorio.space itself, so it runs sandboxed: without allow-same-origin it
  // gets an opaque origin and its scripts can't read this site's storage (where the login
  // token lives) or call the API as the visitor. Scripts, forms and popups still work.
  const html = await res.text();
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': 'sandbox allow-scripts allow-forms allow-popups allow-modals',
    },
  });
}
