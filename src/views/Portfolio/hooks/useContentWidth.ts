'use client';

import { useLayoutEffect, useState } from 'react';

// Width of the editor area, which is narrower than the window when the explorer is open.
// Layouts that switch between one and two columns read this instead of the window size.
export function useContentWidth() {
  const [width, setWidth] = useState(1200);

  // Layout effect: read the width before the first paint, so the page never jumps
  useLayoutEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    setWidth(main.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(main);
    return () => observer.disconnect();
  }, []);

  return width;
}
