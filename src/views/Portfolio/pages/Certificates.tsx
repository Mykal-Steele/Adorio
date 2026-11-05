'use client';

import { ExternalLink } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { body } from '../constants/type';
import { CertificateCard, PageHeader } from '../shared';

export function Certificates() {
  const { certificates, linkedin } = portfolioData;

  return (
    <div
      className="px-4 pt-8 pb-16 md:px-8 md:pt-16 md:pb-24"
      style={{ maxWidth: 1040, margin: '0 auto' }}
    >
      <PageHeader
        eyebrow={`${certificates.length} certificates`}
        title="Certificates"
        subtitle="Exams I passed and courses I finished."
      />

      <ul
        className="grid grid-cols-1 gap-8 @[880px]:grid-cols-3"
        style={{ margin: '48px 0 0', padding: 0, listStyle: 'none' }}
      >
        {certificates.map((certificate, index) => (
          <li key={certificate.id}>
            <CertificateCard
              certificate={certificate}
              sizes="(min-width: 1200px) 320px, 100vw"
              priority={index === 0}
            />
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-col items-start md:mt-16" style={{ gap: 12 }}>
        <p style={body}>I also have a few other Coursera and Microsoft Learn certificates.</p>
        <a
          href={`https://${linkedin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pf-btn"
        >
          See them on LinkedIn
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
