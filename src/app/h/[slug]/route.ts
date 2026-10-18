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
    if (location) return NextResponse.redirect(location, 302);
  }

  if (res.status === 404) {
    return new NextResponse(
      '<!doctype html><html><body style="font-family:sans-serif;padding:2rem"><h1>404 — File not found</h1></body></html>',
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  if (!res.ok) {
    return new NextResponse(
      '<!doctype html><html><body style="font-family:sans-serif;padding:2rem"><h1>Error loading file</h1></body></html>',
      { status: res.status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  // Legacy: files uploaded before R2 stored their HTML in Mongo directly.
  const html = await res.text();
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
