import API from './index';

import { generateBrowserFingerprint, generateVisitorId } from '../utils/browserFingerprinting';
import { withPerformanceTracking } from '../utils/frontendMonitoring';
import { TRACK_ENDPOINT } from './constants/analytics_const';
import type { TrackPageViewPayload } from './types/analytics';

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

      // Fingerprint and visitor ID with axios-style timeout via Promise.allSettled
      const fingerprintPromise = generateBrowserFingerprint();
      const visitorPromise = generateVisitorId();

      const [fingerprintResult, visitorResult] = await Promise.allSettled([
        fingerprintPromise,
        visitorPromise,
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
      // Complete failure - don't break the site
      if (process.env.NODE_ENV === 'development') {
        console.error('Analytics tracking completely failed:', mainError);
      }
    }
  },
);

const fetchPageViewSummary = async (params = {}) => {
  const response = await API.get('/stats/page-views', { params });
  return response.data;
};

const fetchRecentVisits = async (params = {}) => {
  const response = await API.get('/stats/recent', { params });
  return response.data;
};

const fetchVisitorStats = async (params = {}) => {
  const response = await API.get('/stats/visitor-stats', { params });
  return response.data;
};

const fetchVisitorDetails = async (visitorId: string) => {
  const response = await API.get(`/stats/visitor/${visitorId}`);
  return response.data;
};

export {
  trackPageView,
  fetchPageViewSummary,
  fetchRecentVisits,
  fetchVisitorStats,
  fetchVisitorDetails,
};
