import { ChevronRight } from 'lucide-react';
import { sans, mono } from '../constants/fonts';

interface BreadcrumbProps {
  segments: string[];
  language: string;
}

export function Breadcrumb({ segments, language }: BreadcrumbProps) {
  return (
    <div
      className="flex items-center gap-2 px-6 py-2"
      style={{
        borderBottom: '2px solid var(--nb-border)',
        fontFamily: sans,
        fontSize: 12,
        color: 'var(--ide-text-3)',
        letterSpacing: '0.06em',
        background: 'var(--ide-bg-4)',
      }}
    >
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={12} />}
            <span style={isLast ? { color: 'var(--ide-text-2)' } : undefined}>{seg}</span>
          </span>
        );
      })}
      <span
        style={{
          marginLeft: 'auto',
          fontSize: 10,
          fontFamily: mono,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--nb-on-accent)',
          border: '1.5px solid var(--nb-border)',
          padding: '2px 7px',
          background: 'var(--nb-accent)',
        }}
      >
        {language}
      </span>
    </div>
  );
}
