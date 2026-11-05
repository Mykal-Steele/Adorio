'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { serif } from '../constants/fonts';
import { body, eyebrow } from '../constants/type';
import { CertificateImage, Lightbox, SectionLabel } from '../shared';

export function CertificateDetail({ id }: { id: string }) {
  const [zoomed, setZoomed] = useState(false);
  const certificate = portfolioData.certificates.find((c) => c.id === id);

  if (!certificate) {
    return (
      <div className="flex h-full flex-col items-center justify-center" style={{ gap: 12 }}>
        <p style={{ ...body, fontWeight: 700 }}>No certificate called {id}</p>
        <Link href="/certificates" className="pf-link">
          <ArrowLeft size={16} />
          Back to certificates.json
        </Link>
      </div>
    );
  }

  const others = portfolioData.certificates.filter((c) => c.id !== id);

  return (
    <div
      className="px-4 pt-10 pb-20 md:px-10 md:pt-16 md:pb-28"
      style={{ maxWidth: 880, margin: '0 auto' }}
    >
      <header>
        <p style={eyebrow}>
          {certificate.issuer} · {certificate.issued}
        </p>
        <h1
          style={{
            fontFamily: serif,
            fontSize: 'clamp(34px, 5vw, 48px)',
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: 'var(--ide-text-1)',
            margin: '4px 0 0',
          }}
        >
          {certificate.name}
        </h1>
      </header>

      <p style={{ ...body, marginTop: 24 }}>{certificate.summary}</p>

      <button
        type="button"
        onClick={() => setZoomed(true)}
        aria-label={`View the ${certificate.name} certificate full size`}
        className="pf-card block w-full"
        style={{
          marginTop: 40,
          padding: 8,
          background: 'var(--ide-bg-3)',
          borderRadius: 3,
          border: 'none',
          cursor: 'zoom-in',
        }}
      >
        <CertificateImage
          certificate={certificate}
          sizes="(max-width: 900px) 100vw, 800px"
          priority
        />
      </button>

      {certificate.verifyUrl && (
        <p style={{ marginTop: 24 }}>
          <a
            href={certificate.verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pf-btn"
          >
            Verify this certificate
            <ExternalLink size={14} />
          </a>
        </p>
      )}

      {certificate.courses && (
        <section style={{ marginTop: 64 }}>
          <SectionLabel>Courses</SectionLabel>
          <ol className="flex flex-col" style={{ gap: 8, margin: 0, paddingLeft: 24 }}>
            {certificate.courses.map((course) => (
              <li key={course} style={body}>
                {course}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section style={{ marginTop: 64 }}>
        <SectionLabel>More certificates</SectionLabel>
        <ul
          className="flex flex-wrap"
          style={{ gap: 12, margin: 0, padding: 0, listStyle: 'none' }}
        >
          {others.map((other) => (
            <li key={other.id}>
              <Link href={`/certificates/${other.id}`} className="pf-btn">
                {other.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/certificates" className="pf-btn">
              All certificates
            </Link>
          </li>
        </ul>
      </section>

      {zoomed && (
        <Lightbox
          shot={{ ...certificate.image, caption: certificate.name }}
          onClose={() => setZoomed(false)}
        />
      )}
    </div>
  );
}
