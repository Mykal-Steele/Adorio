import { NextResponse } from 'next/server';

interface Droplet {
  id: number;
  memoryMb: number;
}
let droplet: Droplet | null = null;
let cache: { cpu: string; memory: string; ts: number } | null = null;

export const dynamic = 'force-dynamic';

async function resolveDroplet(token: string): Promise<Droplet | null> {
  if (droplet) return droplet;
  const res = await fetch('https://api.digitalocean.com/v2/droplets?name=adorio', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const json = await res.json();
  const d = json?.droplets?.[0];
  if (!d) return null;
  droplet = { id: d.id, memoryMb: d.memory };
  return droplet;
}

type MetricRow = { metric?: Record<string, string>; values: [number, string][] };

function avg(values: [number, string][]): number {
  if (!values.length) return 0;
  return values.reduce((s, [, v]) => s + parseFloat(v), 0) / values.length;
}

function avgByMode(results: MetricRow[], mode: string): number {
  return avg(results.find((r) => r.metric?.mode === mode)?.values ?? []);
}

function avgAll(results: MetricRow[]): number {
  return results.reduce((s, r) => s + avg(r.values), 0);
}

export async function GET() {
  if (cache && Date.now() - cache.ts < 60_000) {
    return NextResponse.json({ cpu: cache.cpu, memory: cache.memory, ts: cache.ts });
  }

  const token = process.env.DO_API_TOKEN;
  if (!token) return NextResponse.json({ cpu: null, memory: null });

  try {
    const d = await resolveDroplet(token);
    if (!d) return NextResponse.json({ cpu: null, memory: null });

    const now = Math.floor(Date.now() / 1000);
    const params = `host_id=${d.id}&start=${now - 3600}&end=${now}`;
    const headers = { Authorization: `Bearer ${token}` };
    const opts = { headers, cache: 'no-store' as const };

    const [cpuRes, memAvailRes] = await Promise.all([
      fetch(`https://api.digitalocean.com/v2/monitoring/metrics/droplet/cpu?${params}`, opts),
      fetch(
        `https://api.digitalocean.com/v2/monitoring/metrics/droplet/memory_available?${params}`,
        opts,
      ),
    ]);

    const [cpuJson, memAvailJson] = await Promise.all([cpuRes.json(), memAvailRes.json()]);

    // CPU: 1-hour average across all vCPUs — (total_modes - idle) / total_modes
    const cpuResults: MetricRow[] = cpuJson?.data?.result ?? [];
    const cpuTotal = avgAll(cpuResults);
    const cpuIdle = avgByMode(cpuResults, 'idle');
    const cpu = cpuTotal > 0 ? `${(((cpuTotal - cpuIdle) / cpuTotal) * 100).toFixed(1)}%` : '—';

    // Memory: 1-hour average of available bytes vs total from droplet spec
    const memResults: MetricRow[] = memAvailJson?.data?.result ?? [];
    const availableBytes = avg(memResults[0]?.values ?? []);
    const totalBytes = d.memoryMb * 1024 * 1024;
    const memory =
      totalBytes > 0 ? `${(((totalBytes - availableBytes) / totalBytes) * 100).toFixed(1)}%` : '—';

    const ts = Date.now();
    cache = { cpu, memory, ts };
    return NextResponse.json({ cpu, memory, ts });
  } catch {
    return NextResponse.json({ cpu: null, memory: null });
  }
}
