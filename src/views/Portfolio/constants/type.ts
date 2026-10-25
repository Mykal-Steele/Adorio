import { mono, sans } from './fonts';

// Small caps label used above titles and for card meta, the same style /coding uses
export const eyebrow = {
  fontFamily: mono,
  fontSize: 12,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--ide-text-4)',
  margin: 0,
} as const;

export const body = {
  fontFamily: sans,
  fontSize: 17,
  lineHeight: 1.65,
  color: 'var(--ide-text-3)',
  margin: 0,
  maxWidth: '68ch',
} as const;

export const primaryButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '10px 20px',
  fontFamily: mono,
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  color: 'var(--ide-on-yellow)',
  background: 'var(--ide-yellow)',
  border: '1.5px solid var(--ide-ink)',
  borderRadius: 4,
  boxShadow: '3px 4px 0 var(--ide-ink)',
  cursor: 'pointer',
} as const;

export const textLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: sans,
  fontSize: 16,
  fontWeight: 500,
  color: 'var(--ide-accent)',
  textDecoration: 'none',
} as const;
