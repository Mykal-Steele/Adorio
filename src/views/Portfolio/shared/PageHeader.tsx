import { title as titleFont, vietnam } from '../constants/fonts';
import type { CSSProperties } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  style?: CSSProperties;
}

export function PageHeader({ title, subtitle, style }: PageHeaderProps) {
  return (
    <div style={style}>
      <div style={{ width: 48, height: 3, background: 'var(--ide-orange)', marginBottom: 16 }} />
      <h1
        style={{
          fontSize: 36,
          fontFamily: titleFont,
          fontWeight: 700,
          color: 'var(--ide-text-1)',
          letterSpacing: '-1px',
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <div
          style={{
            fontSize: 14,
            fontFamily: vietnam,
            color: 'var(--ide-text-5)',
            lineHeight: 1.6,
            marginTop: 10,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
