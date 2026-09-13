import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

interface IconButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  'aria-label': string;
  children: ReactNode;
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}

export function IconButton({
  onClick,
  'aria-label': ariaLabel,
  children,
  size = 48,
  color,
  style,
  className = '',
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 ${className}`}
      style={{
        width: size,
        height: size,
        color,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
