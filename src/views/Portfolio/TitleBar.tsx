'use client';

import { Zap } from 'lucide-react';
import { portfolioData } from './data/portfolio';
import { sans } from './constants/fonts';
import { ThemeSwitcher } from './shared';

export function TitleBar() {
  return (
    <div
      className="shrink-0 flex items-center justify-between px-4 border-b"
      style={{
        height: 44,
        background: 'var(--ide-bg-0)',
        borderColor: 'var(--ide-border)',
        fontFamily: sans,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center"
          style={{ width: 28, height: 28, background: 'var(--ide-accent)' }}
          aria-hidden="true"
        >
          <Zap size={14} color="var(--ide-bg-1)" strokeWidth={2.5} />
        </div>
        <span
          style={{
            color: 'var(--ide-text-1)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          {portfolioData.handle}
        </span>
      </div>

      <ThemeSwitcher showLabel />
    </div>
  );
}
