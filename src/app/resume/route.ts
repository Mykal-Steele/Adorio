import { NextResponse } from 'next/server';

// Source of truth — replace the ID when the Drive file changes.
// Share URL: https://drive.google.com/file/d/1YNXbBncoZ0E7U8KUYsd1qf4p0l2nqHYm/view?usp=sharing
// (File must stay shared as "Anyone with the link can view".)
const FILE_ID = process.env.RESUME_DRIVE_FILE_ID || '1YNXbBncoZ0E7U8KUYsd1qf4p0l2nqHYm';
const DRIVE_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;
const DRIVE_VIEW_URL = `https://drive.google.com/file/d/${FILE_ID}/view`;

// Re-fetch from Drive at most once a day. Next caches the upstream response,
// and the Cache-Control below lets Cloudflare + browsers cache it too —
// so editing the Drive file rolls out to adorio.space/resume within ~24h
// with no redeploy and ~1 upstream fetch/day.
export const revalidate = 86400;

export async function GET() {
  let upstream: Response;
  try {
    upstream = await fetch(DRIVE_DOWNLOAD_URL, { next: { revalidate: 86400 } });
  } catch {
    // Never 5xx: the edge failover treats consecutive 5xx as primary-down.
    return NextResponse.redirect(DRIVE_VIEW_URL, 302);
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.redirect(DRIVE_VIEW_URL, 302);
  }

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Disposition', 'inline; filename="Oakar-Oo-Resume.pdf"');
  headers.set(
    'Cache-Control',
    'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
  );
  for (const h of ['content-length', 'last-modified', 'etag']) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }

  return new Response(upstream.body, { headers });
}
