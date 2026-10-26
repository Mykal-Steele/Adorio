'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_START_EVENT = 'adorio:nav-start';
// Most page changes are prefetched and land faster than this. Showing the bar for those
// reads as a flicker, so it only appears once a navigation is actually taking a while.
const SHOW_DELAY_MS = 150;
const STUCK_TIMEOUT_MS = 10000;
const FINISH_MS = 350;

// Thin bar at the top of every page while a page change is slow. How it moves is in
// globals.css (.nav-progress): it keeps creeping instead of stopping partway, then finishes
// fast, because a bar that stalls makes the same wait feel longer.
export function NavigationProgressBar() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle');
  // A new key restarts the creep when another navigation starts during the finish
  const [run, setRun] = useState(0);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stuckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownPath = useRef(pathname);

  useEffect(() => {
    function handleStart(e: Event) {
      const url = (e as CustomEvent<{ url?: string }>).detail?.url;
      // Search-only changes stay on the same page, so there's nothing to wait for
      if (url && new URL(url, window.location.origin).pathname === window.location.pathname) {
        return;
      }
      if (showTimer.current) clearTimeout(showTimer.current);
      if (stuckTimer.current) clearTimeout(stuckTimer.current);
      showTimer.current = setTimeout(() => {
        setRun((n) => n + 1);
        setPhase('loading');
      }, SHOW_DELAY_MS);
      stuckTimer.current = setTimeout(() => setPhase('idle'), STUCK_TIMEOUT_MS);
    }
    window.addEventListener(NAV_START_EVENT, handleStart);
    return () => window.removeEventListener(NAV_START_EVENT, handleStart);
  }, []);

  useEffect(() => {
    if (shownPath.current === pathname) return;
    shownPath.current = pathname;
    if (showTimer.current) clearTimeout(showTimer.current);
    if (stuckTimer.current) clearTimeout(stuckTimer.current);
    // Only finish the bar if it was showing. An instant navigation never shows it at all.
    setPhase((p) => (p === 'loading' ? 'done' : 'idle'));
    const t = setTimeout(() => setPhase('idle'), FINISH_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  if (phase === 'idle') return null;

  return (
    <div key={run} aria-hidden className="nav-progress" data-nav-progress data-state={phase}>
      <div className="nav-progress-fill" />
    </div>
  );
}
