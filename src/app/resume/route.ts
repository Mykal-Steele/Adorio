import { NextResponse } from 'next/server';

// Source of truth — replace the ID when the Drive file changes.
// Share URL: https://drive.google.com/file/d/1YNXbBncoZ0E7U8KUYsd1qf4p0l2nqHYm/view?usp=sharing
// (File must stay shared as "Anyone with the link can view".)
const FILE_ID = process.env.RESUME_DRIVE_FILE_ID || '1YNXbBncoZ0E7U8KUYsd1qf4p0l2nqHYm';
const DRIVE_DOWNLOAD_URL = `https://drive.usercontent.google.com/download?id=${FILE_ID}&export=download`;
const DRIVE_VIEW_URL = `https://drive.google.com/file/d/${FILE_ID}/view`;

// Run on every visit so we can revalidate against Drive. `no-cache` still lets
// Cloudflare + browsers store the PDF, but forces them to revalidate with us first,
// so this handler sees every visit and can refresh the cached copy when Drive changes.
export const dynamic = 'force-dynamic';

type CachedResume = {
  body: ArrayBuffer;
  lastModified: string | null;
  etag: string | null;
};

let cache: CachedResume | null = null;
let inflight: Promise<CachedResume | null> | null = null;

// Drive returns no ETag, so we fingerprint the file from its Last-Modified + size.
function fingerprint(lastModified: string | null, contentLength: string | null) {
  if (!lastModified && !contentLength) return null;
  return `"${lastModified ?? ''}-${contentLength ?? ''}"`;
}

// Weak comparison (RFC 9110): `*` matches anything, a list matches if any tag does,
// and `W/` prefixes are ignored.
function etagMatches(header: string | null, etag: string) {
  if (!header) return false;
  if (header.trim() === '*') return true;
  const strip = (tag: string) => tag.trim().replace(/^W\//, '');
  return header.split(',').some((tag) => strip(tag) === strip(etag));
}

async function getDriveFingerprint() {
  const res = await fetch(DRIVE_DOWNLOAD_URL, {
    method: 'HEAD',
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  return fingerprint(res.headers.get('last-modified'), res.headers.get('content-length'));
}

// Cheap check first: only download the full PDF when Drive's fingerprint changed.
async function refreshResume(): Promise<CachedResume | null> {
  const etag = await getDriveFingerprint().catch(() => null);

  if (etag === null) {
    // Can't tell whether it changed — keep serving what we already have.
    if (cache) return cache;
  } else if (cache && etag === cache.etag) {
    return cache;
  }

  const upstream = await fetch(DRIVE_DOWNLOAD_URL, {
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (!upstream?.ok || !upstream.body) return cache;

  const lastModified = upstream.headers.get('last-modified');
  const contentLength = upstream.headers.get('content-length');
  cache = {
    body: await upstream.arrayBuffer(),
    lastModified,
    etag: etag ?? fingerprint(lastModified, contentLength),
  };
  return cache;
}

// Collapse concurrent visits onto a single Drive check/download instead of one per request.
function loadResume(): Promise<CachedResume | null> {
  if (inflight) return inflight;
  inflight = refreshResume().finally(() => {
    inflight = null;
  });
  return inflight;
}

export async function GET(request: Request) {
  const resume = await loadResume();
  if (!resume) {
    // Never 5xx: the edge failover treats consecutive 5xx as primary-down.
    return NextResponse.redirect(DRIVE_VIEW_URL, 302);
  }

  if (resume.etag && etagMatches(request.headers.get('if-none-match'), resume.etag)) {
    return new Response(null, {
      status: 304,
      headers: { ETag: resume.etag, 'Cache-Control': 'no-cache, must-revalidate' },
    });
  }

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Disposition', 'inline; filename="Oakar-Oo-Resume.pdf"');
  headers.set('Cache-Control', 'no-cache, must-revalidate');
  if (resume.etag) headers.set('ETag', resume.etag);
  if (resume.lastModified) headers.set('Last-Modified', resume.lastModified);

  return new Response(resume.body, { headers });
}
