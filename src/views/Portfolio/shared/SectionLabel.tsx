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
      <span
        style={{
          padding: '0 4px',
          background:
            'linear-gradient(transparent 80%, var(--ide-yellow) 80%, var(--ide-yellow) 92%, transparent 92%)',
        }}
      >
        {children}
      </span>
    </h2>
  );
}
