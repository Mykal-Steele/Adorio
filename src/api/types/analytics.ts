export interface TrackPageViewPayload {
  path?: string;
  fullUrl?: string;
  referrer?: string;
  durationMs?: number;
  locale?: string;
  timezoneOffset?: number;
  metadata?: Record<string, unknown>;
  visitorId?: string;
  sessionId?: string;
  userId?: string;
}
