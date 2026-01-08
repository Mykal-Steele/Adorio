import React from "react";
import { Icons } from "./Icons";

// Helper function for status styling
export const getStatusProps = (status) => {
  const s = String(status).toLowerCase();
  if (
    s === "live" ||
    s === "playable" ||
    s === "gallery" ||
    s.startsWith("$")
  ) {
    return "text-red-300 bg-red-900/50 border-red-500/50 shadow-[0_0_5px_rgba(248,113,113,0.2)]";
  }
  if (s === "beta" || s === "demo") {
    return "text-blue-300 bg-blue-900/50 border-blue-500/50 shadow-[0_0_5px_rgba(59,130,246,0.2)]";
  }
  if (s === "proto") {
    return "text-amber-300 bg-amber-900/50 border-amber-500/50 shadow-[0_0_5px_rgba(251,191,36,0.2)]";
  }
  if (s === "archived") {
    return "text-green-300 bg-green-900/50 border-green-500/50 shadow-[0_0_5px_rgba(34,197,94,0.2)]";
  }
  return "text-green-300 bg-green-900/50 border-green-500/50 shadow-[0_0_5px_rgba(34,197,94,0.2)]";
};

// Carousel Card Component
const CarouselCard = React.memo(({ card }) => (
  <div className='carousel-card shrink-0 w-[260px] group'>
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
            <h3 className='text-green-400 font-main text-sm font-bold leading-tight group-hover:text-green-300'>
              {card.title}
            </h3>
            <p className='text-green-500 text-xs font-main'>{card.subtitle}</p>
          </div>
        </div>
        <div className='mt-2 flex items-center justify-between'>
          <span
            className={`px-2 py-0.5 rounded text-xs font-main font-bold uppercase tracking-wider border ${getStatusProps(
              card.price
            )}`}
          >
            {card.price}
          </span>
          <div className='flex items-center gap-1 text-amber-400'>
            <Icons.Star className='w-3.5 h-3.5 fill-amber-400/20' />
            <span className='text-xs font-main font-bold text-green-200'>
              {card.rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
));

export default CarouselCard;
