'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, themeLabels, type ThemeName } from '../context/ThemeContext';
import { sans } from '../constants/fonts';
import { eyebrow } from '../constants/type';

interface ThemeSwitcherProps {
  showLabel?: boolean;
  onOpen?: () => void;
}

export function ThemeSwitcher({ showLabel = false, onOpen }: ThemeSwitcherProps) {
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
        onClick={() => {
          setOpen((v) => !v);
          onOpen?.();
        }}
        title="Switch Theme"
        aria-label="Switch Theme"
        className="ide-hover flex items-center justify-center gap-1.5"
        style={{
          background: open ? 'var(--ide-border-subtle)' : 'transparent',
          border: '1px solid var(--ide-border)',
          cursor: 'pointer',
          padding: showLabel ? '5px 10px' : 8,
          borderRadius: 4,
          fontSize: 14,
          fontFamily: sans,
          color: 'var(--ide-text-3)',
        }}
      >
        <Palette size={showLabel ? 14 : 16} />
        {showLabel && <span>Theme</span>}
      </button>
      {open && (
        <div
          className="absolute right-0 z-50"
          style={{
            top: 'calc(100% + 6px)',
            background: 'var(--ide-bg-3)',
            border: '1px solid var(--ide-border)',
            borderRadius: 6,
            minWidth: 190,
            padding: '6px 0',
            boxShadow: 'var(--ide-card-shadow)',
            animation: 'dropdownOpen 0.14s ease-out',
            transformOrigin: 'top right',
          }}
        >
          <div style={{ ...eyebrow, fontSize: 11, padding: '4px 12px 6px' }}>Color theme</div>
          {(Object.keys(themeLabels) as ThemeName[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                setOpen(false);
              }}
              className="ide-hover w-full flex items-center gap-2 px-3 py-1.5"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: sans,
                color: theme === t ? 'var(--ide-text-1)' : 'var(--ide-text-3)',
                fontWeight: theme === t ? 700 : 400,
                textAlign: 'left',
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
