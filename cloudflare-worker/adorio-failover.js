import hostsFile from '../hosting/hosts.json' with { type: 'json' };

// Hosts are tried in the order hosting/hosts.json lists them. Moving the app to
// another platform means editing that file and running `wrangler deploy`, not
// changing this code.
export const HOSTS = hostsFile.hosts.filter((host) => host.enabled !== false);

const HEALTH_PATH = '/api/health';
const KV_KEY = 'host-health';
const FAIL_THRESHOLD = 2;
const OK_THRESHOLD = 2;
// /api/coding/run runs real code through Piston and normal runs have taken 5.6-5.9s,
// over the normal budget. With 5s, a slow Java run counted as a host failure, so a
// couple of submissions could fail the whole domain over. 20s covers codingService.js's
// worst case with headroom and still fails over on a real outage.
const SLOW_PATHS = ['/api/coding/run'];
// Only these are sent to a second host after the first one timed out or answered
// 5xx. A POST that timed out may already have been saved, so sending it again could
// create it twice.
const RETRY_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// plain startsWith would also give /api/coding/runaway the slow budget
const isSlowPath = (pathname) =>
  SLOW_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));

// Two failures in a row take a host out, two good probes bring it back. Both
// counters stop at their threshold so a host that stays up (or down) produces the
// same state every time, and nothing is written to KV.
function nextHealth(entry = { healthy: true, fail: 0, ok: 0 }, passed) {
  if (passed) {
    const ok = Math.min(entry.ok + 1, OK_THRESHOLD);
    return { healthy: entry.healthy || ok >= OK_THRESHOLD, fail: 0, ok };
  }
  const fail = Math.min(entry.fail + 1, FAIL_THRESHOLD);
  return { healthy: entry.healthy && fail < FAIL_THRESHOLD, fail, ok: 0 };
}

const sameHealth = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function withServedBy(res, name) {
  const headers = new Headers(res.headers);
  headers.set('X-Served-By', name);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export function createWorker({
  hosts = HOSTS,
  fetchImpl = (...args) => fetch(...args),
  timeoutMs = 5000,
  slowTimeoutMs = 20000,
  // Long enough for a host that scales to zero to start (4 to 8s on Cloud Run).
  probeTimeoutMs = 10000,
} = {}) {
  async function readHealth(env) {
    try {
      return (await env.FAILOVER_STATE.get(KV_KEY, { type: 'json', cacheTtl: 60 })) ?? {};
    } catch {
      return {};
    }
  }

  async function writeHealth(env, health) {
    try {
      await env.FAILOVER_STATE.put(KV_KEY, JSON.stringify(health));
    } catch {
      // a failed KV write shouldn't break the request
    }
  }

  async function recordFailure(env, name) {
    const health = await readHealth(env);
    const next = nextHealth(health[name], false);
    if (!sameHealth(health[name], next)) await writeHealth(env, { ...health, [name]: next });
  }

  async function tryHost(host, request, url, limitMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), limitMs);
    try {
      const forwarded = new Request(host.origin + url.pathname + url.search, request.clone());
      return { response: await fetchImpl(forwarded, { signal: controller.signal }) };
    } catch {
      return { timedOut: controller.signal.aborted };
    } finally {
      clearTimeout(timer);
    }
  }

  async function probe(host) {
    try {
      const res = await fetchImpl(host.origin + HEALTH_PATH, {
        signal: AbortSignal.timeout(probeTimeoutMs),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  return {
    async fetch(request, env, ctx) {
      let url;
      try {
        url = new URL(request.url);
      } catch {
        return new Response('Bad request', { status: 400 });
      }

      const health = await readHealth(env);
      const isUp = (host) => health[host.name]?.healthy !== false;
      // Hosts marked down still go at the end: if every healthy host fails too,
      // a stale health entry is a better bet than answering 502.
      const order = [...hosts.filter(isUp), ...hosts.filter((host) => !isUp(host))];
      const retrySafe = RETRY_SAFE_METHODS.has(request.method);
      const limitMs = isSlowPath(url.pathname) ? slowTimeoutMs : timeoutMs;

      for (const host of order) {
        const { response, timedOut } = await tryHost(host, request, url, limitMs);
        if (response && response.status < 500) return withServedBy(response, host.name);
        ctx.waitUntil(recordFailure(env, host.name));
        if (response && !retrySafe) return withServedBy(response, host.name);
        if (timedOut && !retrySafe) return new Response('Gateway timeout', { status: 504 });
      }
      return new Response('Service temporarily unavailable', { status: 502 });
    },

    // Runs from the cron trigger in wrangler.toml, once per schedule network wide.
    // Health is only probed here, never on the request path: every colo caches its
    // own copy of FAILOVER_STATE, so probing per request multiplied KV writes and
    // blew through the free plan's 1,000 writes a day during an outage. The probe
    // also keeps hosts that scale to zero warm, since each one idles for up to 15
    // minutes after a request before it is shut down.
    async scheduled(event, env) {
      const health = await readHealth(env);
      const results = await Promise.all(hosts.map(probe));
      const next = Object.fromEntries(
        hosts.map((host, i) => [host.name, nextHealth(health[host.name], results[i])]),
      );
      if (hosts.some((host) => !sameHealth(health[host.name], next[host.name]))) {
        await writeHealth(env, next);
      }
    },
  };
}

export default createWorker();
