// Serves a file kept in R2 under an adorio.space URL. Each visit asks R2 with the
// cached copy's ETag, so an unchanged file costs a 304, and the last good copy is
// kept for when R2 can't be reached.

type CachedFile = {
  body: ArrayBuffer;
  etag: string | null;
  lastModified: string | null;
};

// Weak comparison (RFC 9110): `*` matches anything, a list matches if any tag does,
// and `W/` prefixes are ignored.
function etagMatches(header: string | null, etag: string) {
  if (!header) return false;
  if (header.trim() === '*') return true;
  const strip = (tag: string) => tag.trim().replace(/^W\//, '');
  return header.split(',').some((tag) => strip(tag) === strip(etag));
}

// If-None-Match takes precedence over If-Modified-Since (RFC 9110 §13.1.3).
function isNotModified(request: Request, file: CachedFile) {
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch) return file.etag ? etagMatches(ifNoneMatch, file.etag) : false;

  const ifModifiedSince = request.headers.get('if-modified-since');
  if (!ifModifiedSince || !file.lastModified) return false;
  const since = Date.parse(ifModifiedSince);
  const modified = Date.parse(file.lastModified);
  return !Number.isNaN(since) && !Number.isNaN(modified) && modified <= since;
}

export function createR2Proxy(url: string, headers: Record<string, string>) {
  let cache: CachedFile | null = null;
  let inflight: Promise<CachedFile | null> | null = null;

  async function refresh(): Promise<CachedFile | null> {
    const conditional = new Headers();
    if (cache?.etag) conditional.set('if-none-match', cache.etag);

    const upstream = await fetch(url, {
      headers: conditional,
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
  function load() {
    if (inflight) return inflight;
    inflight = refresh().finally(() => {
      inflight = null;
    });
    return inflight;
  }

  return async function GET(request: Request) {
    const file = await load();
    // Never 5xx: the edge failover treats consecutive 5xx as primary-down.
    if (!file) return Response.redirect(url, 302);

    // `no-cache` still lets Cloudflare + browsers store the file, but forces them to
    // revalidate with us first, so a new upload is never hidden behind a stale copy.
    const responseHeaders = new Headers({ 'Cache-Control': 'no-cache' });
    if (file.etag) responseHeaders.set('ETag', file.etag);
    if (file.lastModified) responseHeaders.set('Last-Modified', file.lastModified);

    if (isNotModified(request, file)) {
      return new Response(null, { status: 304, headers: responseHeaders });
    }

    for (const [name, value] of Object.entries(headers)) responseHeaders.set(name, value);
    return new Response(file.body, { headers: responseHeaders });
  };
}
