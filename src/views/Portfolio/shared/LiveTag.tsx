import { Radio } from 'lucide-react';
import { sans } from '../constants/fonts';

const tagStyle = {
  gap: 6,
  padding: '2px 8px',
  fontFamily: sans,
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--ide-on-yellow)',
  background: 'var(--ide-yellow)',
  border: '1.5px solid var(--ide-ink)',
  borderRadius: 3,
  textDecoration: 'none',
} as const;

// Marks a project anyone can open and use right now. With an href it opens the live site.
export function LiveTag({ href }: { href?: string }) {
  const content = (
    <>
      <Radio size={13} aria-hidden="true" />
      Live
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        aria-label="Live: open the live site"
        className="pf-live inline-flex items-center"
        style={tagStyle}
      >
        {content}
      </a>
    );
  }
  return (
    <span className="inline-flex items-center" style={tagStyle}>
      {content}
    </span>
  );
}
