import type { CSSProperties, ReactNode } from 'react';

interface IDECardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  tape?: boolean;
}

export function IDECard({ children, className = '', style, tape = false }: IDECardProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        background: 'var(--ide-bg-3)',
        borderRadius: 3,
        boxShadow: 'var(--ide-card-shadow)',
        ...style,
      }}
    >
      {tape && <Tape />}
      {children}
    </div>
  );
}

export function Tape() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: -10,
        left: 28,
        width: 80,
        height: 20,
        transform: 'rotate(-3deg)',
        background: 'var(--ide-tape)',
        borderLeft: '1px dashed var(--ide-tape-edge)',
        borderRight: '1px dashed var(--ide-tape-edge)',
        pointerEvents: 'none',
      }}
    />
  );
}
