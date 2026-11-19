import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Providers from './Providers';
import AuthBootstrapper from './AuthBootstrapper';
import Script from 'next/script';
import ErrorBoundary from '@/components/ErrorBoundary';
import { NavigationProgressBar } from '@/components/NavigationProgressBar';
import { fontVariables } from './fonts';
import { JsonLd } from '@/components/JsonLd';
import { PROFILES, SITE_URL, siteJsonLd } from '@/lib/identity';

export const metadata: Metadata = {
  title: { default: 'Oakar Oo', template: '%s | Oakar Oo' },
  description:
    'Oakar Oo, a backend developer in Bangkok. My portfolio, projects, and apps all live on oakar.dev.',
  metadataBase: new URL('https://oakar.dev'),
  authors: [{ name: 'Oakar Oo', url: SITE_URL }],
  creator: 'Oakar Oo',
  twitter: { creator: '@kruskal_oakar' },
  openGraph: {
    siteName: 'Oakar Oo',
    images: [
      {
        url: 'https://oakar.dev/og.png',
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
        {/* Who owns the site. rel="me" says each profile is the same person as this page */}
        <JsonLd data={siteJsonLd()} />
        {PROFILES.map((profile) => (
          <link key={profile.url} rel="me" href={profile.url} />
        ))}
        {/* A fixed string from this file, nothing user supplied goes in it */}
        <script type="speculationrules" dangerouslySetInnerHTML={{ __html: SPECULATION_RULES }} />
      </head>
      {/* Extensions (Grammarly, password managers) add attributes like data-gr-ext-installed
          to <body> before React hydrates. Harmless, and this only silences body's own
          attributes, not its children. */}
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
