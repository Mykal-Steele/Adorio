import React, { useRef, useState, useEffect, useMemo } from "react";
import { Icons } from "./Icons";
import CarouselCard from "./CarouselCard";
import useInfiniteCarousel from "./hooks/useInfiniteCarousel";

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

  // Random tilt logic (10% chance)
  const [tiltStyle] = useState(() => {
    if (Math.random() < 0.1) {
      return { transform: `rotate(${Math.random() * 2 - 1}deg)` };
    }
    return {};
  });

  // Triple the cards for infinite scroll
  const tripleCards = useMemo(() => {
    const safeItems = items && items.length > 0 ? items : [];
    return [...safeItems, ...safeItems, ...safeItems];
  }, [items]);

  return (
    <div className='mb-16 relative' style={tiltStyle}>
      <div className='relative z-10 flex items-end'>
        {/* CRT Monitor with Carousel */}
        <div className='mx-auto relative w-full max-w-[1200px]'>
          <div className='bg-neutral-800 rounded-3xl p-4 pb-8 border-t-4 border-neutral-600 shadow-2xl relative'>
            <div className='bg-black rounded-2xl overflow-hidden p-1 relative'>
              <div className='relative screen-glow overflow-hidden min-h-[320px] flex flex-col justify-center'>
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
      <div className='h-8 w-[120%] -ml-[10%] mt-[-2px] relative shadow-2xl rounded-sm wood-pattern-light'>
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
            <span className='text-yellow-900 font-black  tracking-wider text-sm'>
              {category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Shelf;
