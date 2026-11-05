import Link from 'next/link';
import type { Certificate } from '../data/portfolio';
import { serif } from '../constants/fonts';
import { eyebrow } from '../constants/type';
import { CertificateImage } from './CertificateImage';

// Every certificate image has the same proportions, and the title area grows to fill the
// card, so cards in a row are the same size and the issuer line sits at the bottom of each.
export function CertificateCard({
  certificate,
  sizes,
  priority = false,
}: {
  certificate: Certificate;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/certificates/${certificate.id}`}
      className="pf-card flex h-full flex-col"
      style={{ padding: 8, background: 'var(--ide-bg-3)', borderRadius: 3 }}
    >
      <CertificateImage certificate={certificate} sizes={sizes} priority={priority} />
      <span
        style={{
          flex: 1,
          padding: '12px 6px 4px',
          fontFamily: serif,
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--ide-text-1)',
        }}
      >
        {certificate.name}
      </span>
      <span style={{ ...eyebrow, padding: '0 6px 6px' }}>
        {certificate.issuer} · {certificate.issued}
      </span>
    </Link>
  );
}
