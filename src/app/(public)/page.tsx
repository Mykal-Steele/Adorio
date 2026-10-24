import type { Metadata } from 'next';
import { Dashboard } from '@/views/Portfolio/pages/Dashboard';

export const metadata: Metadata = {
  title: 'Oakar Oo | Backend Developer',
  description:
    'Backend developer based in Bangkok. I build APIs, databases, deployment, and developer tools with TypeScript, Express, Hono, Prisma, and PostgreSQL.',
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
    title: 'Oakar Oo | Backend Developer',
    description: 'Portfolio IDE: projects, stack, and open to opportunities.',
    images: ['https://i.ibb.co/KxH3wXDS/download-3.png'],
  },
};

export default function LandingPage() {
  return <Dashboard />;
}
