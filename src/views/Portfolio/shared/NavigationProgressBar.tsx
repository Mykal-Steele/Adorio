'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_START_EVENT = 'adorio:nav-start';
const STUCK_TIMEOUT_MS = 6000;
const DONE_FADE_MS = 260;

export function NavigationProgressBar() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle');
  const stuckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    function handleStart() {
      setPhase('loading');
      if (stuckTimer.current) clearTimeout(stuckTimer.current);
      stuckTimer.current = setTimeout(() => setPhase('idle'), STUCK_TIMEOUT_MS);
    }
    window.addEventListener(NAV_START_EVENT, handleStart);
    return () => window.removeEventListener(NAV_START_EVENT, handleStart);
  }, []);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    if (stuckTimer.current) clearTimeout(stuckTimer.current);
    setPhase('done');
    const t = setTimeout(() => setPhase('idle'), DONE_FADE_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  if (phase === 'idle') return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 300,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: phase === 'done' ? '100%' : '78%',
          background: 'var(--ide-accent)',
          boxShadow: '0 0 8px var(--ide-accent-light-a60), 0 0 2px var(--ide-accent)',
          opacity: phase === 'done' ? 0 : 1,
          transition:
            phase === 'done'
              ? `width 200ms ease-out, opacity ${DONE_FADE_MS}ms ease-out 100ms`
              : 'width 900ms cubic-bezier(0.2, 0.65, 0.3, 1)',
        }}
      />
    </div>
  );
}
