import Image from 'next/image';
import type { Certificate } from '../data/portfolio';

// The certificate on a white sheet with a thin border, so the white ones don't float on the page
export function CertificateImage({
  certificate,
  sizes,
  priority = false,
}: {
  certificate: Certificate;
  sizes: string;
  priority?: boolean;
}) {
  const { src, alt, width, height } = certificate.image;
  return (
    <div style={{ background: '#ffffff', border: '1px solid var(--ide-border)', lineHeight: 0 }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
}
