// In-memory sliding-window rate limiter for Next.js Route Handlers.
// Mirrors backend/utils/monitoring.js's RateLimiter class — same approach,
// separate implementation since the Next.js server and Express backend are
// different processes that share no code (see backend/CLAUDE.md).
class RateLimiter {
  private requests = new Map<string, number[]>();

  constructor(
    private maxRequests: number,
    private windowMs: number,
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [id, timestamps] of this.requests.entries()) {
      const valid = timestamps.filter((t) => t > windowStart);
      if (valid.length === 0) {
        this.requests.delete(id);
      } else {
        this.requests.set(id, valid);
      }
    }

    const recent = (this.requests.get(identifier) || []).filter((t) => t > windowStart);
    if (recent.length >= this.maxRequests) return false;

    recent.push(now);
    this.requests.set(identifier, recent);
    return true;
  }
}

export const contactLimiter = new RateLimiter(5, 10 * 60 * 1000); // 5 per 10 min per IP

// Same header precedence the Express backend uses (analyticsController.js) —
// Cloudflare's header is authoritative since every request is proxied through it.
export function getClientIp(req: Request): string {
  const headers = req.headers;
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}
