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
        borderBottom: '1px solid var(--ide-border-subtle)',
        fontFamily: sans,
        fontSize: 10,
        color: 'var(--ide-text-5)',
        letterSpacing: '0.06em',
        background: 'var(--ide-bg-4)',
      }}
    >
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={10} />}
            <span style={isLast ? { color: 'var(--ide-text-2)' } : undefined}>{seg}</span>
          </span>
        );
      })}
      <span
        style={{ marginLeft: 'auto', fontSize: 9, fontFamily: mono, color: 'var(--ide-text-7)' }}
      >
        {language}
      </span>
    </div>
  );
}
