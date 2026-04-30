'use client';

import { Search, GitBranch, Zap } from 'lucide-react';
import { portfolioData } from './data/portfolio';
import { useResponsive } from './hooks/useResponsive';
import { sans } from './constants/fonts';
import { ThemeSwitcher } from './shared';

export function TitleBar() {
  const { isTablet } = useResponsive();

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
      {/* Brand */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 mr-2">
          <div
            className="flex items-center justify-center"
            style={{ width: 28, height: 28, background: 'var(--ide-accent)' }}
            aria-hidden="true"
          >
            <Zap size={14} color="var(--ide-accent-dark)" strokeWidth={2.5} />
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
          <span
            style={{
              background: 'var(--ide-accent-a12)',
              color: 'var(--ide-accent)',
              fontSize: 10,
              padding: '1px 6px',
              letterSpacing: '0.05em',
            }}
            aria-label={`Version ${portfolioData.version}`}
          >
            {portfolioData.version}
          </span>
        </div>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        {!isTablet && (
          <div
            className="flex items-center gap-2 px-3"
            style={{
              height: 28,
              background: 'var(--ide-bg-3)',
              border: '1px solid var(--ide-border-medium)',
              minWidth: 200,
            }}
            role="search"
            aria-label="Portfolio search (decorative)"
          >
            <Search size={12} color="var(--ide-text-6)" aria-hidden="true" />
            <span style={{ fontSize: 11, color: 'var(--ide-text-6)' }}>Go to file...</span>
            <span
              style={{ fontSize: 10, color: 'var(--ide-text-9)', marginLeft: 'auto' }}
              aria-hidden="true"
            >
              ⌘P
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <ThemeSwitcher showLabel />
          <div
            className="flex items-center gap-1 px-2"
            style={{
              height: 24,
              background: 'var(--ide-accent)',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--ide-accent-dark)',
              letterSpacing: '0.05em',
            }}
            aria-label={`Current branch: ${portfolioData.branch}`}
          >
            <GitBranch size={10} aria-hidden="true" />
            main
          </div>
        </div>
      </div>
    </div>
  );
}
