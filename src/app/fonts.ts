import localFont from 'next/font/local';

// The font files live in ./fonts (Google Fonts latin subset, SIL Open Font License, see
// ./fonts/README.md). next/font/google downloaded them during every build, and when that
// download failed the whole build failed with "Module not found". Local files can't.
// next/font also sizes a fallback font to match each one, so text keeps its size and line
// breaks while the real font loads.
export const playfair = localFont({
  src: [
    { path: './fonts/playfair-display.woff2', weight: '500 700', style: 'normal' },
    { path: './fonts/playfair-display-italic.woff2', weight: '500 700', style: 'italic' },
  ],
  variable: '--font-playfair',
  adjustFontFallback: 'Times New Roman',
  fallback: ['serif'],
});

export const karla = localFont({
  src: './fonts/karla.woff2',
  weight: '400 700',
  variable: '--font-karla',
  fallback: ['sans-serif'],
});

// The generated fallback for this one is a resized Arial, which looks nothing like a
// typewriter face, so it falls back to the system's Courier instead.
export const courierPrime = localFont({
  src: [
    { path: './fonts/courier-prime-400.woff2', weight: '400' },
    { path: './fonts/courier-prime-700.woff2', weight: '700' },
  ],
  variable: '--font-courier',
  // Only buttons use it, so it shouldn't compete with the page text for bandwidth
  preload: false,
  adjustFontFallback: false,
  fallback: ['Courier New', 'monospace'],
});

export const patrickHand = localFont({
  src: './fonts/patrick-hand.woff2',
  weight: '400',
  variable: '--font-patrick',
  // Only the theme tip uses it
  preload: false,
});

export const fontVariables = [playfair, karla, courierPrime, patrickHand]
  .map((font) => font.variable)
  .join(' ');
