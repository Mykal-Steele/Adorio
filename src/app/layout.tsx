import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Providers from './Providers';
import AuthBootstrapper from './AuthBootstrapper';
import Script from 'next/script';
import ErrorBoundary from '@/components/ErrorBoundary';
import { NavigationProgressBar } from '@/components/NavigationProgressBar';
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

// /learn-korean is a standalone HTML page, so following its link is a full page load. Chrome
// prerenders it after a 200ms hover ("moderate"), which makes the load instant when the
// click comes. Other browsers ignore this.
const SPECULATION_RULES = JSON.stringify({
  prerender: [{ where: { href_matches: '/learn-korean' }, eagerness: 'moderate' }],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Marks the page as signed in before first paint, so AuthSwitch shows the right
            Navbar and composer straight away instead of flashing the logged-out version */}
        <Script id="auth-hint" strategy="beforeInteractive">
          {`try{if(localStorage.getItem('token')||sessionStorage.getItem('token'))document.documentElement.dataset.auth='in'}catch(e){}`}
        </Script>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        {/* A fixed string from this file, nothing user supplied goes in it */}
        <script type="speculationrules" dangerouslySetInnerHTML={{ __html: SPECULATION_RULES }} />
      </head>
      {/* suppressHydrationWarning: browser extensions (Grammarly, password managers, etc.)
          inject attributes like data-gr-ext-installed onto <body> before React hydrates.
          That's a real DOM difference React can't help mismatching, but it's harmless. This only silences the warning for body's own attributes, not its children. */}
      <body className="bg-[var(--paper-hero)]" suppressHydrationWarning>
        <Providers>
          <NavigationProgressBar />
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
