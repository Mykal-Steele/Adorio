import API from './index';

import { generateBrowserFingerprint, generateVisitorId } from '../utils/browserFingerprinting';
import { withPerformanceTracking } from '../utils/frontendMonitoring';
import { TRACK_ENDPOINT } from './constants/analytics_const';
import type { AnalyticsOverview, Period, TrackPageViewPayload } from './types/analytics';

const normalizeDuration = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined;
  }
  return Math.max(0, Math.round(value));
};

const trackPageView = withPerformanceTracking(
  'tracking',
  async (payload: TrackPageViewPayload = {}) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const {
        path,
        fullUrl,
        referrer,
        durationMs,
        locale,
        timezoneOffset,
        metadata,
        visitorId: providedVisitorId,
        sessionId: providedSessionId,
        userId,
      } = payload;

      if (!path) {
        return;
      }

      const timeout = <T>(ms: number, fallback: T): Promise<T> =>
        new Promise((resolve) => setTimeout(() => resolve(fallback), ms));

      const [fingerprintResult, visitorResult] = await Promise.allSettled([
        Promise.race([generateBrowserFingerprint(), timeout(1500, null)]),
        Promise.race([
          generateVisitorId(),
          timeout(1500, {
            persistentId: `timeout-${Date.now()}`,
            sessionId: `session-${Date.now()}`,
          }),
        ]),
      ]);

      const fingerprint = fingerprintResult.status === 'fulfilled' ? fingerprintResult.value : null;
      const visitorData =
        visitorResult.status === 'fulfilled'
          ? visitorResult.value
          : { persistentId: `fallback-${Date.now()}`, sessionId: `session-${Date.now()}` };

      const body = JSON.stringify({
        path,
        fullUrl,
        referrer,
        durationMs: normalizeDuration(durationMs),
        locale: locale || navigator.language || 'en',
        timezoneOffset: timezoneOffset || new Date().getTimezoneOffset(),
        metadata,
        visitorId: providedVisitorId || visitorData.persistentId,
        sessionId: providedSessionId || visitorData.sessionId,
        userId,
        fingerprint,
      });

      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const beaconPayload = new Blob([body], { type: 'application/json' });
        const sent = navigator.sendBeacon(TRACK_ENDPOINT, beaconPayload);
        if (sent) {
          return;
        }
      }

      try {
        await fetch(TRACK_ENDPOINT, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body,
          keepalive: true,
        });
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('failed to send stats beacon', error);
        }
      }
    } catch (mainError) {
      // tracking failing should never break the site
      if (process.env.NODE_ENV === 'development') {
        console.error('Analytics tracking completely failed:', mainError);
      }
    }
  },
);

const fetchMonthlyVisitors = async (params: { months?: number } = {}) => {
  const response = await API.get('/stats/monthly-visitors', { params });
  return response.data;
};

const fetchAnalyticsOverview = async (
  params: { period: Period; all?: boolean },
  signal?: AbortSignal,
): Promise<AnalyticsOverview> => {
  const response = await API.get('/stats/overview', { params, signal });
  return response.data;
};

export { trackPageView, fetchMonthlyVisitors, fetchAnalyticsOverview };
