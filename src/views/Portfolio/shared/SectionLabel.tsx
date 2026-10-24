import { sans } from '../constants/fonts';
import type { ReactNode } from 'react';

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 24,
      }}
    >
      <h2
        style={{
          margin: 0,
          padding: '5px 11px',
          background: 'var(--nb-accent)',
          border: '2px solid var(--nb-border)',
          boxShadow: '3px 3px 0 var(--nb-shadow)',
          transform: 'rotate(-0.5deg)',
          fontFamily: sans,
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          color: 'var(--nb-on-accent)',
        }}
      >
        {children}
      </h2>
      <span style={{ flex: 1, height: 2, background: 'var(--nb-border)' }} />
    </div>
  );
}
