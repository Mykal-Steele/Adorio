import type { Metadata } from 'next';
import { About } from '@/views/Portfolio/pages/About';

export const metadata: Metadata = {
  title: 'About — Oakar Oo',
  description:
    'CS student at KMUTT Bangkok. Building CLI tools and full-stack apps with TypeScript, Go, and Rust.',
  keywords: [
    'Oakar Oo',
    'about',
    'CS student',
    'KMUTT',
    'Bangkok',
    'Microsoft Student Ambassador',
    'GDG',
    'FOSSASIA',
    'TypeScript',
    'Go',
    'Rust',
  ],
  openGraph: {
    title: 'About — Oakar Oo',
    description: 'CS student at KMUTT Bangkok. Building CLI tools and full-stack apps.',
    url: 'https://adorio.space/about',
    siteName: 'Oakar Oo',
    type: 'profile',
    images: [
      {
        url: 'https://i.ibb.co/KxH3wXDS/download-3.png',
        width: 1200,
        height: 630,
        alt: 'Oakar Oo — Full-Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'About — Oakar Oo',
    description: 'CS student at KMUTT Bangkok. Building CLI tools and full-stack apps.',
  },
};

export default function AboutPage() {
  return <About />;
}
