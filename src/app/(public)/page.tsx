import type { Metadata } from 'next';
import { About } from '@/views/Portfolio/pages/About';

export const metadata: Metadata = {
  title: 'Oakar Oo | Backend Developer',
  description:
    'Backend developer in Bangkok. I focus on backends and the setup that keeps them running, mostly with TypeScript, Express, Hono, Prisma, and Docker on Azure.',
  keywords: [
    'Oakar Oo',
    'backend developer',
    'TypeScript',
    'Next.js',
    'CLI tools',
    'Bangkok',
    'KMUTT',
    'create-adorex',
    'portfolio',
  ],
  openGraph: {
    title: 'Oakar Oo | Backend Developer',
    description:
      'Backend developer in Bangkok, studying CS at KMUTT and looking for a software engineering internship.',
    url: 'https://adorio.space',
    siteName: 'Oakar Oo',
    images: [
      {
        url: 'https://adorio.space/og.png',
        width: 1200,
        height: 630,
        alt: 'Oakar Oo, backend developer',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oakar Oo | Backend Developer',
    description:
      'Backend developer in Bangkok, studying CS at KMUTT and looking for a software engineering internship.',
    images: ['https://adorio.space/og.png'],
  },
};

export default function LandingPage() {
  return <About />;
}
