let dropletCache = null;
let metricsCache = null;
let uptimeCache = null;

async function resolveDroplet(token) {
  if (dropletCache) return dropletCache;
  const res = await fetch('https://api.digitalocean.com/v2/droplets?name=adorio', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const d = json?.droplets?.[0];
  if (!d) return null;
  dropletCache = { id: d.id, memoryMb: d.memory };
  return dropletCache;
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((s, [, v]) => s + parseFloat(v), 0) / values.length;
}

function avgByMode(results, mode) {
  return avg(results.find((r) => r.metric?.mode === mode)?.values ?? []);
}

function avgAll(results) {
  return results.reduce((s, r) => s + avg(r.values), 0);
}

export async function getServerMetrics() {
  if (metricsCache && Date.now() - metricsCache.ts < 60_000) return metricsCache;

  const token = process.env.DO_API_TOKEN;
  if (!token) return { cpu: null, memory: null };

  const d = await resolveDroplet(token);
  if (!d) return { cpu: null, memory: null };

  const now = Math.floor(Date.now() / 1000);
  const params = `host_id=${d.id}&start=${now - 3600}&end=${now}`;
  const headers = { Authorization: `Bearer ${token}` };

  const [cpuRes, memAvailRes] = await Promise.all([
    fetch(`https://api.digitalocean.com/v2/monitoring/metrics/droplet/cpu?${params}`, { headers }),
    fetch(`https://api.digitalocean.com/v2/monitoring/metrics/droplet/memory_available?${params}`, {
      headers,
    }),
  ]);

  const [cpuJson, memAvailJson] = await Promise.all([cpuRes.json(), memAvailRes.json()]);

  const cpuResults = cpuJson?.data?.result ?? [];
  const cpuTotal = avgAll(cpuResults);
  const cpuIdle = avgByMode(cpuResults, 'idle');
  const cpu = cpuTotal > 0 ? `${(((cpuTotal - cpuIdle) / cpuTotal) * 100).toFixed(1)}%` : '—';

  const memResults = memAvailJson?.data?.result ?? [];
  const availableBytes = avg(memResults[0]?.values ?? []);
  const totalBytes = d.memoryMb * 1024 * 1024;
  const memory =
    totalBytes > 0 ? `${(((totalBytes - availableBytes) / totalBytes) * 100).toFixed(1)}%` : '—';

  const ts = Date.now();
  metricsCache = { cpu, memory, ts };
  return metricsCache;
}

export async function getUptimeMonitors() {
  if (uptimeCache && Date.now() - uptimeCache.ts < 60_000) return uptimeCache;

  const key = process.env.UPTIMEROBOT_API_KEY;
  if (!key) return { monitors: [] };

  const res = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      api_key: key,
      format: 'json',
      custom_uptime_ratios: '7',
      logs: '0',
    }).toString(),
  });

  const json = await res.json();
  if (json.stat !== 'ok') return { monitors: [] };

  const ts = Date.now();
  uptimeCache = { monitors: json.monitors, ts };
  return uptimeCache;
}
