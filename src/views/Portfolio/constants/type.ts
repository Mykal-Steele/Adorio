import { sans } from './fonts';

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

// Buttons and links are styled by the .pf-btn-primary, .pf-btn, and .pf-link classes
// in globals.css so their hover and press states work.

// Card previews end in an ellipsis so it's clear the project page has more
export const preview = (text: string) => `${text.replace(/[.!?]\s*$/, '')}…`;
