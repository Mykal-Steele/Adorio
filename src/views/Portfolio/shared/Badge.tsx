import { sans } from '../constants/fonts';
import type { CSSProperties, ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color: string;
  bg?: string;
  borderColor?: string;
  style?: CSSProperties;
}

export function Badge({ children, color, bg, borderColor, style }: BadgeProps) {
  return (
    <span
      style={{
        fontSize: 11,
        fontFamily: sans,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color,
        background: bg || `${color}18`,
        border: `1.5px solid ${borderColor ?? 'var(--nb-border)'}`,
        padding: '3px 8px',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
