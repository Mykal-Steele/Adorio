'use client';

import { Terminal as TerminalIcon } from 'lucide-react';
import { useIDE } from './context/IDEContext';
import { portfolioData } from './data/portfolio';
import { sans } from './constants/fonts';

export function StatusBar() {
  const { toggleTerminal } = useIDE();

  return (
    <div
      className="shrink-0 flex items-center justify-between px-3 gap-4 overflow-hidden"
      style={{
        height: 28,
        background: 'var(--ide-bg-1)',
        borderTop: '1px solid var(--ide-border)',
        fontFamily: sans,
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      <span style={{ color: 'var(--ide-text-4)' }}>
        {portfolioData.location} · {portfolioData.timezone}
      </span>

      <div className="flex items-center gap-4 shrink-0">
        <a
          href={`https://${portfolioData.github}`}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          style={{ color: 'var(--ide-text-4)', textDecoration: 'none' }}
        >
          GitHub
        </a>
        <a
          href={`https://${portfolioData.linkedin}`}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          style={{ color: 'var(--ide-text-4)', textDecoration: 'none' }}
        >
          LinkedIn
        </a>
        <a
          href={`mailto:${portfolioData.email}`}
          className="hover:underline"
          style={{ color: 'var(--ide-text-4)', textDecoration: 'none' }}
        >
          Email
        </a>
        <button
          onClick={toggleTerminal}
          className="flex items-center gap-1.5 hover:underline"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ide-text-4)',
            fontSize: 13,
            fontFamily: sans,
            padding: 0,
          }}
        >
          <TerminalIcon size={12} />
          Terminal
        </button>
      </div>
    </div>
  );
}
