import type { Metadata } from 'next';
import { Certificates } from '@/views/Portfolio/pages/Certificates';

export const metadata: Metadata = {
  title: { absolute: 'Certificates | Oakar Oo' },
  description:
    'Certificates earned by Oakar Oo: ISC2 Certified in Cybersecurity, Google IT Support Professional Certificate, and Microsoft Student Ambassador.',
  alternates: { canonical: '/certificates', types: { 'text/markdown': '/certificates.md' } },
  openGraph: {
    title: 'Certificates | Oakar Oo',
    description: 'Exams Oakar Oo passed and courses he finished.',
    url: 'https://oakar.dev/certificates',
    siteName: 'Oakar Oo',
    type: 'website',
    images: [
      {
        url: 'https://oakar.dev/og.png',
        width: 1200,
        height: 630,
        alt: 'Certificates earned by Oakar Oo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Certificates | Oakar Oo',
    description: 'Exams Oakar Oo passed and courses he finished.',
  },
};

export default function CertificatesPage() {
  return <Certificates />;
}
