import type { Metadata } from 'next';
import { CertificateDetail } from '@/views/Portfolio/pages/CertificateDetail';
import { portfolioData } from '@/views/Portfolio/data/portfolio';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const certificate = portfolioData.certificates.find((c) => c.id === id);
  const title = certificate ? `${certificate.name} | Oakar Oo` : 'Certificate | Oakar Oo';
  const description = certificate
    ? `${certificate.name}, issued by ${certificate.issuer} in ${certificate.issued}.`
    : 'Certificate details.';
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/certificates/${id}`,
      types: { 'text/markdown': `/certificates/${id}.md` },
    },
    openGraph: {
      title,
      description,
      url: `https://oakar.dev/certificates/${id}`,
      siteName: 'Oakar Oo',
      images: [
        {
          url: 'https://oakar.dev/og.png',
          width: 1200,
          height: 630,
          alt: 'Oakar Oo, backend developer',
        },
      ],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// Every id is known at build time, so anything else is a real 404
export const dynamicParams = false;

export async function generateStaticParams() {
  return portfolioData.certificates.map((c) => ({ id: c.id }));
}

export default async function CertificateDetailPage({ params }: Props) {
  const { id } = await params;
  return <CertificateDetail id={id} />;
}
