import { useEffect, useRef } from "react";

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

export default useInfiniteCarousel;
