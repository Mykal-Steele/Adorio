'use client';

import { serif } from './constants/fonts';
import { ThemeSwitcher } from './shared';

export function TitleBar() {
  return (
    <div
      className="shrink-0 flex items-center justify-between px-4"
      style={{
        height: 48,
        borderBottom: '1px solid var(--ide-border)',
        background: 'var(--ide-bg-1)',
      }}
    >
      <span
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--ide-text-1)',
        }}
      >
        Portfolio
      </span>

      <ThemeSwitcher showLabel />
    </div>
  );
}
