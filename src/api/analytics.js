import API from './index';
import { API_BASE_URL } from '../config/apiConfig';
import {
  generateBrowserFingerprint,
  generateVisitorId,
} from '../utils/browserFingerprinting';
import { withPerformanceTracking } from '../utils/frontendMonitoring';

const STATS_BASE = `${API_BASE_URL}/stats`;
const TRACK_ENDPOINT = `${STATS_BASE}/track`;

const normalizeDuration = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined;
  }

  return Math.max(0, Math.round(value));
};

const trackPageView = withPerformanceTracking(
  'tracking',
  async (payload = {}) => {
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

      // Generate comprehensive visitor fingerprint with timeout protection
      const fingerprintPromise = Promise.race([
        generateBrowserFingerprint(),
        new Promise((resolve) => setTimeout(() => resolve(null), 2000)), // 2 second timeout
      ]);

      const visitorPromise = Promise.race([
        generateVisitorId(),
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                persistentId: `timeout-${Date.now()}`,
                sessionId: `session-${Date.now()}`,
                fingerprint: null,
                storageCapabilities: null,
              }),
            1500
          )
        ), // 1.5 second timeout
      ]);

      const [fingerprint, visitorData] = await Promise.all([
        fingerprintPromise,
        visitorPromise,
      ]);

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
  }
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

const fetchVisitorDetails = async (visitorId) => {
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
