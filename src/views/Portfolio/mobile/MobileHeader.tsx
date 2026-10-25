'use client';

import { Menu } from 'lucide-react';
import { serif } from '../constants/fonts';
import { ThemeSwitcher, IconButton } from '../shared';

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  return (
    <div
      className="shrink-0 flex items-center justify-between px-4"
      style={{
        height: 48,
        background: 'var(--ide-bg-1)',
        borderBottom: '1px solid var(--ide-border)',
      }}
    >
      <div className="flex items-center gap-2">
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
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <IconButton onClick={onMenuOpen} aria-label="Open menu">
          <Menu size={20} color="var(--ide-text-3)" />
        </IconButton>
      </div>
    </div>
  );
}
