'use client';

import { sans } from './constants/fonts';
import { ThemeSwitcher } from './shared';

export function TitleBar() {
  return (
    <div
      className="shrink-0 flex items-center justify-between px-4"
      style={{
        height: 48,
        borderBottom: '2px solid var(--nb-border)',
        background: 'var(--ide-bg-0)',
        fontFamily: sans,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          style={{
            color: 'var(--ide-text-1)',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          Portfolio
        </span>
      </div>

      <ThemeSwitcher showLabel />
    </div>
  );
}
