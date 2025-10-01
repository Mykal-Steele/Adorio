import API from './index';
import { API_BASE_URL } from '../config/apiConfig';

const TRACK_ENDPOINT = `${API_BASE_URL}/analytics/track`;

const normalizeDuration = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined;
  }

  return Math.max(0, Math.round(value));
};

const trackPageView = async (payload = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  const {
    path,
    fullUrl,
    referrer,
    durationMs,
    locale,
    timezoneOffset,
    metadata,
    visitorId,
    sessionId,
    userId,
  } = payload;

  if (!path) {
    return;
  }

  const body = JSON.stringify({
    path,
    fullUrl,
    referrer,
    durationMs: normalizeDuration(durationMs),
    locale,
    timezoneOffset,
    metadata,
    visitorId,
    sessionId,
    userId,
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
      console.warn('failed to send analytics beacon', error);
    }
  }
};

const fetchPageViewSummary = async (params = {}) => {
  const response = await API.get('/analytics/page-views', { params });
  return response.data;
};

const fetchRecentVisits = async (params = {}) => {
  const response = await API.get('/analytics/recent', { params });
  return response.data;
};

export { trackPageView, fetchPageViewSummary, fetchRecentVisits };
