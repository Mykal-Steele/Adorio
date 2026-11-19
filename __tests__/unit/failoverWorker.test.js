import { createWorker, HOSTS } from '../../cloudflare-worker/adorio-failover.js';
import hostsFile from '../../hosting/hosts.json' with { type: 'json' };

const A = { name: 'a', origin: 'https://a.example' };
const B = { name: 'b', origin: 'https://b.example' };
const C = { name: 'c', origin: 'https://c.example' };

function makeKv(initial) {
  const store = new Map(initial ? [['host-health', JSON.stringify(initial)]] : []);
  const kv = {
    puts: 0,
    async get(key, opts) {
      const raw = store.get(key);
      if (raw === undefined) return null;
      return opts?.type === 'json' ? JSON.parse(raw) : raw;
    },
    async put(key, value) {
      kv.puts += 1;
      store.set(key, value);
    },
    read: () => JSON.parse(store.get('host-health') ?? 'null'),
  };
  return kv;
}

function makeCtx() {
  const pending = [];
  return { waitUntil: (p) => pending.push(p), settle: () => Promise.all(pending) };
}

// answers(host) returns a Response, throws, or 'hang' to never answer until aborted
function fakeFetch(answers) {
  const calls = [];
  const fn = (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    calls.push({
      host: url.origin,
      path: url.pathname + url.search,
      method: input.method ?? 'GET',
    });
    const answer = answers[url.origin];
    if (answer === 'hang') {
      return new Promise((_, reject) => {
        init.signal?.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        );
      });
    }
    if (answer instanceof Error) return Promise.reject(answer);
    if (typeof answer === 'function') {
      // like real fetch, give up when the signal aborts
      return new Promise((resolve, reject) => {
        init.signal?.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        );
        Promise.resolve(answer()).then(resolve);
      });
    }
    return Promise.resolve(new Response('ok', { status: answer ?? 200 }));
  };
  fn.calls = calls;
  return fn;
}

const refused = () => new TypeError('Network connection lost');
const req = (path = '/', init) => new Request(`https://adorio.space${path}`, init);

function setup({
  hosts = [A, B, C],
  answers = {},
  health,
  timeoutMs = 50,
  slowTimeoutMs = 200,
} = {}) {
  const fetchImpl = fakeFetch(answers);
  const env = { FAILOVER_STATE: makeKv(health) };
  const ctx = makeCtx();
  const worker = createWorker({ hosts, fetchImpl, timeoutMs, slowTimeoutMs, probeTimeoutMs: 50 });
  return { worker, fetchImpl, env, ctx };
}

describe('routing', () => {
  test('sends the request to the first host and tags the response with its name', async () => {
    const { worker, fetchImpl, env, ctx } = setup();
    const res = await worker.fetch(req('/social'), env, ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Served-By')).toBe('a');
    expect(fetchImpl.calls.map((c) => c.host)).toEqual(['https://a.example']);
  });

  test('keeps the path and query string when forwarding', async () => {
    const { worker, fetchImpl, env, ctx } = setup();
    await worker.fetch(req('/api/posts?limit=10&page=2'), env, ctx);
    expect(fetchImpl.calls[0].path).toBe('/api/posts?limit=10&page=2');
  });

  test('skips a host the health state marks down', async () => {
    const { worker, fetchImpl, env, ctx } = setup({
      health: { a: { healthy: false, fail: 2, ok: 0 } },
    });
    const res = await worker.fetch(req(), env, ctx);
    expect(res.headers.get('X-Served-By')).toBe('b');
    expect(fetchImpl.calls.map((c) => c.host)).toEqual(['https://b.example']);
  });

  test('falls through to the next host when a GET times out', async () => {
    const { worker, env, ctx } = setup({ answers: { 'https://a.example': 'hang' } });
    const res = await worker.fetch(req(), env, ctx);
    expect(res.headers.get('X-Served-By')).toBe('b');
  });

  test('falls through to the next host when a GET gets a 5xx', async () => {
    const { worker, env, ctx } = setup({ answers: { 'https://a.example': 503 } });
    const res = await worker.fetch(req(), env, ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Served-By')).toBe('b');
  });

  test('returns a 4xx as it is without trying another host', async () => {
    const { worker, fetchImpl, env, ctx } = setup({ answers: { 'https://a.example': 404 } });
    const res = await worker.fetch(req('/nope'), env, ctx);
    expect(res.status).toBe(404);
    expect(res.headers.get('X-Served-By')).toBe('a');
    expect(fetchImpl.calls).toHaveLength(1);
  });

  test('does not send a POST again when the first host answered it with a 5xx', async () => {
    const { worker, fetchImpl, env, ctx } = setup({ answers: { 'https://a.example': 500 } });
    const res = await worker.fetch(req('/api/posts', { method: 'POST', body: '{}' }), env, ctx);
    expect(res.status).toBe(500);
    expect(res.headers.get('X-Served-By')).toBe('a');
    expect(fetchImpl.calls).toHaveLength(1);
  });

  test('answers 504 for a POST that timed out instead of sending it twice', async () => {
    const { worker, fetchImpl, env, ctx } = setup({ answers: { 'https://a.example': 'hang' } });
    const res = await worker.fetch(req('/api/posts', { method: 'POST', body: '{}' }), env, ctx);
    expect(res.status).toBe(504);
    expect(fetchImpl.calls).toHaveLength(1);
  });

  test('sends a POST to the next host when the first refused the connection', async () => {
    const { worker, env, ctx } = setup({ answers: { 'https://a.example': refused() } });
    const res = await worker.fetch(
      req('/api/posts', { method: 'POST', body: '{"x":1}' }),
      env,
      ctx,
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Served-By')).toBe('b');
  });

  test('tries every host when all are marked down, and answers 502 when none respond', async () => {
    const down = { healthy: false, fail: 2, ok: 0 };
    const { worker, fetchImpl, env, ctx } = setup({
      health: { a: down, b: down, c: down },
      answers: {
        'https://a.example': refused(),
        'https://b.example': 503,
        'https://c.example': refused(),
      },
    });
    const res = await worker.fetch(req(), env, ctx);
    expect(res.status).toBe(502);
    expect(fetchImpl.calls.map((c) => c.host)).toEqual([
      'https://a.example',
      'https://b.example',
      'https://c.example',
    ]);
  });

  test('gives /api/coding/run the longer timeout but not paths that only start the same', async () => {
    const slow = () =>
      new Promise((resolve) => setTimeout(() => resolve(new Response('ran')), 120));
    const { worker, env, ctx } = setup({ answers: { 'https://a.example': slow } });
    const run = await worker.fetch(
      req('/api/coding/run', { method: 'POST', body: '{}' }),
      env,
      ctx,
    );
    expect(run.headers.get('X-Served-By')).toBe('a');
    const other = await worker.fetch(req('/api/coding/runaway'), env, ctx);
    expect(other.headers.get('X-Served-By')).toBe('b');
  });
});

describe('health state from live traffic', () => {
  test('marks a host down after two failed requests in a row', async () => {
    const { worker, env, ctx } = setup({ answers: { 'https://a.example': 503 } });
    await worker.fetch(req(), env, ctx);
    await ctx.settle();
    expect(env.FAILOVER_STATE.read().a.healthy).toBe(true);
    await worker.fetch(req(), env, ctx);
    await ctx.settle();
    expect(env.FAILOVER_STATE.read().a.healthy).toBe(false);
  });

  test('ignores entries for hosts no longer listed and treats new hosts as up', async () => {
    const { worker, env, ctx } = setup({
      hosts: [C, A],
      health: { old: { healthy: true, fail: 0, ok: 5 } },
    });
    const res = await worker.fetch(req(), env, ctx);
    expect(res.headers.get('X-Served-By')).toBe('c');
  });
});

describe('scheduled probe', () => {
  test('pings the health path of every host, which also keeps them warm', async () => {
    const { worker, fetchImpl, env, ctx } = setup();
    await worker.scheduled({}, env, ctx);
    expect(fetchImpl.calls.map((c) => `${c.host}${c.path}`)).toEqual([
      'https://a.example/api/health',
      'https://b.example/api/health',
      'https://c.example/api/health',
    ]);
  });

  test('marks a host down after two failed probes and up again after two good ones', async () => {
    const answers = { 'https://b.example': 503 };
    const { worker, env, ctx } = setup({ answers });
    await worker.scheduled({}, env, ctx);
    expect(env.FAILOVER_STATE.read().b.healthy).toBe(true);
    await worker.scheduled({}, env, ctx);
    expect(env.FAILOVER_STATE.read().b.healthy).toBe(false);

    answers['https://b.example'] = 200;
    await worker.scheduled({}, env, ctx);
    expect(env.FAILOVER_STATE.read().b.healthy).toBe(false);
    await worker.scheduled({}, env, ctx);
    expect(env.FAILOVER_STATE.read().b.healthy).toBe(true);
  });

  test('counts a probe that times out as a failure', async () => {
    const { worker, env, ctx } = setup({ answers: { 'https://c.example': 'hang' } });
    await worker.scheduled({}, env, ctx);
    await worker.scheduled({}, env, ctx);
    expect(env.FAILOVER_STATE.read().c.healthy).toBe(false);
  });

  // The free KV plan allows 1,000 writes a day and the cron runs 288 times a day.
  test('writes KV only when something changed', async () => {
    const steady = { healthy: true, fail: 0, ok: 2 };
    const { worker, env, ctx } = setup({ health: { a: steady, b: steady, c: steady } });
    await worker.scheduled({}, env, ctx);
    await worker.scheduled({}, env, ctx);
    expect(env.FAILOVER_STATE.puts).toBe(0);
  });
});

describe('hosting/hosts.json', () => {
  test('the deployed worker uses the enabled hosts in file order', () => {
    const enabled = hostsFile.hosts.filter((h) => h.enabled !== false).map((h) => h.name);
    expect(HOSTS.map((h) => h.name)).toEqual(enabled);
    expect(HOSTS.length).toBeGreaterThan(0);
  });

  test('every host has a unique name and an https origin with no path or trailing slash', () => {
    const names = hostsFile.hosts.map((h) => h.name);
    expect(new Set(names).size).toBe(names.length);
    for (const host of hostsFile.hosts) {
      const url = new URL(host.origin);
      expect(url.protocol).toBe('https:');
      expect(host.origin).toBe(url.origin);
    }
  });
});
