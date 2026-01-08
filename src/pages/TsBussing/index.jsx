import React, { useEffect, useRef, useState } from "react";

// --- DATA ---
const shelfItems = {
  web: [
    {
      id: 1,
      title: "E-Commerce Shop",
      subtitle: "Full Stack React",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=1000&auto=format&fit=crop",
      rating: 5.0,
      price: "Live",
      badge: "Featured",
    },
    {
      id: 2,
      title: "Portfolio V1",
      subtitle: "First Website",
      image:
        "https://images.unsplash.com/photo-1545665277-593795997972?q=80&w=1000&auto=format&fit=crop",
      rating: 3.5,
      price: "Archived",
    },
    {
      id: 3,
      title: "Weather Dashboard",
      subtitle: "Data Viz",
      image:
        "https://images.unsplash.com/photo-1592210454359-9043f067919b?q=80&w=1000&auto=format&fit=crop",
      rating: 4.2,
      price: "Beta",
    },
    {
      id: 4,
      title: "Task Manager",
      subtitle: "Productivity Tool",
      image:
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1000&auto=format&fit=crop",
      rating: 4.8,
      price: "Live",
      badge: "Useful",
    },
  ],
  games: [
    {
      id: 5,
      title: "Cosmic Invaders",
      subtitle: "Arcade Shooter",
      image:
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000&auto=format&fit=crop",
      rating: 4.5,
      price: "Playable",
      badge: "Retro",
    },
    {
      id: 6,
      title: "Dungeon Crawler",
      subtitle: "Roguelike RPG",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
      rating: 4.0,
      price: "Demo",
    },
    {
      id: 7,
      title: "Physics Box",
      subtitle: "Matter.js Test",
      image:
        "https://images.unsplash.com/photo-1628126235206-5260b9ea6441?q=80&w=1000&auto=format&fit=crop",
      rating: 3.8,
      price: "Proto",
    },
    {
      id: 8,
      title: "Physics Box",
      subtitle: "Matter.js Test",
      image:
        "https://images.unsplash.com/photo-1628126235206-5260b9ea6441?q=80&w=1000&auto=format&fit=crop",
      rating: 3.8,
      price: "Proto",
    },
  ],
  art: [
    {
      id: 9,
      title: "Neon Flux",
      subtitle: "Digital Art",
      image:
        "https://images.unsplash.com/photo-1633511090164-b43840ea1607?q=80&w=1000&auto=format&fit=crop",
      rating: 4.9,
      price: "Gallery",
      badge: "New",
    },
    {
      id: 10,
      title: "Cyber Prism",
      subtitle: "Illustration",
      image:
        "https://images.unsplash.com/photo-1614850523060-8da1d56ae167?q=80&w=1000&auto=format&fit=crop",
      rating: 5.0,
      price: "$320",
      badge: "Best Seller",
    },
    {
      id: 11,
      title: "Void Walker",
      subtitle: "Photography",
      image:
        "https://images.unsplash.com/photo-1633511090164-b43840ea1607?q=80&w=1000&auto=format&fit=crop",
      rating: 4.7,
      price: "$150",
    },
    {
      id: 12,
      title: " Walker",
      subtitle: "Photography",
      image:
        "https://images.unsplash.com/photo-1633511090164-b43840ea1607?q=80&w=1000&auto=format&fit=crop",
      rating: 4.1,
      price: "$50",
    },
  ],
};

// Icon components using Lucide-style SVGs
const Icons = {
  User: () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='48'
      height='48'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
      <circle cx='12' cy='7' r='4' />
    </svg>
  ),
  Hammer: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9' />
      <path d='M17.64 15 22 10.64' />
      <path d='m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91' />
    </svg>
  ),
  Code: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <polyline points='16 18 22 12 16 6' />
      <polyline points='8 6 2 12 8 18' />
    </svg>
  ),
  Next: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M6 4l12 16' />
      <path d='M18 4v16' />
      <path d='M6 20V4' />
    </svg>
  ),
  Terminal: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <polyline points='4 17 10 11 4 5' />
      <line x1='12' x2='20' y1='19' y2='19' />
    </svg>
  ),
  Wrench: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
    </svg>
  ),
  Twitter: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' />
    </svg>
  ),
  Github: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4' />
      <path d='M9 18c-4.51 2-5-2-7-2' />
    </svg>
  ),
  Mail: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <rect width='20' height='16' x='2' y='4' rx='2' />
      <path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' />
    </svg>
  ),
  MapPin: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' />
      <circle cx='12' cy='10' r='3' />
    </svg>
  ),
  Star: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='12'
      height='12'
      viewBox='0 0 24 24'
      fill='currentColor'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
    </svg>
  ),
  Play: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <polygon points='6 3 20 12 6 21 6 3' />
    </svg>
  ),
  ArrowLeft: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='m12 19-7-7 7-7' />
      <path d='M19 12H5' />
    </svg>
  ),
  ArrowRight: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M5 12h14' />
      <path d='m12 5 7 7-7 7' />
    </svg>
  ),
  Database: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <ellipse cx='12' cy='5' rx='9' ry='3' />
      <path d='M3 5V19A9 3 0 0 0 21 19V5' />
      <path d='M3 12A9 3 0 0 0 21 12' />
    </svg>
  ),
  Server: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <rect width='20' height='8' x='2' y='2' rx='2' ry='2' />
      <rect width='20' height='8' x='2' y='14' rx='2' ry='2' />
      <line x1='6' x2='6.01' y1='6' y2='6' />
      <line x1='6' x2='6.01' y1='18' y2='18' />
    </svg>
  ),
  Wind: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2' />
      <path d='M9.6 4.6A2 2 0 1 1 11 8H2' />
      <path d='M12.6 19.4A2 2 0 1 0 14 16H2' />
    </svg>
  ),
  Zap: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />
    </svg>
  ),
  Box: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' />
      <polyline points='3.29 7 12 12 20.71 7' />
      <line x1='12' x2='12' y1='22' y2='12' />
    </svg>
  ),
  Whale: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M3 20h18l-2-7h-3.5c-1 0-2-.5-2.5-1.5-1-1.5-2.5-2.5-4.5-2.5-3.5 0-6 2.5-6.5 6H2v3c0 1.1.9 2 2 2z' />
      <rect x='8' y='4' width='3' height='3' rx='0.5' />
      <rect x='12' y='4' width='3' height='3' rx='0.5' />
      <rect x='12' y='8' width='3' height='3' rx='0.5' />
    </svg>
  ),
  Flame: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3a1 1 0 0 1 1.9.8z' />
    </svg>
  ),
  RefreshCw: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' />
      <path d='M21 3v5h-5' />
      <path d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' />
      <path d='M8 16H3v5' />
    </svg>
  ),
  Hash: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <line x1='4' x2='20' y1='9' y2='9' />
      <line x1='4' x2='20' y1='15' y2='15' />
      <line x1='10' x2='8' y1='3' y2='21' />
      <line x1='16' x2='14' y1='3' y2='21' />
    </svg>
  ),
  Globe: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <circle cx='12' cy='12' r='10' />
      <path d='M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' />
      <path d='M2 12h20' />
    </svg>
  ),
  Layers: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <polygon points='12 2 2 7 12 12 22 7 12 2' />
      <polyline points='2 17 12 22 22 17' />
      <polyline points='2 12 12 17 22 12' />
    </svg>
  ),
  Triangle: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M3 20h18L12 4z' />
    </svg>
  ),
  Cloud: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M17.5 19c0-1.7-1.3-3-3-3s-3 1.3-3 3' />
      <path d='M17.5 19h1.5c1.7 0 3-1.3 3-3s-1.3-3-3-3h-1.5c0-2-1.3-4-3-4.5' />
      <path d='M4 19c-1.7 0-3-1.3-3-3s1.3-3 3-3c.5 0 1 .2 1.5.5C6 11.5 8 10 10.5 10c2.5 0 4.5 1.5 5 3.5' />
      <path d='M14.5 19h-10.5' />
    </svg>
  ),
  Compass: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <circle cx='12' cy='12' r='10' />
      <polygon points='16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76' />
    </svg>
  ),
  Tag: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z' />
      <path d='M7 7h.01' />
    </svg>
  ),
  Sparkle: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z' />
    </svg>
  ),
  CloudLightning: ({ className }) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973' />
      <path d='m13 12-3 5h4l-3 5' />
    </svg>
  ),
};

// Carousel Card Component
const CarouselCard = React.memo(({ card }) => (
  <div className='carousel-card shrink-0 w-[180px] group'>
    <div className='bg-green-900/30 border border-green-500/40 rounded-lg p-2 transition-all duration-300 group-hover:bg-green-900/50 group-hover:border-green-400/60'>
      <div className='relative aspect-[4/3] overflow-hidden rounded bg-black/50 border border-green-800/50'>
        <img
          src={card.image}
          alt={card.title}
          loading='lazy'
          className='object-cover w-full h-full opacity-70 transition-all duration-500 group-hover:opacity-90 group-hover:scale-110 mix-blend-luminosity group-hover:mix-blend-normal'
          style={{ filter: "sepia(20%) hue-rotate(80deg) saturate(50%)" }}
        />
        {card.badge && (
          <div className='absolute top-2 right-2 bg-green-500 text-black px-2 py-0.5 rounded text-[10px] font-bold '>
            {card.badge}
          </div>
        )}
      </div>
      <div className='p-2'>
        <div className='flex justify-between items-start mb-1'>
          <div>
            <h3 className='text-green-400 font-mono text-sm font-bold leading-tight group-hover:text-green-300'>
              {card.title}
            </h3>
            <p className='text-green-600/70 text-[10px] font-mono'>
              {card.subtitle}
            </p>
          </div>
        </div>
        <div className='mt-1 flex items-center justify-between'>
          <span className='text-green-400 font-mono text-sm font-bold'>
            {card.price}
          </span>
          <div className='flex items-center gap-0.5 text-amber-500'>
            <Icons.Star className='w-3 h-3' />
            <span className='text-[10px] font-mono text-green-500'>
              {card.rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
));

// Infinite Carousel Hook
const useInfiniteCarousel = (trackRef, speed = 0.5, pauseOnHover = true) => {
  const animationRef = useRef(null);
  const isHoveringRef = useRef(false);
  const isDraggingRef = useRef(false);
  const directionRef = useRef(Math.random() < 0.5 ? -1 : 1);
  const wheelVelocityRef = useRef(0);
  const wheelAnimationRef = useRef(null);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const lastDragXRef = useRef(0);
  const controlsRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const carousel = track.querySelector(".carousel-content");
    if (!carousel) return;

    const cards = carousel.querySelectorAll(".carousel-card");
    if (cards.length === 0) return;

    const cardWidth = cards[0].offsetWidth;
    const gap = 16;
    const originalCardCount = cards.length / 3;
    const singleSetWidth = originalCardCount * (cardWidth + gap);

    // Start in the middle
    track.scrollLeft = singleSetWidth;

    const checkLoop = () => {
      if (track.scrollLeft <= 0) {
        track.scrollLeft = singleSetWidth;
      } else if (track.scrollLeft >= singleSetWidth * 2) {
        track.scrollLeft = singleSetWidth;
      }
    };

    const autoScroll = () => {
      if (!(pauseOnHover && isHoveringRef.current) && !isDraggingRef.current) {
        track.scrollLeft += speed * directionRef.current;
      }
      animationRef.current = requestAnimationFrame(autoScroll);
    };

    const smoothWheelScroll = () => {
      if (Math.abs(wheelVelocityRef.current) > 0.5) {
        track.scrollLeft += wheelVelocityRef.current;
        wheelVelocityRef.current *= 0.92;
        wheelAnimationRef.current = requestAnimationFrame(smoothWheelScroll);
      } else {
        wheelVelocityRef.current = 0;
        wheelAnimationRef.current = null;
      }
    };

    // Setup controls
    controlsRef.current = (dir) => {
      // Logic matches HTML version: ArrowRight (1) -> direction -1
      const targetDir = -dir;
      directionRef.current = targetDir;

      // Add generous momentum in the target direction
      wheelVelocityRef.current += targetDir * 25;

      // Clamp velocity
      wheelVelocityRef.current = Math.max(
        -60,
        Math.min(60, wheelVelocityRef.current)
      );

      if (!wheelAnimationRef.current) {
        wheelAnimationRef.current = requestAnimationFrame(smoothWheelScroll);
      }
    };

    const handleScroll = () => checkLoop();
    const handleMouseEnter = () => {
      isHoveringRef.current = true;
    };
    const handleMouseLeave = () => {
      isHoveringRef.current = false;
      isDraggingRef.current = false;
    };
    const handleWheel = (e) => {
      e.preventDefault();
      wheelVelocityRef.current += e.deltaY * 0.05;
      wheelVelocityRef.current = Math.max(
        -50,
        Math.min(50, wheelVelocityRef.current)
      );
      if (Math.abs(e.deltaY) > 2) {
        directionRef.current = e.deltaY > 0 ? 1 : -1;
      }
      if (!wheelAnimationRef.current) {
        wheelAnimationRef.current = requestAnimationFrame(smoothWheelScroll);
      }
    };
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      startXRef.current = e.pageX - track.offsetLeft;
      scrollLeftRef.current = track.scrollLeft;
      lastDragXRef.current = e.pageX;
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startXRef.current) * 2;
      track.scrollLeft = scrollLeftRef.current - walk;
      const dragDelta = e.pageX - lastDragXRef.current;
      if (Math.abs(dragDelta) > 2) {
        directionRef.current = dragDelta < 0 ? 1 : -1;
      }
      lastDragXRef.current = e.pageX;
    };

    track.addEventListener("scroll", handleScroll);
    track.addEventListener("mouseenter", handleMouseEnter);
    track.addEventListener("mouseleave", handleMouseLeave);
    track.addEventListener("wheel", handleWheel, { passive: false });
    track.addEventListener("mousedown", handleMouseDown);
    track.addEventListener("mouseup", handleMouseUp);
    track.addEventListener("mousemove", handleMouseMove);

    animationRef.current = requestAnimationFrame(autoScroll);

    return () => {
      controlsRef.current = null;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (wheelAnimationRef.current)
        cancelAnimationFrame(wheelAnimationRef.current);
      track.removeEventListener("scroll", handleScroll);
      track.removeEventListener("mouseenter", handleMouseEnter);
      track.removeEventListener("mouseleave", handleMouseLeave);
      track.removeEventListener("wheel", handleWheel);
      track.removeEventListener("mousedown", handleMouseDown);
      track.removeEventListener("mouseup", handleMouseUp);
      track.removeEventListener("mousemove", handleMouseMove);
    };
  }, [trackRef, speed, pauseOnHover]);

  return {
    setDirection: (dir) => controlsRef.current?.(dir),
  };
};

// Shelf Component with Carousel
const Shelf = React.memo(({ category, iconName, speed, items }) => {
  const trackRef = useRef(null);
  const labelRef = useRef(null);
  const [fallingStyle, setFallingStyle] = useState({});
  const { setDirection } = useInfiniteCarousel(trackRef, speed, true);
  const [hoverCount, setHoverCount] = useState(0);
  const isFalling = hoverCount >= 10;

  useEffect(() => {
    if (isFalling && labelRef.current) {
      const rect = labelRef.current.getBoundingClientRect();

      // Randomize the fall
      const randomX = (Math.random() - 0.5) * 400; // -200px to +200px drift
      const randomRotate =
        360 + Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1);

      setFallingStyle({
        position: "fixed",
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 100,
        margin: 0,
        transform: "none",
        transition: "none",
        pointerEvents: "none",
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFallingStyle({
            position: "fixed",
            top: `calc(100vh - ${rect.height}px)`,
            left: `${rect.left + randomX}px`,
            width: `${rect.width}px`,
            zIndex: 100,
            margin: 0,
            transform: `rotate(${randomRotate}deg)`,
            transition:
              "top 2s cubic-bezier(0.5, 0, 1, 1), left 2s ease-in-out, transform 2s ease-in",
            pointerEvents: "none",
          });
        });
      });
    }
  }, [isFalling]);

  const handleMouseEnter = () => {
    if (!isFalling) {
      setHoverCount((c) => c + 1);
    }
  };

  const IconComponent = Icons[iconName] || Icons.Code;

  // Random tilt logic (10% chance) - calculated initially to avoid jump
  const [tiltStyle] = useState(() => {
    if (Math.random() < 0.1) {
      // Very slight tilt between -1deg and 1deg
      return { transform: `rotate(${Math.random() * 2 - 1}deg)` };
    }
    return {};
  });

  // Triple the cards for infinite scroll
  const tripleCards = React.useMemo(() => {
    const safeItems = items && items.length > 0 ? items : [];
    return [...safeItems, ...safeItems, ...safeItems];
  }, [items]);

  return (
    <div className='mb-16 relative' style={tiltStyle}>
      <div className='relative z-10 flex items-end'>
        {/* CRT Monitor with Carousel */}
        <div className='mx-auto relative w-full max-w-2xl'>
          <div className='bg-neutral-800 rounded-3xl p-4 pb-8 border-t-4 border-neutral-600 shadow-2xl relative'>
            <div className='bg-black rounded-2xl overflow-hidden p-1 relative'>
              <div className='relative screen-glow overflow-hidden'>
                {/* Scanlines */}
                <div
                  className='pointer-events-none absolute inset-0 z-20'
                  style={{
                    background:
                      "linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,0.25) 50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))",
                    backgroundSize: "100% 2px,3px 100%",
                  }}
                ></div>
                {/* Edge Gradients */}
                <div
                  className='absolute top-0 bottom-0 left-0 w-16 z-10 pointer-events-none'
                  style={{
                    background:
                      "linear-gradient(to right, #0d0d0d 0%, transparent 100%)",
                  }}
                ></div>
                <div
                  className='absolute top-0 bottom-0 right-0 w-16 z-10 pointer-events-none'
                  style={{
                    background:
                      "linear-gradient(to left, #0d0d0d 0%, transparent 100%)",
                  }}
                ></div>
                {/* Carousel Track */}
                <div
                  ref={trackRef}
                  className='overflow-x-auto scrollbar-hide'
                  style={{ scrollBehavior: "auto" }}
                >
                  <div
                    className='carousel-content flex gap-4 py-4 px-2 items-center'
                    style={{ width: "max-content" }}
                  >
                    {tripleCards.map((card, index) => (
                      <CarouselCard key={index} card={card} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Monitor Controls */}
            <div className='mt-4 flex justify-between items-center px-4'>
              <div className='flex gap-4'>
                <button
                  onClick={() => setDirection(-1)}
                  className='w-8 h-8 rounded-full bg-neutral-900 border-2 border-neutral-600 shadow-md flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 active:scale-95 transition-all'
                >
                  <Icons.ArrowLeft className='w-4 h-4' />
                </button>
                <button
                  onClick={() => setDirection(1)}
                  className='w-8 h-8 rounded-full bg-neutral-900 border-2 border-neutral-600 shadow-md flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 active:scale-95 transition-all'
                >
                  <Icons.ArrowRight className='w-4 h-4' />
                </button>
              </div>
              <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]'></div>
            </div>
          </div>
        </div>
      </div>
      {/* Shelf */}
      <div className='h-8 w-full mt-[-2px] relative shadow-2xl rounded-sm wood-pattern-light'>
        <div className='absolute top-0 left-0 w-full h-2 bg-black/20'></div>
        {/* Category Label */}
        <div
          ref={labelRef}
          className='absolute left-1/2 -translate-x-1/2 -top-8 z-20 group'
          onMouseEnter={handleMouseEnter}
          style={fallingStyle}
        >
          <div className='w-40 h-20 rounded-lg border-4 border-yellow-900 flex flex-col items-center justify-center shadow-2xl bg-[#deb887] relative transform group-hover:rotate-3 transition-transform duration-300'>
            {/* Nails */}
            <div className='absolute bottom-5 left-1 w-1.5 h-1.5 rounded-full bg-neutral-800 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.3)] border border-neutral-900/50'></div>
            <div className='absolute bottom-5 right-1 w-1.5 h-1.5 rounded-full bg-neutral-800 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.3)] border border-neutral-900/50'></div>
            <IconComponent className='text-yellow-900 mb-1 w-7 h-7' />
            <span className='text-yellow-950 font-black  tracking-wider text-sm'>
              {category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Calendar Widget
const CalendarWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='bg-white p-4 rounded shadow-lg mt-8 relative border-t-8 border-red-500'>
      <div className='absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-neutral-400'></div>
      <div className='text-center'>
        <div className='text-4xl font-bold text-neutral-800'>
          {currentTime.getDate()}
        </div>
        <div className='text-red-500 font-bold tracking-widest text-sm'>
          {currentTime.toLocaleString("default", { month: "long" })}{" "}
          {currentTime.getFullYear()}
        </div>
        <div className='mt-2 text-neutral-400 text-xs font-mono border-t pt-2'>
          {currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

// Main Page Component
const TsBussing = () => {
  return (
    <div className='min-h-screen text-neutral-200 font-sans selection:bg-amber-900 selection:text-white grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[320px_1fr_288px] md:overflow-y-auto lg:overflow-hidden bg-[#2e2e2e]'>
      {/* Custom styles */}
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Permanent+Marker&family=JetBrains+Mono:wght@400;700&display=swap");

        .font-handwriting { font-family: "Permanent Marker", cursive; }
        .font-mono { font-family: "JetBrains Mono", monospace; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .wood-pattern-dark {
          background-color: #3e2723;
          background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 8px),
            linear-gradient(to bottom, #2d1b18, #3e2723);
        }

        .wood-pattern-light {
          background-color: #795548;
          background-image: repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 10px),
            linear-gradient(to bottom, #8e6f64ff, #7a574aff);
        }

        .cork-pattern {
          background-color: #d7c49e;
          background-image: linear-gradient(rgba(214, 196, 158, 0.5), rgba(215, 196, 158, 0.5)), url("https://media.istockphoto.com/id/517699927/photo/corkboard-texture.jpg?s=612x612&w=0&k=20&c=gVkDdfbmPLkz029sAj4T_L7aGgCmCjfpXJ8caGVyZi8=");
          background-size: 400px;
          background-repeat: repeat;
        }

        .screen-glow {
          box-shadow: inset 0 0 20px rgba(0,0,0,0.6), 0 0 10px rgba(100,255,100,0.2);
          background: linear-gradient(to bottom, #1a1a1a, #0d0d0d);
        }

        /* Wood Scrollbar Theme */
        .custom-scrollbar::-webkit-scrollbar {
          width: 16px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #4c3131ff; 
          border-left: 1px solid #4e342e;
          box-shadow: inset 0 0 6px rgba(0,0,0,0.8);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #5d4037;
          border-radius: 2px;
          border: 1px solid #3e2723;
          /* Wood grain simulation */
          background-image: 
            repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 12px),
            linear-gradient(to right, #77483dff, #aa7260ff, #4a2c25);
          box-shadow: inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.4);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-image: 
            repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 12px),
            linear-gradient(to right, #5d4037, #795548, #5d4037);
        }

        /* Corner for when both scrollbars meet */
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #261a15;
        }
      `}</style>

      {/* Background Image */}
      <div
        className='fixed inset-0 pointer-events-none z-0'
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1585773818428-b50bebdc2344?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29vZCUyMHdhbGx8ZW58MHx8MHx8fDA%3D')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.65, // Lower opacity to blend with dark theme, or strip this if user wants full brightness
        }}
      ></div>

      {/* Left Sidebar */}
      <aside className='w-full z-30 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)] overflow-y-auto h-auto md:h-auto lg:h-screen relative wood-pattern-dark row-start-1 col-start-1'>
        <div className='p-8 flex flex-col gap-8'>
          {/* Profile Frame */}
          <div
            className='relative mx-auto group'
            style={{ perspective: "1000px" }}
          >
            <div className='w-40 h-40 bg-neutral-800 border-[12px] border-amber-900 shadow-2xl rounded-lg overflow-hidden relative rotate-1 transition-transform group-hover:rotate-0'>
              <div className='absolute top-1 left-1 w-2 h-2 bg-amber-950 rounded-full shadow-inner'></div>
              <div className='absolute top-1 right-1 w-2 h-2 bg-amber-950 rounded-full shadow-inner'></div>
              <div className='absolute bottom-1 left-1 w-2 h-2 bg-amber-950 rounded-full shadow-inner'></div>
              <div className='absolute bottom-1 right-1 w-2 h-2 bg-amber-950 rounded-full shadow-inner'></div>
              <div className='w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 overflow-hidden'>
                <img
                  src='https://i.ibb.co/KxH3wXDS/download-3.png'
                  alt='Oakar Oo'
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none'></div>
            </div>
            <div className='text-center mt-4'>
              <h1 className='text-2xl font-black text-amber-100 drop-shadow-md font-serif tracking-widest '>
                Oakar Oo
              </h1>
              <p className='text-amber-400/80 text-sm font-mono'>Student</p>
            </div>
          </div>

          {/* Navigation - with clear hierarchy */}
          <nav className='space-y-4'>
            {["Home", "About"].map((item) => (
              <a href='#' key={item} className='block relative group'>
                {item === "Home" && (
                  <>
                    {/* Centered on the ropes using the same left/right values */}
                    <div className='absolute -top-5 left-[1.15rem] w-2.5 h-2.5 bg-zinc-900 rounded-full z-20 -translate-x-[40%] shadow-sm'></div>
                    <div className='absolute -top-5 right-[1.15rem] w-2.5 h-2.5 bg-zinc-900 rounded-full z-20 translate-x-[40%] shadow-sm'></div>
                  </>
                )}

                <div className='absolute -top-4 left-[1.15rem] w-0.5 h-6 bg-amber-800 z-0'></div>
                <div className='absolute -top-4 right-[1.15rem] w-0.5 h-6 bg-amber-800 z-0'></div>

                <div className='relative z-10 h-9 bg-[#3d1a10] border border-amber-950/50 rounded flex items-center justify-center text-amber-200/80 text-sm tracking-wider transition-colors group-hover:bg-[#4a2014]'>
                  {item}
                </div>
              </a>
            ))}

            {/* CV BUTTON */}
            <a href='#' className='block relative mt-8 group '>
              <div className='absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-8 bg-amber-800 z-0'></div>

              <div className='relative z-10  h-12 bg-gradient-to-b from-amber-700 to-amber-900 border-2 border-amber-400/30 rounded-lg flex items-center justify-center text-white font-bold tracking-widest transition-opacity group-hover:opacity-90'>
                My CV
              </div>
            </a>
          </nav>

          {/* Tool Rack */}
          <div className='bg-black/20 p-4 rounded-lg border border-white/5'>
            <h2 className='text-amber-500 text-xs  tracking-widest mb-4 border-b border-amber-500/30 pb-2'>
              Tech Stack
            </h2>
            <div className='grid grid-cols-3 gap-3'>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Hammer className='text-neutral-400 group-hover:text-amber-400 transition-colors' />
                <span className='text-[10px] text-neutral-500'>HTML/CSS</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Code className='text-neutral-400 group-hover:text-blue-400 transition-colors' />
                <span className='text-[10px] text-neutral-500'>React</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Next className='text-neutral-400 group-hover:text-white transition-colors' />
                <span className='text-[10px] text-neutral-500'>Next.js</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Wind className='text-neutral-400 group-hover:text-sky-400 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Tailwind</span>
              </div>

              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Terminal className='text-neutral-400 group-hover:text-green-400 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Node.js</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Server className='text-neutral-400 group-hover:text-gray-200 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Express</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Flame className='text-neutral-400 group-hover:text-orange-400 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Hono</span>
              </div>

              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Terminal className='text-neutral-400 group-hover:text-yellow-300 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Python</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Hash className='text-neutral-400 group-hover:text-purple-400 transition-colors' />
                <span className='text-[10px] text-neutral-500'>C#</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Zap className='text-neutral-400 group-hover:text-yellow-400 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Socket.io</span>
              </div>

              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Database className='text-neutral-400 group-hover:text-green-500 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Mongo</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Layers className='text-neutral-400 group-hover:text-indigo-400 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Prisma</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Whale className='text-neutral-400 group-hover:text-blue-500 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Docker</span>
              </div>

              <div className='flex flex-col items-center gap-1 group'>
                <Icons.RefreshCw className='text-neutral-400 group-hover:text-emerald-400 transition-colors' />
                <span className='text-[10px] text-neutral-500'>CI/CD</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Globe className='text-neutral-400 group-hover:text-green-600 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Nginx</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Triangle className='text-neutral-400 group-hover:text-white transition-colors' />
                <span className='text-[10px] text-neutral-500'>Vercel</span>
              </div>

              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Cloud className='text-neutral-400 group-hover:text-blue-300 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Render</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Compass className='text-neutral-400 group-hover:text-rose-400 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Northflank</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.CloudLightning className='text-neutral-400 group-hover:text-orange-400 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Cloudflare</span>
              </div>

              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Tag className='text-neutral-400 group-hover:text-orange-600 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Namecheap</span>
              </div>
              <div className='flex flex-col items-center gap-1 group'>
                <Icons.Sparkle className='text-neutral-400 group-hover:text-blue-400 transition-colors' />
                <span className='text-[10px] text-neutral-500'>Gemini</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className='h-auto lg:h-screen overflow-visible lg:overflow-y-auto overflow-x-hidden relative z-10 md:row-span-2 lg:row-span-1 md:col-start-2 lg:col-start-2 custom-scrollbar'>
        <div className='relative z-10 max-w-4xl mx-auto pt-12 pb-24 px-4 md:px-12'>
          <div className='mb-12 text-center md:text-left md:pl-4'>
            <h2 className='text-4xl md:text-5xl font-handwriting font-bold mt-4 text-white drop-shadow-[0_4px_0_rgba(0,0,0,1)]'>
              Projects
            </h2>
            <p className='text-neutral-500 mt-3 font-mono text-white text-xs tracking-wide'>
              Click on the card to go to the project page!
            </p>
          </div>

          {/* Shelves */}
          <Shelf
            category='Web Dev'
            iconName='Code'
            speed={0.5}
            items={shelfItems.web}
          />
          <Shelf
            category='Game Dev'
            iconName='Play'
            speed={0.65}
            items={shelfItems.games}
          />
          <Shelf
            category='Artworks'
            iconName='Hammer'
            speed={0.8}
            items={shelfItems.art}
          />
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className='w-full z-30 shadow-[-4px_0_24px_rgba(0,0,0,0.5)] h-auto md:h-auto lg:h-screen overflow-y-auto border-l-0 md:border-l-0 lg:border-l-8 border-t-8 md:border-t-8 lg:border-t-0 border-amber-900 cork-pattern md:col-start-1 md:row-start-2 lg:col-start-3 lg:row-start-1'>
        <div className='p-6 flex flex-col gap-6 relative'>
          {/* Note - feels handwritten */}
          <div className='bg-yellow-100 text-yellow-900 p-4 shadow-md rotate-[2.5deg] transform relative'>
            <div className='absolute -top-3 mt-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-md'></div>
            <p className='font-handwriting text-base leading-relaxed'>
              Currently Learning
              <br />
              <span className='text-amber-700 font-bold'>Golang!</span>
            </p>
            <p className='text-[10px] font-mono text-yellow-700/60 mt-2 -rotate-1'>
              — pinned Jan 7 2026
            </p>
          </div>

          <div className='grid grid-cols-1 gap-3 mt-4'>
            <a
              href='https://github.com/Mykal-Steele/'
              className='bg-neutral-100 text-neutral-900 p-4 shadow-lg rotate-[2.5deg] hover:rotate-[0.5deg] hover:scale-[1.02] transition-all duration-300 relative group ml-2'
            >
              <div className='absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-yellow-500 shadow-md z-10'></div>
              <div className='flex items-center gap-3'>
                <Icons.Github />
                <span className='font-handwriting font-bold hover:underline'>
                  Mykal-Steele
                </span>
              </div>
              <span className='text-[10px] text-neutral-500 font-mono mt-1 block'>
                - check my codes here
              </span>
            </a>
            <a
              href='mailto:oakar@adorio.space'
              className='bg-amber-50 text-amber-900 p-3 shadow-md -rotate-[3deg] hover:-rotate-[1deg] transition-all duration-200 relative group mr-4 mt-4'
            >
              <div className='absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 shadow-sm z-10'></div>
              <div className='flex items-center gap-2'>
                <Icons.Mail />
                <span className='font-handwriting font-bold text-sm hover:underline'>
                  oakar@adorio.space
                </span>
              </div>
              <span className='text-[10px] text-neutral-500 font-mono mt-1 block'>
                - sadly, i can't email you back with this email, but i WILL
                reply you back!
              </span>
            </a>
          </div>

          {/* Calendar */}
          <CalendarWidget />

          {/* Hint Sticky Note */}
          <div className='bg-amber-50 p-4 shadow-md rotate-[-1.5deg] transform relative mt-4 hover:rotate-[0.5deg] transition-all duration-300'>
            <div className='absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-md'></div>
            <p className='font-handwriting text-neutral-800 text-sm leading-relaxed'>
              There is an easier egg! :D
              <br />
              <span className='text-neutral-500 text-xs font-mono ml-2'>
                (hint: tilt)
              </span>
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default TsBussing;
