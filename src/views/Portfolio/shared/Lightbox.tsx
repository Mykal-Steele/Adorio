'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { ProjectShot } from '../data/portfolio';
import { sans } from '../constants/fonts';

// Full-size view of a gallery image. Esc, the close button, or a click outside closes it.
export function Lightbox({ shot, onClose }: { shot: ProjectShot; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={shot.alt}
      onClick={onClose}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
      style={{ gap: 16, padding: 24, background: 'rgba(20, 16, 12, 0.85)' }}
    >
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Close"
        className="pf-btn absolute"
        style={{ top: 16, right: 16, padding: 10 }}
      >
        <X size={18} />
      </button>
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        sizes="90vw"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: 'calc(100dvh - 140px)',
          background: '#fdfaf3',
          padding: 10,
          animation: 'lightboxIn 220ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      />
      <p
        onClick={(e) => e.stopPropagation()}
        style={{
          fontFamily: sans,
          fontSize: 16,
          color: '#f3ecdd',
          maxWidth: 720,
          textAlign: 'center',
        }}
      >
        {shot.caption}
      </p>
    </div>
  );
}
