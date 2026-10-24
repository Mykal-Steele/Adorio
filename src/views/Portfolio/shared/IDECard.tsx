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
        border: '2px solid var(--nb-border)',
        boxShadow: '4px 4px 0 var(--nb-shadow)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
