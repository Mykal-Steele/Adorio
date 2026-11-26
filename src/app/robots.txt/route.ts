import { robotsTxt } from '@/lib/robotsTxt';

// a route instead of robots.ts, because Next's robots.ts can't write Content-Signal lines
export const dynamic = 'force-static';

export function GET() {
  return new Response(robotsTxt(), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
