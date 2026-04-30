'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme metadata — actual CSS variables live in globals.css as [data-theme="X"] blocks.
// Here we only keep the JS-side metadata needed by the UI (labels, accent swatches).

export type ThemeName = 'midnight' | 'nord' | 'dracula' | 'one-dark' | 'catppuccin';

export const themeLabels: Record<ThemeName, string> = {
  midnight: 'Midnight',
  nord: 'Nord',
  dracula: 'Dracula',
  'one-dark': 'One Dark',
  catppuccin: 'Catppuccin Mocha',
};

export const themeAccents: Record<ThemeName, string> = {
  midnight: '#00ffc2',
  nord: '#88c0d0',
  dracula: '#bd93f9',
  'one-dark': '#61afef',
  catppuccin: '#cba6f7',
};

// Font size context — font size is the only IDE setting not handled by next-themes,
// so we keep a tiny React context for it. Everything else (theme name, persistence,
// SSR blocking script) is delegated to next-themes via the root Providers.tsx.

interface IDESettingsContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
}

const IDESettingsContext = createContext<IDESettingsContextType | null>(null);

function getInitialFontSize(): number {
  if (typeof window === 'undefined') return 13;
  try {
    const stored = localStorage.getItem('ide-font-size');
    if (stored) {
      const n = parseInt(stored, 10);
      if (n >= 10 && n <= 16) return n;
    }
  } catch {
    // localStorage unavailable (e.g. private browsing with strict settings)
  }
  return 13;
}

// Wrap the IDE section with this to make fontSize available via useTheme().
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState(13);

  // Read persisted font size after mount (localStorage is client-only).
  useEffect(() => {
    setFontSizeState(getInitialFontSize());
  }, []);

  // Persist and apply the --ide-editor-font-size CSS variable whenever it changes.
  const setFontSize = (size: number) => {
    setFontSizeState(size);
    try {
      localStorage.setItem('ide-font-size', String(size));
    } catch {}
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--ide-editor-font-size', `${fontSize}px`);
  }, [fontSize]);

  return (
    <IDESettingsContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </IDESettingsContext.Provider>
  );
}

// useTheme hook — combines next-themes (theme name + setTheme) with our fontSize context.
// Consumers import this and get the same API shape as before.

export function useTheme() {
  const { theme: nextTheme, setTheme: nextSetTheme } = useNextTheme();
  const ctx = useContext(IDESettingsContext);

  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');

  // next-themes returns undefined on the server before hydration; fall back to midnight.
  const theme = (nextTheme as ThemeName) ?? 'midnight';
  const setTheme = (t: ThemeName) => nextSetTheme(t);

  return { theme, setTheme, fontSize: ctx.fontSize, setFontSize: ctx.setFontSize };
}
