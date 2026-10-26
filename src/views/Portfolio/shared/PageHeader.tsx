import { sans, serif } from '../constants/fonts';
import { eyebrow as eyebrowStyle } from '../constants/type';
import type { CSSProperties, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  eyebrow?: ReactNode;
  subtitle?: string;
  style?: CSSProperties;
}

export function PageHeader({ title, eyebrow, subtitle, style }: PageHeaderProps) {
  return (
    <header style={style}>
      {eyebrow && <p style={{ ...eyebrowStyle, marginBottom: 12 }}>{eyebrow}</p>}
      <h1
        style={{
          fontFamily: serif,
          fontSize: 'clamp(38px, 5vw, 52px)',
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: 'var(--ide-text-1)',
          margin: 0,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontFamily: sans,
            fontSize: 19,
            lineHeight: 1.55,
            color: 'var(--ide-text-3)',
            margin: '12px 0 0',
            maxWidth: '33.25em', // 56ch of Karla, in em so it holds while fonts load
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
