import type { Metadata } from 'next';
import { About } from '@/views/Portfolio/pages/About';

export const metadata: Metadata = {
  title: 'About | Oakar Oo',
  description:
    'CS student at KMUTT Bangkok. I build backends and the setup that keeps them running with TypeScript, Express, Hono, Prisma, and PostgreSQL.',
  keywords: [
    'Oakar Oo',
    'about',
    'CS student',
    'KMUTT',
    'Bangkok',
    'Microsoft Student Ambassador',
    'GDG',
    'TypeScript',
    'Java',
    'PostgreSQL',
  ],
  openGraph: {
    title: 'About | Oakar Oo',
    description:
      'CS student at KMUTT Bangkok. I build backends and the setup that keeps them running.',
    url: 'https://adorio.space/about',
    siteName: 'Oakar Oo',
    type: 'profile',
    images: [
      {
        url: 'https://i.ibb.co/KxH3wXDS/download-3.png',
        width: 1200,
        height: 630,
        alt: 'Oakar Oo, Backend Developer',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'About | Oakar Oo',
    description:
      'CS student at KMUTT Bangkok. I build backends and the setup that keeps them running.',
  },
};

export default function AboutPage() {
  return <About />;
}
