const PRIMARY_ORIGIN = 'https://adorio.orangeground-7d1e6e2f.southeastasia.azurecontainerapps.io';
const BACKUP_ORIGIN = 'https://p01--adorio--y9gwmvv64g9t.code.run';
const HEALTH_PATH = '/api/health';
const KV_KEY = 'primary-health';
const PRIMARY_TIMEOUT_MS = 5000;
// /api/coding/run runs real code through Piston and normal runs have taken 5.6-5.9s,
// over the 5s budget above. With 5s, a slow run went to the backup and counted toward
// FAIL_THRESHOLD, so a couple of Java submissions could fail over the whole domain.
// 20s covers codingService.js's worst case (COMPILE_TIMEOUT_MS + RUN_TIMEOUT_MS per
// test, batched by TEST_CASE_CONCURRENCY) with headroom, and still fails over on a real outage.
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
    // a failed KV write shouldn't break the request
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
      // plain startsWith would also give /api/coding/runaway the slow budget
      const timeoutMs = SLOW_PATHS.some(
        (path) => url.pathname === path || url.pathname.startsWith(path + '/'),
      )
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

    // recovery is only checked by the cron below, which fires once per schedule
    // network wide. It used to probe here on every request while unhealthy, so
    // every colo (each caches its own FAILOVER_STATE) probed and wrote KV on its
    // own, and that blew through the free tier's 1,000 writes/day before an
    // outage day was over.
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
