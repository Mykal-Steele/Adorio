'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { sans } from '../constants/fonts';
import type { ReactNode } from 'react';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  position?: 'bottom' | 'right';
}

export function MobileDrawer({
  open,
  onClose,
  title,
  children,
  position = 'bottom',
}: MobileDrawerProps) {
  // Keep the DOM mounted during close animation, then unmount after it finishes.
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      // Trigger the slide-out, then unmount after the animation duration.
      setClosing(true);
      const t = setTimeout(() => setMounted(false), 240);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  useEffect(() => {
    document.body.style.overflow = mounted && !closing ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mounted, closing]);

  if (!mounted) return null;

  const isBottom = position === 'bottom';
  const openAnim = isBottom ? 'slideInBottom 0.22s ease-out' : 'slideInRight 0.22s ease-out';
  const closeAnim = isBottom ? 'slideOutBottom 0.22s ease-in' : 'slideOutRight 0.22s ease-in';

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0,0,0,0.5)',
          opacity: closing ? 0 : 1,
          transition: 'opacity 0.22s ease',
        }}
        onClick={onClose}
      />
      <div
        className="absolute flex flex-col"
        style={{
          ...(isBottom
            ? { bottom: 0, left: 0, right: 0, maxHeight: '85vh' }
            : { top: 0, right: 0, bottom: 0, width: '80vw', maxWidth: 320 }),
          animation: closing ? closeAnim : openAnim,
          background: 'var(--ide-bg-2)',
          borderTop: isBottom ? '1px solid var(--ide-border)' : 'none',
          borderLeft: !isBottom ? '1px solid var(--ide-border)' : 'none',
        }}
      >
        <div
          className="flex items-center justify-between px-4 shrink-0"
          style={{ height: 40, borderBottom: '1px solid var(--ide-border)' }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: sans,
              color: 'var(--ide-text-3)',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <X size={16} color="var(--ide-text-5)" />
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--ide-bg-5) transparent' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
