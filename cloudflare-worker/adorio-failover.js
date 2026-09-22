const PRIMARY_ORIGIN = 'https://adorio.orangeground-7d1e6e2f.southeastasia.azurecontainerapps.io';
const BACKUP_ORIGIN = 'https://p01--adorio--y9gwmvv64g9t.code.run';
const HEALTH_PATH = '/api/health';
const KV_KEY = 'primary-health';
const PRIMARY_TIMEOUT_MS = 5000;
// /api/coding/run compiles and runs real code through Piston — legitimate
// successful responses have been observed taking 5.6-5.9s, right at (and
// over) the generic 5s budget above. Without this, a request that's simply
// slow (not actually broken) gets treated as a primary failure: it's routed
// to the Northflank backup for that one request, AND counted toward the
// shared FAIL_THRESHOLD below, which can mark the *entire* domain unhealthy
// off nothing but a couple of ordinary Java submissions. 20s covers the
// backend's own worst-case budget (backend/services/codingService.js's
// COMPILE_TIMEOUT_MS + RUN_TIMEOUT_MS per test, batched across
// TEST_CASE_CONCURRENCY) with headroom, while still failing over well
// before a real Piston/Azure outage would leave a user waiting.
const SLOW_PATH_TIMEOUT_MS = 20000;
const SLOW_PATHS = ['/api/coding/run'];
const PROBE_TIMEOUT_MS = 5000;
const FAIL_THRESHOLD = 2;
const OK_THRESHOLD = 2;
const DEFAULT_STATE = { healthy: true, consecutiveFail: 0, consecutiveOk: 0 };

async function getState(env) {
  try {
    const raw = await env.FAILOVER_STATE.get(KV_KEY, { type: 'json', cacheTtl: 60 });
    if (raw && typeof raw.healthy === 'boolean') return raw;
    return DEFAULT_STATE;
  } catch (err) {
    return DEFAULT_STATE;
  }
}

async function putState(env, state) {
  try {
    await env.FAILOVER_STATE.put(KV_KEY, JSON.stringify(state));
  } catch (err) {
    // KV write failures must never crash the request path
  }
}

async function recordLiveFailure(env, state) {
  const consecutiveFail = state.consecutiveFail + 1;
  await putState(env, {
    ...state,
    healthy: state.healthy && consecutiveFail < FAIL_THRESHOLD,
    consecutiveFail,
    consecutiveOk: 0,
  });
}

async function pingHealth() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(PRIMARY_ORIGIN + HEALTH_PATH, { signal: controller.signal });
    return res.ok;
  } catch (err) {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function withServedBy(res, who) {
  const headers = new Headers(res.headers);
  headers.set('X-Served-By', who);
  return new Response(res.body, { status: res.status, headers });
}

async function serveBackup(request, url) {
  try {
    const backupReq = new Request(BACKUP_ORIGIN + url.pathname + url.search, request);
    const res = await fetch(backupReq);
    return withServedBy(res, 'northflank-backup');
  } catch (err) {
    return new Response('Service temporarily unavailable', { status: 502 });
  }
}

export default {
  async fetch(request, env, ctx) {
    let url;
    try {
      url = new URL(request.url);
    } catch (err) {
      return new Response('Bad request', { status: 400 });
    }

    const state = await getState(env);

    if (state.healthy) {
      const timeoutMs = SLOW_PATHS.some((path) => url.pathname.startsWith(path))
        ? SLOW_PATH_TIMEOUT_MS
        : PRIMARY_TIMEOUT_MS;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const primaryReq = new Request(PRIMARY_ORIGIN + url.pathname + url.search, request.clone());
        const res = await fetch(primaryReq, { signal: controller.signal });
        clearTimeout(timer);
        if (res.status < 500) return withServedBy(res, 'azure-primary');
        throw new Error('primary returned ' + res.status);
      } catch (err) {
        clearTimeout(timer);
        ctx.waitUntil(recordLiveFailure(env, state));
      }
    }

    // Recovery detection runs only from the Cron Trigger below, never on the
    // request path. Cron Triggers fire exactly once per schedule across the
    // whole network. An earlier version probed from here on every request
    // while unhealthy instead — since each Cloudflare edge location caches
    // its own copy of FAILOVER_STATE (cacheTtl above), every colo serving
    // traffic ran its own independent probe-and-write cycle, multiplying KV
    // writes by however many colos were active and blowing past the free
    // tier's 1,000 writes/day cap well before a full outage day was over.
    return serveBackup(request, url);
  },

  async scheduled(event, env, ctx) {
    const state = await getState(env);
    const ok = await pingHealth();
    const next = ok
      ? {
          ...state,
          healthy: state.healthy || state.consecutiveOk + 1 >= OK_THRESHOLD,
          consecutiveOk: state.consecutiveOk + 1,
          consecutiveFail: 0,
        }
      : {
          ...state,
          healthy: state.healthy && state.consecutiveFail + 1 < FAIL_THRESHOLD,
          consecutiveFail: state.consecutiveFail + 1,
          consecutiveOk: 0,
        };
    await putState(env, next);
  },
};
