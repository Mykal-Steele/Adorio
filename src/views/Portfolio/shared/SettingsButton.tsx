'use client';

import { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import { useIDE } from '../context/IDEContext';
import { sans, serif } from '../constants/fonts';

export function SettingsButton() {
  const { themeHintEnabled, setThemeHintEnabled } = useIDE();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        title="Settings"
        aria-label="Settings"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="ide-hover flex items-center justify-center"
        style={{
          width: 52,
          height: 48,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Settings
          size={22}
          strokeWidth={1.75}
          color={open ? 'var(--ide-text-1)' : 'var(--ide-text-5)'}
        />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Settings"
          className="absolute z-50"
          style={{
            left: 'calc(100% + 8px)',
            bottom: 0,
            width: 260,
            padding: 16,
            background: 'var(--ide-bg-3)',
            border: '1px solid var(--ide-border)',
            borderRadius: 6,
            boxShadow: 'var(--ide-card-shadow)',
            animation: 'dropdownOpen 150ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          <p
            style={{
              margin: '0 0 12px',
              fontFamily: serif,
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--ide-text-1)',
            }}
          >
            Settings
          </p>
          <label
            className="flex cursor-pointer items-center justify-between"
            style={{ gap: 12, fontFamily: sans, fontSize: 15, color: 'var(--ide-text-2)' }}
          >
            Show the theme tip
            <input
              type="checkbox"
              role="switch"
              checked={themeHintEnabled}
              onChange={(e) => setThemeHintEnabled(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--ide-text-2)', cursor: 'pointer' }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
