import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { trackPageView } from '../api/analytics';

const VISITOR_STORAGE_KEY = 'adorio:visitorId';
const SESSION_STORAGE_KEY = 'adorio:sessionId';

const createId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

const ensurePersistentId = (storage, key) => {
  if (!storage) {
    return createId();
  }

  try {
    const existing = storage.getItem(key);
    if (existing) {
      return existing;
    }

    const newId = createId();
    storage.setItem(key, newId);
    return newId;
  } catch (error) {
    return createId();
  }
};

const usePageTracking = () => {
  const location = useLocation();
  const user = useSelector((state) => state.user.user);
  const userId = user?._id || user?.id || null;

  const visitorIdRef = useRef(null);
  const sessionIdRef = useRef(null);
  const navigationRef = useRef({
    path: null,
    startedAt:
      typeof performance !== 'undefined' ? performance.now() : Date.now(),
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const local = window.localStorage ?? null;
    const session = window.sessionStorage ?? null;

    visitorIdRef.current = ensurePersistentId(local, VISITOR_STORAGE_KEY);
    sessionIdRef.current = ensurePersistentId(session, SESSION_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const fullPath =
      `${location.pathname}${location.search}${location.hash}` || '/';
    const nowPerformance =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    const previous = navigationRef.current;

    // Skip if this is the same path to avoid duplicate tracking
    if (previous?.path === fullPath) {
      return;
    }

    if (!visitorIdRef.current) {
      const local = window.localStorage ?? null;
      visitorIdRef.current = ensurePersistentId(local, VISITOR_STORAGE_KEY);
    }

    if (!sessionIdRef.current) {
      const session = window.sessionStorage ?? null;
      sessionIdRef.current = ensurePersistentId(session, SESSION_STORAGE_KEY);
    }

    const durationMs = previous?.path
      ? Math.max(0, nowPerformance - (previous.startedAt ?? nowPerformance))
      : undefined;

    const payload = {
      path: fullPath,
      fullUrl: window.location.href,
      referrer:
        typeof document !== 'undefined' && document.referrer
          ? document.referrer
          : undefined,
      durationMs,
      locale:
        typeof navigator !== 'undefined' && navigator.language
          ? navigator.language
          : undefined,
      timezoneOffset: new Date().getTimezoneOffset(),
      metadata: {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        event: 'route-change',
      },
      visitorId: visitorIdRef.current,
      sessionId: sessionIdRef.current,
      userId,
    };

    // Use setTimeout to batch analytics calls and prevent blocking
    setTimeout(() => {
      trackPageView(payload);
    }, 0);

    navigationRef.current = {
      path: fullPath,
      startedAt: nowPerformance,
    };
  }, [location.pathname, location.search, location.hash, userId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleBeforeUnload = () => {
      const nowPerformance =
        typeof performance !== 'undefined' ? performance.now() : Date.now();
      const { path, startedAt } = navigationRef.current || {};

      if (!path) {
        return;
      }

      trackPageView({
        path,
        fullUrl: window.location.href,
        referrer:
          typeof document !== 'undefined' && document.referrer
            ? document.referrer
            : undefined,
        durationMs: Math.max(0, nowPerformance - (startedAt ?? nowPerformance)),
        locale:
          typeof navigator !== 'undefined' && navigator.language
            ? navigator.language
            : undefined,
        timezoneOffset: new Date().getTimezoneOffset(),
        metadata: {
          event: 'unload',
        },
        visitorId: visitorIdRef.current,
        sessionId: sessionIdRef.current,
        userId,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);
};

export default usePageTracking;
