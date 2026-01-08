import { useEffect, useRef, useState } from "react";
import { Star, ArrowUpRight } from "lucide-react";
import AdSenseScript from "../../Components/AdSenseScript";

const cardsData = [
  {
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    title: "Abstract Waves",
    subtitle: "3D Render",
    rating: 4.9,
    price: "$240",
    badge: "New",
  },
  {
    image:
      "https://images.unsplash.com/photo-1633511090164-b43840ea1607?q=80&w=1000&auto=format&fit=crop",
    title: "Neon Flux",
    subtitle: "Digital Art",
    rating: 4.8,
    price: "$180",
  },
  {
    image:
      "https://images.unsplash.com/photo-1614850523060-8da1d56ae167?q=80&w=1000&auto=format&fit=crop",
    title: "Cyber Prism",
    subtitle: "Illustration",
    rating: 5.0,
    price: "$320",
    badge: "Best Seller",
    badgeColor: "bg-indigo-600",
  },
  {
    image:
      "https://images.unsplash.com/photo-1633511090164-b43840ea1607?q=80&w=1000&auto=format&fit=crop",
    title: "Void Walker",
    subtitle: "Photography",
    rating: 4.7,
    price: "$150",
  },
  {
    image:
      "https://images.unsplash.com/photo-1618172193763-c511deb635ca?q=80&w=1000&auto=format&fit=crop",
    title: "Solar Flare",
    subtitle: "Abstract",
    rating: 4.6,
    price: "$290",
  },
];

// Triple the cards for infinite scroll
const tripleCards = [...cardsData, ...cardsData, ...cardsData];

function CarouselCard({ card }) {
  return (
    <div className='carousel-card shrink-0 w-[280px] group'>
      <div className='bg-white rounded-xl p-2 shadow-sm border border-gray-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg'>
        <div className='relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100'>
          <img
            src={card.image}
            alt={card.title}
            className='object-cover w-full h-full transition-transform duration-700 group-hover:scale-110'
          />
          {card.badge && (
            <div
              className={`absolute top-2 right-2 ${
                card.badgeColor || "bg-white/90 backdrop-blur-sm"
              } px-2 py-1 rounded-full text-xs font-semibold ${
                card.badgeColor ? "text-white" : "text-gray-900"
              }`}
            >
              {card.badge}
            </div>
          )}
        </div>
        <div className='p-3'>
          <div className='flex justify-between items-start mb-1'>
            <div>
              <h3 className='text-base font-bold text-gray-900'>
                {card.title}
              </h3>
              <p className='text-gray-500 text-xs'>{card.subtitle}</p>
            </div>
            <div className='flex items-center gap-0.5 text-amber-500'>
              <Star className='w-3 h-3 fill-current' />
              <span className='text-xs font-medium text-gray-700'>
                {card.rating}
              </span>
            </div>
          </div>
          <div className='mt-2 flex items-center justify-between'>
            <span className='text-lg font-bold text-gray-900'>
              {card.price}
            </span>
            <button className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 hover:bg-indigo-600 hover:text-white transition-colors'>
              <ArrowUpRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Retro CRT TV Component with full carousel logic from carouselUtil.js
function RetroTV({ style = "beige" }) {
  const trackRef = useRef(null);
  const carouselRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const useInfiniteScroll = cardsData.length > 3;
  const displayCards = useInfiniteScroll ? tripleCards : cardsData;

  const tvStyles = {
    beige: "from-stone-200 via-stone-100 to-stone-200",
    cream: "from-amber-50 via-orange-50 to-amber-100",
    gray: "from-gray-300 via-gray-200 to-gray-300",
    white: "from-gray-100 via-white to-gray-200",
  };

  useEffect(() => {
    if (!useInfiniteScroll) {
      setIsReady(true);
      return;
    }

    const track = trackRef.current;
    const carousel = carouselRef.current;
    if (!track || !carousel) return;

    const gap = 24;
    const initialSpeed = 0.8;

    const firstCard = carousel.querySelector(".carousel-card");
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const originalCardCount = cardsData.length;
    const singleSetWidth = originalCardCount * (cardWidth + gap);

    // Start in the middle set
    track.scrollLeft = singleSetWidth;
    setIsReady(true);

    let autoScrollSpeed = initialSpeed;
    let autoScrollDirection = 1;
    let isHovering = false;
    let isDragging = false;
    let lastManualDirection = 1;
    let animationId;
    let wheelVelocity = 0;
    let wheelAnimationId = null;
    let startX;
    let scrollLeft;
    let lastDragX = 0;

    function checkLoop() {
      if (track.scrollLeft <= 0) {
        track.scrollLeft = singleSetWidth;
      } else if (track.scrollLeft >= singleSetWidth * 2) {
        track.scrollLeft = singleSetWidth;
      }
    }

    track.addEventListener("scroll", checkLoop);

    // Main auto-scroll loop - pauses on hover like carouselUtil.js
    function autoScroll() {
      if (!isHovering && !isDragging) {
        track.scrollLeft += autoScrollSpeed * autoScrollDirection;
      }
      animationId = requestAnimationFrame(autoScroll);
    }

    autoScroll();

    // Hover handlers
    const handleMouseEnter = () => {
      isHovering = true;
      track.style.cursor = "grab";
    };

    const handleMouseLeave = () => {
      isHovering = false;
      isDragging = false;
      track.style.cursor = "default";
      // Keep going the way user was scrolling
      autoScrollDirection = lastManualDirection;
    };

    // Smooth wheel scroll with momentum
    function smoothWheelScroll() {
      if (Math.abs(wheelVelocity) > 0.5) {
        track.scrollLeft += wheelVelocity;
        wheelVelocity *= 0.92; // Slow down gradually
        wheelAnimationId = requestAnimationFrame(smoothWheelScroll);
      } else {
        wheelVelocity = 0;
        wheelAnimationId = null;
      }
    }

    const handleWheel = (e) => {
      e.preventDefault();
      wheelVelocity += e.deltaY * 0.5;
      wheelVelocity = Math.max(-50, Math.min(50, wheelVelocity));

      if (Math.abs(e.deltaY) > 2) {
        lastManualDirection = e.deltaY > 0 ? 1 : -1;
        autoScrollDirection = lastManualDirection;
      }

      if (!wheelAnimationId) {
        wheelAnimationId = requestAnimationFrame(smoothWheelScroll);
      }
    };

    // Drag handlers
    const handleMouseDown = (e) => {
      isDragging = true;
      track.style.cursor = "grabbing";
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      lastDragX = e.pageX;
    };

    const handleMouseUp = () => {
      isDragging = false;
      if (isHovering) track.style.cursor = "grab";
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 2;
      track.scrollLeft = scrollLeft - walk;

      const dragDelta = e.pageX - lastDragX;
      if (Math.abs(dragDelta) > 2) {
        lastManualDirection = dragDelta < 0 ? 1 : -1;
        autoScrollDirection = lastManualDirection;
      }
      lastDragX = e.pageX;
    };

    // Add all event listeners
    track.addEventListener("mouseenter", handleMouseEnter);
    track.addEventListener("mouseleave", handleMouseLeave);
    track.addEventListener("wheel", handleWheel, { passive: false });
    track.addEventListener("mousedown", handleMouseDown);
    track.addEventListener("mouseup", handleMouseUp);
    track.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (wheelAnimationId) cancelAnimationFrame(wheelAnimationId);
      track.removeEventListener("scroll", checkLoop);
      track.removeEventListener("mouseenter", handleMouseEnter);
      track.removeEventListener("mouseleave", handleMouseLeave);
      track.removeEventListener("wheel", handleWheel);
      track.removeEventListener("mousedown", handleMouseDown);
      track.removeEventListener("mouseup", handleMouseUp);
      track.removeEventListener("mousemove", handleMouseMove);
    };
  }, [useInfiniteScroll]);

  return (
    <div className='p-3'>
      {/* TV Body */}
      <div
        className={`bg-gradient-to-b ${tvStyles[style]} rounded-lg shadow-lg border border-gray-300`}
      >
        {/* Top vents */}
        <div className='flex justify-center gap-1 pt-2 pb-1'>
          {[...Array(12)].map((_, i) => (
            <div key={i} className='w-4 h-0.5 bg-gray-400/50 rounded-full' />
          ))}
        </div>

        {/* Screen area */}
        <div className='mx-3 mb-3'>
          {/* Screen bezel */}
          <div className='bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 p-2 rounded-lg'>
            {/* CRT Screen with curved edges look */}
            <div
              className='relative bg-gradient-to-br from-gray-200 via-white to-gray-100 rounded overflow-hidden'
              style={{
                boxShadow:
                  "inset 0 0 20px rgba(0,0,0,0.3), inset 0 0 60px rgba(0,0,0,0.1)",
              }}
            >
              {/* Scanlines overlay */}
              <div
                className='absolute inset-0 z-30 pointer-events-none opacity-[0.03]'
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
                }}
              />

              {/* Screen glare */}
              <div
                className='absolute inset-0 z-20 pointer-events-none opacity-20'
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 40%, transparent 100%)",
                }}
              />

              {/* Fade Gradients */}
              {useInfiniteScroll && (
                <>
                  <div
                    className='absolute top-0 bottom-0 left-0 w-12 z-10 pointer-events-none'
                    style={{
                      background:
                        "linear-gradient(to right, rgb(255 255 255) 0%, transparent 100%)",
                    }}
                  />
                  <div
                    className='absolute top-0 bottom-0 right-0 w-12 z-10 pointer-events-none'
                    style={{
                      background:
                        "linear-gradient(to left, rgb(255 255 255) 0%, transparent 100%)",
                    }}
                  />
                </>
              )}

              {/* Carousel Content */}
              <div
                ref={trackRef}
                className='overflow-x-auto'
                style={{
                  scrollBehavior: "auto",
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                  opacity: isReady ? 1 : 0,
                }}
              >
                <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
                <div
                  ref={carouselRef}
                  className='flex gap-6 py-5 pl-3 items-center'
                  style={{ width: "max-content" }}
                >
                  {displayCards.map((card, index) => (
                    <CarouselCard key={index} card={card} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control panel */}
        <div className='flex items-center justify-between px-4 pb-3'>
          {/* Left - Brand */}
          <div className='flex items-center gap-2'>
            <span className='text-xs font-bold text-gray-600 tracking-wider'>
              ADORIO
            </span>
          </div>

          {/* Right - Knobs and buttons */}
          <div className='flex items-center gap-2'>
            {/* Channel knob */}
            <div className='w-6 h-6 rounded-full bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-500 shadow-inner'>
              <div className='w-full h-full rounded-full flex items-center justify-center'>
                <div className='w-1 h-2 bg-gray-400 rounded-full' />
              </div>
            </div>
            {/* Volume knob */}
            <div className='w-6 h-6 rounded-full bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-500 shadow-inner'>
              <div className='w-full h-full rounded-full flex items-center justify-center'>
                <div className='w-1 h-2 bg-gray-400 rounded-full rotate-45' />
              </div>
            </div>
            {/* Power button */}
            <div className='w-4 h-4 rounded-sm bg-gradient-to-b from-gray-700 to-gray-900 border border-gray-600' />
          </div>
        </div>
      </div>
    </div>
  );
}

// Wooden Sign Component
function WoodenSign({ text }) {
  return (
    <div className='relative'>
      {/* Sign board */}
      <div
        className='px-6 py-4 rounded-lg shadow-lg'
        style={{
          background:
            "linear-gradient(135deg, #8B4513 0%, #A0522D 25%, #8B4513 50%, #6B3E0A 75%, #8B4513 100%)",
          boxShadow:
            "inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.3)",
        }}
      >
        {/* Wood grain lines */}
        <div
          className='absolute inset-0 opacity-20 rounded-lg pointer-events-none'
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 10px)",
          }}
        />
        <p
          className='text-amber-100 font-bold text-lg tracking-wide relative z-10'
          style={{
            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          {text}
        </p>
      </div>
      {/* Nail/screw holes */}
      <div className='absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-700 shadow-inner' />
      <div className='absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-700 shadow-inner' />
    </div>
  );
}

// Wooden Shelf Component
function WoodenShelf() {
  return (
    <div className='w-full'>
      {/* Shelf top surface */}
      <div
        className='h-4 rounded-t-sm'
        style={{
          background:
            "linear-gradient(180deg, #A0522D 0%, #8B4513 50%, #6B3E0A 100%)",
          boxShadow: "inset 0 2px 4px rgba(255,255,255,0.2)",
        }}
      />
      {/* Shelf front edge */}
      <div
        className='h-3'
        style={{
          background:
            "linear-gradient(180deg, #6B3E0A 0%, #5C3317 50%, #4A2511 100%)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
}

// TV data for the tower
const tvData = [
  { style: "beige", label: "Featured Collection" },
  { style: "cream", label: "New Arrivals" },
  { style: "gray", label: "Best Sellers" },
];

export default function TempBeforeReal() {
  return (
    <div
      className='bg-gray-50 text-gray-900 selection:bg-indigo-500 selection:text-white min-h-screen'
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <AdSenseScript />
      {/* Navigation */}
      <nav className='fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100'>
        <div className='px-6 sm:px-8 lg:px-12'>
          <div className='flex justify-between items-center h-24'>
            <div className='flex items-center'>
              <span
                className='font-bold text-4xl tracking-tight'
                style={{ width: 256 }}
              >
                Adorio
              </span>
            </div>
            <div className='flex items-center gap-6'>
              <a
                href='#'
                className='hidden md:block text-lg font-medium text-gray-600 hover:text-gray-900'
              >
                Sign in
              </a>
              <a
                href='#'
                className='px-6 py-3 bg-gray-900 text-white text-lg font-medium rounded-full hover:bg-gray-800 transition-colors'
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - TV Tower */}
      <main className='pt-32 pb-16'>
        <div className='max-w-5xl mx-auto px-6'>
          {/* TV Tower */}
          <div className='flex flex-col items-center'>
            {tvData.map((tv, index) => (
              <div key={index} className='w-full mb-2'>
                {/* TV + Sign Row */}
                <div className='flex items-center justify-center gap-8'>
                  {/* TV on shelf */}
                  <div className='flex-shrink-0 w-full max-w-2xl'>
                    <RetroTV style={tv.style} />
                    {/* Wooden Shelf under TV */}
                    <div className='relative -mt-1'>
                      <WoodenShelf />
                    </div>
                  </div>

                  {/* Wooden Sign */}
                  <div className='hidden md:block flex-shrink-0'>
                    <WoodenSign text={tv.label} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-white border-t border-gray-100 py-12 mt-12'>
        <div className='px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6'>
          <div className='flex items-center'>
            <span className='font-bold text-2xl text-gray-900'>Adorio</span>
          </div>
          <p className='text-gray-500 text-base'>
            © 2026 Adorio Design. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
