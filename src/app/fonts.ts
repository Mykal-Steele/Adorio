import { Courier_Prime, Karla, Patrick_Hand, Playfair_Display } from 'next/font/google';

// Self-hosted at build time. next/font also sizes a fallback font to match each one,
// so text keeps its size and line breaks while the real font loads.
export const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
});

export const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-karla',
});

// The generated fallback for this one is a resized Arial, which looks nothing like a
// typewriter face, so it falls back to the system's Courier instead.
export const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-courier',
  adjustFontFallback: false,
  fallback: ['Courier New', 'monospace'],
});

export const patrickHand = Patrick_Hand({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-patrick',
});

export const fontVariables = [playfair, karla, courierPrime, patrickHand]
  .map((font) => font.variable)
  .join(' ');
