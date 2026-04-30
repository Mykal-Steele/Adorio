import type { Metadata } from 'next';
import { Projects } from '@/views/Portfolio/pages/Projects';

export const metadata: Metadata = {
  title: 'Projects — Oakar Oo',
  description:
    'CLI tools, full-stack apps, and backend services. create-adorex, ChromaBoard, Vexta, DiscordForge, and more.',
  keywords: [
    'Oakar Oo',
    'projects',
    'create-adorex',
    'NPM CLI',
    'ChromaBoard',
    'Vexta',
    'DiscordForge',
    'TypeScript',
    'C++',
    'Rust',
    'open source',
  ],
  openGraph: {
    title: 'Projects — Oakar Oo',
    description: 'CLI tools, full-stack apps, and backend services.',
    url: 'https://adorio.space/projects',
    siteName: 'Oakar Oo',
    type: 'website',
    images: [
      {
        url: 'https://i.ibb.co/KxH3wXDS/download-3.png',
        width: 1200,
        height: 630,
        alt: 'Projects by Oakar Oo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Projects — Oakar Oo',
    description: 'CLI tools, full-stack apps, and backend services.',
  },
};

export default function ProjectsPage() {
  return <Projects />;
}
