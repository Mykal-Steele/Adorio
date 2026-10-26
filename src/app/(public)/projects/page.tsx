import type { Metadata } from 'next';
import { Projects } from '@/views/Portfolio/pages/Projects';

export const metadata: Metadata = {
  title: 'Projects | Oakar Oo',
  description:
    'Projects by Oakar Oo, including Adorio, ChronoChunk, the Smart City financial module, Coding Challenges, NFC Attendance, create-adorex, CogniMax, and Uniloom.',
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
    description: 'Things Oakar Oo has built, mostly backends and the setup around them.',
    url: 'https://adorio.space/projects',
    siteName: 'Oakar Oo',
    type: 'website',
    images: [
      {
        url: 'https://adorio.space/og.png',
        width: 1200,
        height: 630,
        alt: 'Projects by Oakar Oo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Projects | Oakar Oo',
    description: 'Things Oakar Oo has built, mostly backends and the setup around them.',
  },
};

export default function ProjectsPage() {
  return <Projects />;
}
