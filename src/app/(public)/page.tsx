import type { Metadata } from 'next';
import { About } from '@/views/Portfolio/pages/About';
import { JsonLd } from '@/components/JsonLd';
import { profilePageJsonLd } from '@/lib/identity';

export const metadata: Metadata = {
  title: { absolute: 'Oakar Oo | Backend Developer' },
  description:
    'Backend developer in Bangkok. I focus on backends and the setup that keeps them running, mostly with TypeScript, Express, Hono, Prisma, and Docker on Azure and Google Cloud.',
  keywords: [
    'Oakar Oo',
    'Kruskal',
    'Mykal-Steele',
    'backend developer',
    'TypeScript',
    'Next.js',
    'CLI tools',
    'Bangkok',
    'KMUTT',
    'create-adorex',
    'portfolio',
  ],
  alternates: { canonical: '/', types: { 'text/markdown': '/index.md' } },
  openGraph: {
    title: 'Oakar Oo | Backend Developer',
    description:
      'Backend developer in Bangkok, studying CS at KMUTT and looking for a software engineering internship.',
    url: 'https://oakar.dev',
    siteName: 'Oakar Oo',
    images: [
      {
        url: 'https://oakar.dev/og.png',
        width: 1200,
        height: 630,
        alt: 'Oakar Oo, backend developer',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@kruskal_oakar',
    title: 'Oakar Oo | Backend Developer',
    description:
      'Backend developer in Bangkok, studying CS at KMUTT and looking for a software engineering internship.',
    images: ['https://oakar.dev/og.png'],
  },
};

export default function LandingPage() {
  return (
    <>
      <JsonLd data={profilePageJsonLd()} />
      <About />
    </>
  );
}
