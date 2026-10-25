import { mono, sans } from './fonts';

// Small label for metadata that a heading doesn't already say
export const eyebrow = {
  fontFamily: sans,
  fontSize: 14,
  fontWeight: 700,
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

// Ink text with a highlighter underline; brown text on paper was too faint
export const textLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '0 2px',
  fontFamily: sans,
  fontSize: 16,
  fontWeight: 700,
  color: 'var(--ide-text-1)',
  textDecoration: 'underline',
  textDecorationColor: 'var(--ide-yellow)',
  textDecorationThickness: 3,
  textUnderlineOffset: 5,
} as const;

export const secondaryButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '10px 18px',
  fontFamily: sans,
  fontSize: 15,
  fontWeight: 700,
  color: 'var(--ide-text-1)',
  background: 'var(--ide-bg-3)',
  border: '1.5px solid var(--ide-text-3)',
  borderRadius: 4,
  textDecoration: 'none',
  cursor: 'pointer',
} as const;

export const linkHover = 'rounded-sm transition-colors duration-150 hover:bg-[var(--ide-note)]';
export const buttonHover =
  'transition-[background-color,transform] duration-150 hover:bg-[var(--ide-note)] active:scale-[0.97]';
