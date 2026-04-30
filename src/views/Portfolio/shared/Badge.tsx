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
        fontSize: 9,
        fontFamily: sans,
        fontWeight: 600,
        letterSpacing: '0.06em',
        color,
        background: bg || `${color}18`,
        border: borderColor ? `1px solid ${borderColor}` : undefined,
        padding: '3px 8px',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
