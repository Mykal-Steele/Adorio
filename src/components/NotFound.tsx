'use client';
import React, { useEffect, useState, useRef } from 'react';
import { MapIcon } from '@heroicons/react/24/outline';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { texts } from '../../assests/404/messages';

const NotFound = () => {
  const [randomText, setRandomText] = useState('');
  const [vh, setVh] = useState(800);
  const [vw, setVw] = useState(1200);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 600, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 600, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  useEffect(() => {
    setVh(window.innerHeight);
    setVw(window.innerWidth);
    setRandomText(texts[Math.floor(Math.random() * texts.length)]);
  }, []);

  return (
    <div
      ref={containerRef}
      className="paper-theme fixed inset-0 flex items-center justify-center overflow-hidden p-6"
      onMouseMove={handleMouseMove}
    >
      <div className="mb-10 flex items-baseline gap-2 sm:absolute sm:left-8 sm:top-8 sm:mb-0">
        <span className="font-paper-serif text-2xl font-bold italic tracking-[-.015em]">
          Adorio
        </span>
        <span aria-hidden="true" className="font-paper-serif text-xl font-bold leading-none">
          <span className="text-[#d1a413]">{'{'}</span>
          <span className="text-[#7f9c3c]">{'_}'}</span>
        </span>
      </div>

      <motion.div
        style={{
          rotateX: useTransform(smoothMouseY, [0, vh], [4, -4]),
          rotateY: useTransform(smoothMouseX, [0, vw], [-4, 4]),
          transformPerspective: 1500,
        }}
        className="relative w-full max-w-lg -rotate-1 rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] px-10 py-14 text-center shadow-[6px_8px_0_var(--paper-ink)]"
      >
        <motion.div
          style={{
            x: useTransform(smoothMouseX, [0, vw], [-8, 8]),
            y: useTransform(smoothMouseY, [0, vh], [-8, 8]),
          }}
          className="mb-5 flex justify-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow-soft)]">
            <MapIcon className="h-8 w-8 text-[var(--paper-accent)]" />
          </span>
        </motion.div>

        <p className="font-paper-mono mb-2 text-xs font-bold uppercase tracking-[.2em] text-[var(--paper-accent-strong)]">
          404 — page not found
        </p>

        <h1 className="font-paper-serif mb-4 text-4xl font-bold text-[var(--paper-ink)]">
          Lost in the margins
        </h1>

        <p className="mb-8 text-base italic leading-relaxed text-[var(--paper-muted)]">
          {randomText}
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => router.back()}
            className="rounded-[3px] border-[1.5px] border-[var(--paper-ink)] px-6 py-2.5 text-sm font-medium text-[var(--paper-ink)] transition-transform hover:-translate-y-px hover:bg-[rgba(43,39,35,0.04)]"
          >
            Go back
          </button>
          <button
            onClick={() => router.push('/')}
            className="rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-6 py-2.5 font-paper-mono text-sm font-bold uppercase tracking-[.1em] text-[var(--paper-ink)] shadow-[2px_3px_0_var(--paper-ink)] transition-transform hover:-translate-y-px hover:shadow-[2px_5px_0_var(--paper-ink)] active:translate-y-0.5 active:shadow-[1px_1px_0_var(--paper-ink)]"
          >
            Return home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
