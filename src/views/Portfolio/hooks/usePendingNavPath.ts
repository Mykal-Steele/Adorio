'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_START_EVENT = 'adorio:nav-start';

/**
 * The active-tab highlight normally only updates once a navigation actually
 * completes, which on a slow origin reads as "I clicked and nothing happened."
 * This tracks the destination of an in-flight navigation (from Next's
 * onRouterTransitionStart) so callers can highlight it immediately on click.
 */
export function usePendingNavPath() {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    function handleStart(e: Event) {
      const detail = (e as CustomEvent<{ url?: string }>).detail;
      if (!detail?.url) return;
      try {
        setPendingPath(new URL(detail.url, window.location.origin).pathname);
      } catch {
        // malformed url, ignore
      }
    }
    window.addEventListener(NAV_START_EVENT, handleStart);
    return () => window.removeEventListener(NAV_START_EVENT, handleStart);
  }, []);

  useEffect(() => {
    setPendingPath((p) => (p === pathname ? null : p));
  }, [pathname]);

  return pendingPath;
}
