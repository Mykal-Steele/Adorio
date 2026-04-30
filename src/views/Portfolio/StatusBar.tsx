'use client';

import { usePathname } from 'next/navigation';
import { GitBranch, Wifi, Terminal } from 'lucide-react';
import { useIDE } from './context/IDEContext';
import { useResponsive } from './hooks/useResponsive';
import { portfolioData } from './data/portfolio';
import { mono, sans } from './constants/fonts';

const langMap: Record<string, string> = {
  '/': 'TypeScript JSX',
  '/about': 'Markdown',
  '/projects': 'JSON',
  '/contact': 'Shell Script',
};

export function StatusBar() {
  const pathname = usePathname();
  const { toggleTerminal } = useIDE();
  const { isTablet } = useResponsive();

  const isProject = pathname.startsWith('/projects/');
  const lang = isProject ? 'TypeScript' : langMap[pathname] || 'TypeScript';

  return (
    <div
      className="shrink-0 flex items-center justify-between px-3 gap-2 overflow-hidden"
      style={{
        height: 24,
        background: 'var(--ide-accent-dark)',
        fontFamily: mono,
        fontSize: 10,
        flexShrink: 0,
      }}
    >
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5" style={{ color: 'var(--ide-accent-light)' }}>
          <GitBranch size={10} />
          <span>ROOT@{portfolioData.handle}:~$</span>
        </div>
        <span style={{ color: 'var(--ide-accent-light-a70)' }}>
          {!isTablet && 'Compilation Successful'}
        </span>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span style={{ color: 'var(--ide-accent-light-a60)', fontFamily: mono }}>
          UTF-8 | {lang}
        </span>
        <a
          href={`https://${portfolioData.github}`}
          target="_blank"
          rel="noreferrer"
          style={{
            color: 'var(--ide-accent-light)',
            textDecoration: 'none',
            fontSize: 10,
            fontFamily: sans,
          }}
        >
          GitHub
        </a>
        <a
          href={`https://${portfolioData.linkedin}`}
          target="_blank"
          rel="noreferrer"
          style={{
            color: 'var(--ide-accent-light)',
            textDecoration: 'none',
            fontSize: 10,
            fontFamily: sans,
          }}
        >
          LinkedIn
        </a>
        <button
          onClick={toggleTerminal}
          className="flex items-center gap-1"
          style={{
            background: 'var(--ide-accent-light-a15)',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ide-accent-light)',
            fontSize: 10,
            fontFamily: sans,
            padding: '1px 6px',
          }}
        >
          <Terminal size={9} />
          Terminal
        </button>
        <div className="flex items-center gap-1" style={{ color: 'var(--ide-accent-light)' }}>
          <Wifi size={9} />
          <span style={{ fontFamily: sans }}>Connected</span>
        </div>
      </div>
    </div>
  );
}
