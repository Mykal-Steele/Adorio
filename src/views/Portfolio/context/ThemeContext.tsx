'use client';

import { flushSync } from 'react-dom';
import { useTheme as useNextTheme } from 'next-themes';
import { prefersReducedMotion } from '../motion';

// Theme metadata. The actual CSS variables live in globals.css as [data-theme="X"] blocks.
// Here we only keep the theme names and their menu labels.

export type ThemeName = 'paper' | 'midnight' | 'nord' | 'dracula' | 'one-dark' | 'catppuccin';

export const themeLabels: Record<ThemeName, string> = {
  paper: 'Paper',
  midnight: 'Midnight',
  nord: 'Nord',
  dracula: 'Dracula',
  'one-dark': 'One Dark',
  catppuccin: 'Catppuccin Mocha',
};

// next-themes owns the theme name, persistence, and the SSR blocking script (root Providers.tsx)
export function useTheme() {
  const { theme, setTheme } = useNextTheme();

  // Crossfade the whole page into the new theme instead of every color snapping at once.
  // The browser snapshots the old page, runs the update, then fades between the two.
  // Browsers without view transitions, and reduced motion, just switch.
  const switchTheme = (t: ThemeName) => {
    if (!document.startViewTransition || prefersReducedMotion()) {
      setTheme(t);
      return;
    }
    document.startViewTransition(() => {
      // next-themes sets the attribute in an effect. Setting it here as well makes sure the
      // new snapshot already has the new colors.
      document.documentElement.dataset.theme = t;
      flushSync(() => setTheme(t));
    });
  };

  // next-themes returns undefined on the server before hydration; fall back to paper.
  return { theme: (theme as ThemeName) ?? 'paper', setTheme: switchTheme };
}
