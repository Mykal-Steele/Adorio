'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_START_EVENT = 'adorio:nav-start';

// The active tab only moves once a navigation finishes, which on a slow origin feels
// like the click did nothing. Tracks where an in-flight navigation is headed (from
// onRouterTransitionStart) so the tab can light up on click.
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
