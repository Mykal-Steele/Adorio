import type { Metadata } from 'next';
import { Projects } from '@/views/Portfolio/pages/Projects';

export const metadata: Metadata = {
  title: 'Projects | Oakar Oo',
  description:
    'Backend services, tools, and the systems behind them. ChronoChunk, Smart City, Coding Challenges, NFC Attendance, create-adorex, and more.',
  keywords: [
    'Oakar Oo',
    'projects',
    'create-adorex',
    'NPM CLI',
    'ChronoChunk',
    'Vexta',
    'CozyTalk',
    'CogniMax',
    'TypeScript',
    'Java',
    'open source',
  ],
  openGraph: {
    title: 'Projects | Oakar Oo',
    description: 'Backend services, tools, and the systems behind them.',
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
    title: 'Projects | Oakar Oo',
    description: 'Backend services, tools, and the systems behind them.',
  },
};

export default function ProjectsPage() {
  return <Projects />;
}
