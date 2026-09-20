import type { ReactNode } from 'react';

interface OverlayProps {
  wide?: boolean;
  children: ReactNode;
}

export default function Overlay({ wide = false, children }: OverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(43,39,35,0.55)] p-5 backdrop-blur-[2px]">
      <div
        className={`w-full ${wide ? 'max-w-[560px]' : 'max-w-[420px]'} rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] p-[26px] shadow-[0_20px_50px_-20px_rgba(43,39,35,0.6)]`}
      >
        {children}
      </div>
    </div>
  );
}
