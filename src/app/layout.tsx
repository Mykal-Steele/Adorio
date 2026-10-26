import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Providers from './Providers';
import AuthBootstrapper from './AuthBootstrapper';
import ErrorBoundary from '@/components/ErrorBoundary';
import { fontVariables } from './fonts';

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
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      {/* suppressHydrationWarning: browser extensions (Grammarly, password managers, etc.)
          inject attributes like data-gr-ext-installed onto <body> before React hydrates.
          That's a real DOM difference React can't help mismatching, but it's harmless. This only silences the warning for body's own attributes, not its children. */}
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
