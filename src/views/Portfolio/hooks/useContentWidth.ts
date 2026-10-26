'use client';

import { useEffect, useState } from 'react';

// Width of the editor area, which is narrower than the window when the explorer is open.
// Layouts that switch between one and two columns read this instead of the window size.
export function useContentWidth() {
  const [width, setWidth] = useState(1200);

  // The observer reports the starting size too, in the next frame after layout. Reading
  // clientWidth here instead forced a full layout in the middle of hydration.
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(main);
    return () => observer.disconnect();
  }, []);

  return width;
}
