import type { Metadata } from 'next';
import { Contact } from '@/views/Portfolio/pages/Contact';

export const metadata: Metadata = {
  title: { absolute: 'Contact | Oakar Oo' },
  description: 'Send Oakar Oo a message about an internship, a collab, or anything else.',
  keywords: ['Oakar Oo', 'contact', 'hire', 'internship', 'collaboration', 'Bangkok developer'],
  alternates: { canonical: '/contact', types: { 'text/markdown': '/contact.md' } },
  openGraph: {
    title: 'Contact | Oakar Oo',
    description: 'Send Oakar Oo a message about an internship, a collab, or anything else.',
    url: 'https://oakar.dev/contact',
    siteName: 'Oakar Oo',
    type: 'website',
    images: [
      {
        url: 'https://oakar.dev/og.png',
        width: 1200,
        height: 630,
        alt: 'Contact Oakar Oo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Contact | Oakar Oo',
    description: 'Send Oakar Oo a message about an internship, a collab, or anything else.',
  },
};

export default function ContactPage() {
  return <Contact />;
}
