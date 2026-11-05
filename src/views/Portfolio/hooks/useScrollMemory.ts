import { useEffect, useLayoutEffect, type RefObject } from 'react';
import { usePathname } from 'next/navigation';
import {
  forgetPosition,
  keepOnlyPosition,
  loadScrollPositions,
  saveScrollPositions,
  scrollPositionFor,
  type ScrollPositions,
} from '../scrollMemory';

const memory = { positions: {} as ScrollPositions, loaded: false };

function session() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function ensureLoaded() {
  if (memory.loaded) return;
  memory.positions = loadScrollPositions(session());
  memory.loaded = true;
}

const persist = () => saveScrollPositions(session(), memory.positions);

// Closing a tab is like closing a file in an editor: next time it opens at the top
export function forgetScroll(path: string) {
  ensureLoaded();
  memory.positions = forgetPosition(memory.positions, path);
  persist();
}

export function forgetScrollExcept(path: string) {
  ensureLoaded();
  memory.positions = keepOnlyPosition(memory.positions, path);
  persist();
}

// Keeps each page where you left it when you come back to it, and after a refresh.
// A page you have not visited yet starts at the top.
export function useScrollMemory(scroller: RefObject<HTMLElement | null>) {
  const pathname = usePathname();

  // Before the browser paints the new page, put it where it was left. The router scrolls to
  // the top of a new page during the same update, so this runs after it and wins.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    ensureLoaded();
    const top = scrollPositionFor(memory.positions, pathname);
    el.scrollTop = top;
    // Applied again next frame in case the router's own scroll landed after this effect
    const frame = requestAnimationFrame(() => {
      if (el.scrollTop !== top) el.scrollTop = top;
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, scroller]);

  // Record the position as the page scrolls. The scroll events from a page change come after
  // the effect above has put the new page in place, so they are filed under the new path.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      memory.positions[pathname] = el.scrollTop;
      clearTimeout(timer);
      timer = setTimeout(persist, 150);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', persist);
    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', persist);
    };
  }, [pathname, scroller]);
}
