'use client';
import React, { useEffect, useState, useRef } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
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

  const lightPosition = useTransform(
    [smoothMouseX, smoothMouseY],
    ([x, y]) => `calc(${x}px - 50%) calc(${y}px - 50%)`,
  );

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
      className="fixed inset-0 bg-gray-950 flex items-center justify-center p-6 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Dot-grid background */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Cursor spotlight */}
      <motion.div
        style={{ backgroundPosition: lightPosition }}
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(500px_at_50%_50%,rgba(129,140,248,0.12),transparent)]"
      />

      {/* Card */}
      <motion.div
        style={{
          rotateX: useTransform(smoothMouseY, [0, vh], [8, -8]),
          rotateY: useTransform(smoothMouseX, [0, vw], [-8, 8]),
          transformPerspective: 1500,
        }}
        className="relative w-full max-w-lg bg-gray-900/90 backdrop-blur-2xl border border-gray-700/50 rounded-3xl px-10 py-16 text-center shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <motion.div
          style={{
            x: useTransform(smoothMouseX, [0, vw], [-12, 12]),
            y: useTransform(smoothMouseY, [0, vh], [-12, 12]),
          }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <SparklesIcon className="h-14 w-14 text-purple-400 relative z-10" />
            <div className="absolute inset-0 w-24 h-24 -translate-x-5 -translate-y-5 bg-purple-600/20 blur-[40px] rounded-full" />
          </div>
        </motion.div>

        <motion.p
          style={{
            x: useTransform(smoothMouseX, [0, vw], [-20, 20]),
            y: useTransform(smoothMouseY, [0, vh], [-20, 20]),
          }}
          className="text-sm font-semibold text-purple-400 tracking-widest uppercase mb-2"
        >
          404 — Page not found
        </motion.p>

        <motion.h1
          style={{
            x: useTransform(smoothMouseX, [0, vw], [-16, 16]),
            y: useTransform(smoothMouseY, [0, vh], [-16, 16]),
          }}
          className="text-4xl font-black text-white mb-4"
        >
          Lost in the Void
        </motion.h1>

        <motion.p
          style={{
            x: useTransform(smoothMouseX, [0, vw], [-8, 8]),
            y: useTransform(smoothMouseY, [0, vh], [-8, 8]),
          }}
          className="text-gray-400 text-base italic mb-8 leading-relaxed"
        >
          {randomText}
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Go back
          </motion.button>
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg hover:shadow-purple-500/25 transition-all relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Return home
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
