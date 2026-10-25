import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Providers from './Providers';
import AuthBootstrapper from './AuthBootstrapper';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: { default: 'Adorio', template: '%s | Adorio' },
  description:
    'Oakar Oo, a backend developer in Bangkok. My portfolio, projects, and apps all live on adorio.space.',
  metadataBase: new URL('https://adorio.space'),
  openGraph: {
    siteName: 'Adorio',
    images: [
      {
        url: 'https://adorio.space/og.png',
        width: 1200,
        height: 630,
        alt: 'Oakar Oo, backend developer',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap"
        />
        {/* Social feed paper-craft theme fonts */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500;1,700&family=Karla:ital,wght@0,400;0,500;0,700&family=Courier+Prime:wght@400;700&family=Patrick+Hand&display=swap"
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      {/* suppressHydrationWarning: browser extensions (Grammarly, password managers, etc.)
          inject attributes like data-gr-ext-installed onto <body> before React hydrates.
          That's a real DOM difference React can't help mismatching, but it's harmless —
          this only silences the warning for body's own attributes, not its children. */}
      <body className="bg-gray-950" suppressHydrationWarning>
        <Providers>
          <ErrorBoundary>
            <Suspense fallback={null}>
              <AuthBootstrapper />
            </Suspense>
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
