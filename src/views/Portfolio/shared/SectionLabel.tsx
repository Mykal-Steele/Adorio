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
        margin: '0 0 24px',
      }}
    >
      {children}
    </h2>
  );
}
