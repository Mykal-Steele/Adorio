import { serif } from '../constants/fonts';
import type { ReactNode } from 'react';

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: serif,
        fontSize: 28,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
        color: 'var(--ide-text-1)',
        margin: '0 0 32px',
      }}
    >
      {/* The stroke sits below the descenders so it never crosses letters like g, j, p */}
      <span
        style={{
          display: 'inline-block',
          paddingBottom: 10,
          background:
            'linear-gradient(var(--ide-yellow), var(--ide-yellow)) left bottom / 100% 4px no-repeat',
        }}
      >
        {children}
      </span>
    </h2>
  );
}
