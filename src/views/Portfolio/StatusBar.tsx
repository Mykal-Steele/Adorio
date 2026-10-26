'use client';

import { useEffect, useState } from 'react';
import { Clock, Terminal as TerminalIcon } from 'lucide-react';
import { useIDE } from './context/IDEContext';
import { portfolioData } from './data/portfolio';
import { sans } from './constants/fonts';

const bangkokTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Bangkok',
  hour: 'numeric',
  minute: '2-digit',
});

// Oakar's local time, so a visitor can tell whether now is a sensible time to reach out.
// The pages are prerendered at build time, so the time is only known after mount. Until
// then a fixed placeholder holds the space, hidden, so the server HTML and the first
// render match. A real time in the server HTML made React throw the page away and render
// it again, which replayed every entrance animation.
function LocalTime() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="flex items-center gap-1.5" style={{ color: 'var(--ide-text-4)' }}>
      <Clock size={14} />
      <span style={{ visibility: now ? 'visible' : 'hidden' }}>
        {bangkokTime.format(now ?? new Date(0))} in Bangkok
      </span>
    </span>
  );
}

export function StatusBar() {
  const { toggleTerminal } = useIDE();

  return (
    <div
      className="shrink-0 flex items-center justify-between px-3 gap-4 overflow-hidden"
      style={{
        height: 30,
        background: 'var(--ide-bg-1)',
        borderTop: '1px solid var(--ide-border)',
        fontFamily: sans,
        fontSize: 14,
        flexShrink: 0,
      }}
    >
      <LocalTime />

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
            fontSize: 14,
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
