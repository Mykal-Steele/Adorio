'use client';

import { useTheme as useNextTheme } from 'next-themes';

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
  // next-themes returns undefined on the server before hydration; fall back to paper.
  return { theme: (theme as ThemeName) ?? 'paper', setTheme: (t: ThemeName) => setTheme(t) };
}
