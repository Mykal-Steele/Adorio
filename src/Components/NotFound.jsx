import React, { useEffect, useState, useRef } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { texts } from "../../assests/404/messages";

const NotFound = () => {
  const [randomText, setRandomText] = useState("");
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 600, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 600, damping: 30 });

  // Lighting effects
  const lightPosition = useTransform(
    [smoothMouseX, smoothMouseY],
    ([x, y]) => `calc(${x}px - 50%) calc(${y}px - 50%)`
  );

  const handleMouseMove = ({ clientX, clientY }) => {
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(clientX - rect.left + window.scrollX);
    mouseY.set(clientY - rect.top + window.scrollY);
  };

  useEffect(() => {
    setRandomText(texts[Math.floor(Math.random() * texts.length)]);
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-950 flex items-center justify-center p-4 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Intense dynamic flashlight */}
      <motion.div
        style={{
          backgroundPosition: lightPosition,
          opacity: useTransform(
            [smoothMouseX, smoothMouseY],
            ([x, y]) => 0.7 - Math.sqrt(x * x + y * y) / 2000
          ),
        }}
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(400px_at_50%_50%,rgba(129,140,248,0.4),transparent)] backdrop-blur-[2px] transition-opacity duration-300"
      />

      {/* Holographic card */}
      <motion.div
        style={{
          rotateX: useTransform(
            smoothMouseY,
            [0, window.innerHeight],
            [15, -15]
          ),
          rotateY: useTransform(
            smoothMouseX,
            [0, window.innerWidth],
            [-15, 15]
          ),
          transformPerspective: 2000,
        }}
        className="relative bg-gray-900/90 backdrop-blur-2xl border border-gray-800/60 rounded-3xl p-8 max-w-md text-center space-y-6 overflow-hidden shadow-2xl"
      >
        {/* Dynamic depth effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 pointer-events-none" />

        {/* Icon with intense glow */}
        <motion.div
          style={{
            x: useTransform(smoothMouseX, [0, window.innerWidth], [-20, 20]),
            y: useTransform(smoothMouseY, [0, window.innerHeight], [-20, 20]),
          }}
          className="flex justify-center relative"
        >
          <SparklesIcon className="h-16 w-16 text-purple-400 relative z-10" />
          <div className="absolute w-32 h-32 bg-purple-600/30 blur-[50px] rounded-full" />
        </motion.div>

        {/* 404 text with dynamic lighting */}
        <motion.h1
          style={{
            textShadow: "0 0 40px rgba(129,140,248,0.4)",
            x: useTransform(smoothMouseX, [0, window.innerWidth], [-30, 30]),
            y: useTransform(smoothMouseY, [0, window.innerHeight], [-30, 30]),
          }}
          className="text-8xl font-black bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent relative"
        >
          404
        </motion.h1>

        {/* Subtle subtitle */}
        <motion.p
          style={{
            x: useTransform(smoothMouseX, [0, window.innerWidth], [-15, 15]),
            y: useTransform(smoothMouseY, [0, window.innerHeight], [-15, 15]),
          }}
          className="text-xl font-medium text-gray-300 uppercase tracking-widest"
        >
          Lost in the Void
        </motion.p>

        {/* Error message */}
        <motion.div
          style={{
            x: useTransform(smoothMouseX, [0, window.innerWidth], [-10, 10]),
            y: useTransform(smoothMouseY, [0, window.innerHeight], [-10, 10]),
          }}
          className="text-gray-400 text-lg italic px-4 relative"
        >
          <span className="relative z-10">{randomText}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-600/15 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        {/* Interactive button */}
        <motion.button
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            x: useTransform(smoothMouseX, [0, window.innerWidth], [-10, 10]),
            y: useTransform(smoothMouseY, [0, window.innerHeight], [-10, 10]),
          }}
          className="inline-flex items-center px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center gap-2">
            <span>Return to Reality</span>
            <motion.svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </motion.svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFound;
