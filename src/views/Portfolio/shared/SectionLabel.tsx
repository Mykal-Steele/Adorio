import { sans } from '../constants/fonts';
import type { ReactNode } from 'react';

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9,
        fontFamily: sans,
        fontWeight: 700,
        color: 'var(--ide-text-6)',
        letterSpacing: '0.14em',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ width: 20, height: 1, background: 'var(--ide-orange)' }} />
      {children}
    </div>
  );
}
