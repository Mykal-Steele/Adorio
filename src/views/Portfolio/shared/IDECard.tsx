import type { CSSProperties, ReactNode } from 'react';

interface IDECardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  bg?: 'bg-2' | 'bg-3';
  onClick?: () => void;
}

export function IDECard({ children, className = '', style, bg = 'bg-2', onClick }: IDECardProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: `var(--ide-${bg})`,
        border: '1px solid var(--ide-border)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
