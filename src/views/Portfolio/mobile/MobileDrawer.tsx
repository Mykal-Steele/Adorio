'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { sans } from '../constants/fonts';
import { IconButton } from '../shared';
import type { ReactNode } from 'react';

// Leaving is quicker than arriving, so closing feels like it answers the tap.
export const DRAWER_EXIT_MS = 200;

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  // Called once the close animation has finished and the drawer is gone
  onExited?: () => void;
  title: string;
  children: ReactNode;
  position?: 'bottom' | 'right';
}

export function MobileDrawer({
  open,
  onClose,
  onExited,
  title,
  children,
  position = 'bottom',
}: MobileDrawerProps) {
  // stays mounted until the close animation is done
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        onExited?.();
      }, DRAWER_EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [open, mounted, onExited]);

  useEffect(() => {
    document.body.style.overflow = mounted && !closing ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mounted, closing]);

  if (!mounted) return null;

  const isBottom = position === 'bottom';
  const side = isBottom ? 'Bottom' : 'Right';
  const openAnim = `slideIn${side} 320ms cubic-bezier(0.23, 1, 0.32, 1)`;
  const closeAnim = `slideOut${side} ${DRAWER_EXIT_MS}ms cubic-bezier(0.4, 0, 1, 1) forwards`;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="pf-drawer absolute inset-0"
        data-state={closing ? 'closed' : 'open'}
        style={{
          background: 'rgba(0,0,0,0.5)',
          animation: closing
            ? `fadeOut ${DRAWER_EXIT_MS}ms ease-in forwards`
            : 'fadeIn 320ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
        onClick={onClose}
      />
      <div
        className="pf-drawer absolute flex flex-col"
        data-state={closing ? 'closed' : 'open'}
        style={{
          ...(isBottom
            ? { bottom: 0, left: 0, right: 0, maxHeight: '85vh' }
            : { top: 0, right: 0, bottom: 0, width: '80vw', maxWidth: 320 }),
          animation: closing ? closeAnim : openAnim,
          background: 'var(--ide-bg-1)',
          borderTop: isBottom ? '1px solid var(--ide-border)' : 'none',
          borderLeft: !isBottom ? '1px solid var(--ide-border)' : 'none',
          borderRadius: isBottom ? '12px 12px 0 0' : 0,
        }}
      >
        <div
          className="flex items-center justify-between px-4 shrink-0"
          style={{ height: 48, borderBottom: '1px solid var(--ide-border)' }}
        >
          <span
            style={{
              fontSize: 15,
              fontFamily: sans,
              color: 'var(--ide-text-1)',
              fontWeight: 700,
            }}
          >
            {title}
          </span>
          <IconButton onClick={onClose} aria-label={`Close ${title}`}>
            <X size={16} color="var(--ide-text-5)" />
          </IconButton>
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
