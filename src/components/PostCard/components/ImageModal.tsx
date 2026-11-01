'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import {
  ArrowsPointingInIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  MAX_SCALE,
  clampPan,
  doubleClickScale,
  formatZoom,
  stepScale,
  zoomAt,
} from '../utils/imageZoom';
import type { ZoomView } from '../utils/imageZoom';

type ImageModalProps = {
  isVisible: boolean;
  imageUrl?: string | null;
  title?: string;
  onClose: () => void;
  instanceId: string | number;
};

type ViewerProps = Pick<ImageModalProps, 'title' | 'onClose'> & { imageUrl: string };

const RESET_VIEW: ZoomView = { scale: 1, x: 0, y: 0 };
const ARROW_PAN_PX = 80;
const DRAG_THRESHOLD_PX = 4;

const toolbarButton =
  'grid size-9 place-items-center rounded-full text-[var(--paper-ink)] transition-colors hover:bg-[var(--paper-yellow-soft)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--paper-ink)]';

const roundButton =
  'grid size-11 place-items-center rounded-full border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] text-[var(--paper-ink)] shadow-[2px_3px_0_var(--paper-ink)] transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--paper-cream)]';

const Viewer = ({ imageUrl, title, onClose }: ViewerProps) => {
  const [view, setView] = useState<ZoomView>(RESET_VIEW);
  const [isPanning, setIsPanning] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef({ distance: 0, scale: 1 });
  const travelled = useRef(0);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const image = imageRef.current;
    return {
      stageWidth: stage?.clientWidth ?? 0,
      stageHeight: stage?.clientHeight ?? 0,
      imageWidth: image?.offsetWidth ?? 0,
      imageHeight: image?.offsetHeight ?? 0,
    };
  }, []);

  // Points are measured from the center of the stage, which is where the image sits.
  const fromCenter = useCallback((clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: clientX - (rect.left + rect.width / 2), y: clientY - (rect.top + rect.height / 2) };
  }, []);

  const zoomTo = useCallback(
    (target: number, point = { x: 0, y: 0 }) => {
      const current = viewRef.current;
      setView(zoomAt({ view: current, factor: target / current.scale, point, ...measure() }));
    },
    [measure],
  );

  const zoomStep = useCallback(
    (direction: 'in' | 'out') => zoomTo(stepScale(viewRef.current.scale, direction)),
    [zoomTo],
  );

  const reset = useCallback(() => setView(RESET_VIEW), []);

  useEffect(() => {
    const active = document.activeElement;
    const previouslyFocused = active instanceof HTMLElement ? active : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const pan = (x: number, y: number) =>
        setView((current) =>
          current.scale > 1
            ? clampPan({ view: { ...current, x: current.x + x, y: current.y + y }, ...measure() })
            : current,
        );
      const handlers: Record<string, () => void> = {
        Escape: onClose,
        '+': () => zoomStep('in'),
        '=': () => zoomStep('in'),
        '-': () => zoomStep('out'),
        _: () => zoomStep('out'),
        '0': reset,
        ArrowLeft: () => pan(ARROW_PAN_PX, 0),
        ArrowRight: () => pan(-ARROW_PAN_PX, 0),
        ArrowUp: () => pan(0, ARROW_PAN_PX),
        ArrowDown: () => pan(0, -ARROW_PAN_PX),
      };
      const handler = handlers[event.key];
      if (!handler || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      handler();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [measure, onClose, reset, zoomStep]);

  // A native listener, because React attaches wheel handlers as passive and a passive
  // one cannot stop the browser's own pinch-to-zoom on the page.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const speed = event.ctrlKey ? 0.01 : 0.0015;
      const factor = Math.exp(-event.deltaY * speed);
      const point = fromCenter(event.clientX, event.clientY);
      setView((current) => zoomAt({ view: current, factor, point, ...measure() }));
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [fromCenter, measure]);

  const pinchDistance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) travelled.current = 0;
    if (pointers.current.size === 2) {
      pinch.current = { distance: pinchDistance(), scale: viewRef.current.scale };
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const last = pointers.current.get(event.pointerId);
    if (!last) return;
    const next = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, next);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const midpoint = fromCenter((a.x + b.x) / 2, (a.y + b.y) / 2);
      travelled.current = DRAG_THRESHOLD_PX + 1;
      zoomTo((pinch.current.scale * pinchDistance()) / pinch.current.distance, midpoint);
      return;
    }

    const dx = next.x - last.x;
    const dy = next.y - last.y;
    travelled.current += Math.abs(dx) + Math.abs(dy);
    if (viewRef.current.scale <= 1 || travelled.current < DRAG_THRESHOLD_PX) return;
    setIsPanning(true);
    setView((current) =>
      clampPan({ view: { ...current, x: current.x + dx, y: current.y + dy }, ...measure() }),
    );
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) setIsPanning(false);
  };

  // Once a press has captured the pointer, the browser reports the stage as the click
  // target even over the image, so the position decides, not event.target.
  const isOverImage = (clientX: number, clientY: number) => {
    const rect = imageRef.current?.getBoundingClientRect();
    return (
      !!rect &&
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  };

  // A tap on the empty area closes the viewer. A drag that ends there must not.
  const onStageClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (travelled.current < DRAG_THRESHOLD_PX && !isOverImage(event.clientX, event.clientY)) {
      onClose();
    }
  };

  const onStageDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!isOverImage(event.clientX, event.clientY)) return;
    zoomTo(doubleClickScale(viewRef.current.scale), fromCenter(event.clientX, event.clientY));
  };

  const isZoomed = view.scale > 1;

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Image from "${title}"` : 'Image viewer'}
      tabIndex={-1}
      className="fixed inset-0 z-[100] bg-[rgba(30,24,16,0.94)] outline-none backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div
        ref={stageRef}
        className={`absolute inset-0 flex touch-none select-none items-center justify-center overflow-hidden px-4 py-20 sm:px-10 ${
          isZoomed ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClick={onStageClick}
        onDoubleClick={onStageDoubleClick}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt={title || 'Post image'}
          draggable={false}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          className={`max-h-full max-w-full rounded-[3px] object-contain shadow-[0_18px_50px_rgba(0,0,0,0.5)] ${
            isPanning
              ? 'transition-none'
              : 'transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none'
          }`}
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        />
      </div>

      {title && (
        <p className="pointer-events-none absolute left-4 top-4 max-w-[calc(100%-6rem)] truncate rounded-full bg-[rgba(253,250,243,0.92)] px-4 py-2 text-sm font-medium text-[var(--paper-ink)] sm:left-6 sm:top-5">
          {title}
        </p>
      )}

      <button
        type="button"
        aria-label="Close image viewer"
        title="Close (Esc)"
        onClick={onClose}
        className={`absolute right-4 top-4 sm:right-6 sm:top-5 ${roundButton}`}
      >
        <XMarkIcon className="h-5 w-5" />
      </button>

      <div
        role="toolbar"
        aria-label="Image zoom"
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] px-2 py-1.5 shadow-[3px_4px_0_var(--paper-ink)] sm:bottom-6"
      >
        <button
          type="button"
          aria-label="Zoom out"
          title="Zoom out (-)"
          onClick={() => zoomStep('out')}
          disabled={view.scale <= 1}
          className={toolbarButton}
        >
          <MagnifyingGlassMinusIcon className="h-5 w-5" />
        </button>
        <span
          aria-live="polite"
          className="w-14 text-center font-paper-mono text-xs font-bold tabular-nums text-[var(--paper-ink)]"
        >
          {formatZoom(view.scale)}
        </span>
        <button
          type="button"
          aria-label="Zoom in"
          title="Zoom in (+)"
          onClick={() => zoomStep('in')}
          disabled={view.scale >= MAX_SCALE}
          className={toolbarButton}
        >
          <MagnifyingGlassPlusIcon className="h-5 w-5" />
        </button>
        <span aria-hidden className="mx-1 h-5 w-px bg-[rgba(60,44,24,0.3)]" />
        <button
          type="button"
          aria-label="Fit to screen"
          title="Fit to screen (0)"
          onClick={reset}
          disabled={!isZoomed}
          className={toolbarButton}
        >
          <ArrowsPointingInIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

// Rendered in a portal on document.body. A post card is rotated, and a fixed element
// inside a transformed parent is sized and placed against that parent, not the screen.
const ImageModal = ({ isVisible, imageUrl, title, onClose, instanceId }: ImageModalProps) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  return createPortal(
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isVisible && imageUrl && (
          <Viewer
            key={`viewer-${instanceId}`}
            imageUrl={imageUrl}
            title={title}
            onClose={onClose}
          />
        )}
      </AnimatePresence>
    </MotionConfig>,
    document.body,
  );
};

export default ImageModal;
