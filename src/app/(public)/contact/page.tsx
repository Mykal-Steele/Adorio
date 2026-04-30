import type { Metadata } from 'next';
import { Contact } from '@/views/Portfolio/pages/Contact';

export const metadata: Metadata = {
  title: 'Contact — Oakar Oo',
  description: 'Get in touch. Open to internships, part-time roles, and collaboration.',
  keywords: ['Oakar Oo', 'contact', 'hire', 'internship', 'collaboration', 'Bangkok developer'],
  openGraph: {
    title: 'Contact — Oakar Oo',
    description: 'Open to internships, part-time roles, and collaboration.',
    url: 'https://adorio.space/contact',
    siteName: 'Oakar Oo',
    type: 'website',
    images: [
      {
        url: 'https://i.ibb.co/KxH3wXDS/download-3.png',
        width: 1200,
        height: 630,
        alt: 'Contact Oakar Oo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Contact — Oakar Oo',
    description: 'Open to internships, part-time roles, and collaboration.',
  },
};

export default function ContactPage() {
  return <Contact />;
}
