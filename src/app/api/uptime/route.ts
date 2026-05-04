import { NextResponse } from 'next/server';

interface UptimeMonitor {
  id: number;
  friendly_name: string;
  status: number;
  average_response_time: string;
  custom_uptime_ratio: string;
}

let cache: { data: UptimeMonitor[]; ts: number } | null = null;

export const dynamic = 'force-dynamic';

export async function GET() {
  if (cache && Date.now() - cache.ts < 60_000) {
    return NextResponse.json({ monitors: cache.data, ts: cache.ts });
  }

  const key = process.env.UPTIMEROBOT_API_KEY;
  if (!key) return NextResponse.json([]);

  try {
    const res = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        api_key: key,
        format: 'json',
        custom_uptime_ratios: '7',
        logs: '0',
      }).toString(),
    });

    const json = await res.json();
    if (json.stat !== 'ok') return NextResponse.json([]);

    const ts = Date.now();
    cache = { data: json.monitors, ts };
    return NextResponse.json({ monitors: json.monitors, ts });
  } catch {
    return NextResponse.json([]);
  }
}
