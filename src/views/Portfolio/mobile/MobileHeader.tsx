'use client';

import { Menu, Zap } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { sans } from '../constants/fonts';
import { ThemeSwitcher } from '../shared';

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  return (
    <div
      className="shrink-0 flex items-center justify-between px-4"
      style={{
        height: 48,
        background: 'var(--ide-bg-0)',
        borderBottom: '1px solid var(--ide-border)',
        fontFamily: sans,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center"
          style={{ width: 24, height: 24, background: 'var(--ide-accent)' }}
        >
          <Zap size={12} color="var(--ide-accent-dark)" strokeWidth={2.5} />
        </div>
        <span
          style={{
            color: 'var(--ide-text-1)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          {portfolioData.handle}
        </span>
        <span style={{ color: 'var(--ide-text-6)', fontSize: 12 }}> // IDE</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <button
          onClick={onMenuOpen}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <Menu size={20} color="var(--ide-text-3)" />
        </button>
      </div>
    </div>
  );
}
