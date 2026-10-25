// The PDF lives in the adorio-resume R2 bucket, served at resume.adorio.space.
// To update it: npx wrangler r2 object put adorio-resume/Oakar-Oo-Resume.pdf --remote \
//   --file <pdf> --content-type application/pdf --cache-control no-cache
const RESUME_URL = process.env.RESUME_URL || 'https://resume.adorio.space/Oakar-Oo-Resume.pdf';

// Run on every visit so a new upload shows up right away
export const dynamic = 'force-dynamic';

type CachedResume = {
  body: ArrayBuffer;
  etag: string | null;
  lastModified: string | null;
};

// The last good copy, kept so the resume still loads if R2 can't be reached
let cache: CachedResume | null = null;
let inflight: Promise<CachedResume | null> | null = null;

// `no-cache` still lets Cloudflare + browsers store the PDF, but forces them to
// revalidate with us first, so a new upload is never hidden behind a stale copy.
const CACHE_CONTROL = 'no-cache';

// Weak comparison (RFC 9110): `*` matches anything, a list matches if any tag does,
// and `W/` prefixes are ignored.
function etagMatches(header: string | null, etag: string) {
  if (!header) return false;
  if (header.trim() === '*') return true;
  const strip = (tag: string) => tag.trim().replace(/^W\//, '');
  return header.split(',').some((tag) => strip(tag) === strip(etag));
}

// If-None-Match takes precedence over If-Modified-Since (RFC 9110 §13.1.3).
function isNotModified(request: Request, resume: CachedResume) {
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch) return resume.etag ? etagMatches(ifNoneMatch, resume.etag) : false;

  const ifModifiedSince = request.headers.get('if-modified-since');
  if (!ifModifiedSince || !resume.lastModified) return false;
  const since = Date.parse(ifModifiedSince);
  const modified = Date.parse(resume.lastModified);
  return !Number.isNaN(since) && !Number.isNaN(modified) && modified <= since;
}

// Asks R2 with our copy's ETag, so an unchanged file costs a 304 instead of a download
async function refreshResume(): Promise<CachedResume | null> {
  const headers = new Headers();
  if (cache?.etag) headers.set('if-none-match', cache.etag);

  const upstream = await fetch(RESUME_URL, {
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  }).catch(() => null);

  if (upstream?.status === 200) {
    // The headers can arrive before the body fails, so a broken download keeps the old copy
    const body = await upstream.arrayBuffer().catch(() => null);
    if (body) {
      cache = {
        body,
        etag: upstream.headers.get('etag'),
        lastModified: upstream.headers.get('last-modified'),
      };
    }
  }
  // 304 means our copy is current; anything else keeps the last good copy
  return cache;
}

// Collapse concurrent visits onto a single R2 check instead of one per request.
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
    return Response.redirect(RESUME_URL, 302);
  }

  const headers = new Headers({ 'Cache-Control': CACHE_CONTROL });
  if (resume.etag) headers.set('ETag', resume.etag);
  if (resume.lastModified) headers.set('Last-Modified', resume.lastModified);

  if (isNotModified(request, resume)) {
    return new Response(null, { status: 304, headers });
  }

  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Disposition', 'inline; filename="Oakar-Oo-Resume.pdf"');
  return new Response(resume.body, { headers });
}
