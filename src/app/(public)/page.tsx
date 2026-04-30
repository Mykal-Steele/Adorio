import type { Metadata } from 'next';
import { Dashboard } from '@/views/Portfolio/pages/Dashboard';

export const metadata: Metadata = {
  title: 'Oakar Oo — Full-Stack Developer',
  description:
    'Full-stack developer based in Bangkok. I build CLI tools, web apps, and backend services with TypeScript, Go, Rust, and Bun.',
  keywords: [
    'Oakar Oo',
    'full-stack developer',
    'TypeScript',
    'Next.js',
    'CLI tools',
    'Bangkok',
    'KMUTT',
    'create-adorex',
    'portfolio',
  ],
  openGraph: {
    title: 'Oakar Oo — Full-Stack Developer',
    description: 'Portfolio IDE: projects, stack, and open to opportunities.',
    url: 'https://adorio.space',
    siteName: 'Oakar Oo',
    images: [
      {
        url: 'https://i.ibb.co/KxH3wXDS/download-3.png',
        width: 1200,
        height: 630,
        alt: 'Oakar Oo portfolio',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oakar Oo — Full-Stack Developer',
    description: 'Portfolio IDE: projects, stack, and open to opportunities.',
    images: ['https://i.ibb.co/KxH3wXDS/download-3.png'],
  },
};

export default function LandingPage() {
  return <Dashboard />;
}
