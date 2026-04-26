import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import Providers from './Providers'
import AuthBootstrapper from './AuthBootstrapper'
import ErrorBoundary from '@/Components/ErrorBoundary'

export const metadata: Metadata = {
  title: { default: 'Adorio', template: '%s | Adorio' },
  description: 'A creative platform for builders, gamers, and makers.',
  metadataBase: new URL('https://adorio.space'),
  openGraph: {
    siteName: 'Adorio',
    images: [{ url: 'https://i.ibb.co/KxH3wXDS/download-3.png' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950">
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
  )
}
