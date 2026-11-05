import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { usePathname } from 'next/navigation';
import { createScrollMemory } from '../scrollMemory';

let memory: ReturnType<typeof createScrollMemory> | null = null;

function getMemory() {
  if (!memory) {
    let storage: Storage | null = null;
    try {
      storage = window.sessionStorage;
    } catch {
      // Storage blocked: positions last until the page is refreshed
    }
    memory = createScrollMemory(storage);
  }
  return memory;
}

// Closing a tab is like closing a file in an editor: next time it opens at the top
export function forgetScroll(path: string) {
  const scrollMemory = getMemory();
  scrollMemory.forget(path);
  scrollMemory.persist();
}

export function forgetScrollExcept(path: string) {
  const scrollMemory = getMemory();
  scrollMemory.forgetExcept(path);
  scrollMemory.persist();
}

// Keeps each page where you left it when you come back to it, and after a refresh.
// A page you have not visited yet starts at the top.
export function useScrollMemory(scroller: RefObject<HTMLElement | null>) {
  const pathname = usePathname();
  const activePath = useRef(pathname);

  // Before the browser paints the new page, put it where it was left. The router scrolls to
  // the top of a new page during the same update, so this runs after it and wins.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    // Set before scrollTop changes, so the scroll event that causes is filed under this page
    activePath.current = pathname;
    const top = getMemory().visit(pathname);
    el.scrollTop = top;
    // Applied again next frame in case the router's own scroll landed after this effect
    const frame = requestAnimationFrame(() => {
      if (el.scrollTop !== top) el.scrollTop = top;
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, scroller]);

  // One listener for the life of the shell. It files each scroll under the page on screen.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const scrollMemory = getMemory();
    const persist = () => scrollMemory.persist();
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      scrollMemory.record(activePath.current, el.scrollTop);
      clearTimeout(timer);
      timer = setTimeout(persist, 150);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', persist);
    return () => {
      clearTimeout(timer);
      // Leaving the portfolio unmounts the shell without a pagehide, so save what is pending
      persist();
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', persist);
    };
  }, [scroller]);
}
