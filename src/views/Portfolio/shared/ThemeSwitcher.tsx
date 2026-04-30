'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, themeLabels, type ThemeName } from '../context/ThemeContext';
import { sans } from '../constants/fonts';

interface ThemeSwitcherProps {
  showLabel?: boolean;
}

export function ThemeSwitcher({ showLabel = false }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative" data-guide="theme-switcher">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Switch Theme"
        className="rainbow-btn flex items-center justify-center gap-1.5"
        style={{
          background: open ? 'var(--ide-border-medium)' : 'var(--ide-border-subtle)',
          border: '1px solid var(--ide-border)',
          cursor: 'pointer',
          padding: showLabel ? '2px 6px' : '4px 8px',
          borderRadius: 4,
          fontSize: 10,
          fontFamily: sans,
          letterSpacing: '0.04em',
          color: open ? 'var(--ide-text-1)' : 'var(--ide-text-5)',
        }}
      >
        <Palette
          size={showLabel ? 12 : 14}
          className={open ? '' : 'rainbow-icon'}
          style={open ? { color: 'var(--ide-text-1)' } : undefined}
        />
        {showLabel && <span className={open ? '' : 'rainbow-icon'}>THEME</span>}
      </button>
      {open && (
        <div
          className="absolute right-0 z-50"
          style={{
            top: 'calc(100% + 6px)',
            background: 'var(--ide-bg-2)',
            border: '1px solid var(--ide-border-medium)',
            borderRadius: 4,
            minWidth: 180,
            padding: '4px 0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            animation: 'dropdownOpen 0.14s ease-out',
            transformOrigin: 'top right',
          }}
        >
          <div
            style={{
              padding: '4px 10px 6px',
              fontSize: 9,
              color: 'var(--ide-text-5)',
              letterSpacing: '0.1em',
              fontFamily: sans,
            }}
          >
            COLOR THEME
          </div>
          {(Object.keys(themeLabels) as ThemeName[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5"
              style={{
                background: theme === t ? 'var(--ide-border)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: sans,
                color: theme === t ? 'var(--ide-accent)' : 'var(--ide-text-2)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (theme !== t)
                  (e.currentTarget as HTMLElement).style.background = 'var(--ide-border-subtle)';
              }}
              onMouseLeave={(e) => {
                if (theme !== t) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <span style={{ width: 14, display: 'inline-flex', justifyContent: 'center' }}>
                {theme === t && <Check size={12} />}
              </span>
              {themeLabels[t]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
