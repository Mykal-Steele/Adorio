import { useEffect, useRef } from "react";
import { clamp } from "lodash-es";

const WHEEL_DECAY = 0.92;
const MIN_MOMENTUM = 0.5;
const MAX_WHEEL_VELOCITY = 50;
const MAX_BUTTON_VELOCITY = 60;

const useInfiniteCarousel = (trackRef, speed = 0.5, pauseOnHover = true) => {
  const animationRef = useRef(null);
  const isHoveringRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isDocumentVisibleRef = useRef(true);
  const directionRef = useRef(1);
  const hasInitializedDirectionRef = useRef(false);
  const wheelVelocityRef = useRef(0);
  const wheelAnimationRef = useRef(null);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const lastDragXRef = useRef(0);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!hasInitializedDirectionRef.current) {
      directionRef.current = Math.random() < 0.5 ? -1 : 1;
      hasInitializedDirectionRef.current = true;
    }

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

    track.scrollLeft = singleSetWidth;

    const syncLoopBounds = () => {
      if (track.scrollLeft <= 0) {
        track.scrollLeft = singleSetWidth;
      } else if (track.scrollLeft >= singleSetWidth * 2) {
        track.scrollLeft = singleSetWidth;
      }
    };

    const autoScroll = () => {
      if (
        isDocumentVisibleRef.current &&
        !(pauseOnHover && isHoveringRef.current) &&
        !isDraggingRef.current
      ) {
        track.scrollLeft += speed * directionRef.current;
      }
      animationRef.current = requestAnimationFrame(autoScroll);
    };

    const handleVisibilityChange = () => {
      isDocumentVisibleRef.current = document.visibilityState === "visible";
    };

    const startWheelMomentum = () => {
      if (!wheelAnimationRef.current) {
        wheelAnimationRef.current = requestAnimationFrame(runWheelMomentum);
      }
    };

    const runWheelMomentum = () => {
      if (Math.abs(wheelVelocityRef.current) > MIN_MOMENTUM) {
        track.scrollLeft += wheelVelocityRef.current;
        wheelVelocityRef.current *= WHEEL_DECAY;
        wheelAnimationRef.current = requestAnimationFrame(runWheelMomentum);
      } else {
        wheelVelocityRef.current = 0;
        wheelAnimationRef.current = null;
      }
    };

    controlsRef.current = (dir) => {
      directionRef.current = -dir;
      wheelVelocityRef.current = clamp(
        wheelVelocityRef.current + directionRef.current * 25,
        -MAX_BUTTON_VELOCITY,
        MAX_BUTTON_VELOCITY,
      );
      startWheelMomentum();
    };

    const handleScroll = () => syncLoopBounds();
    const handleMouseEnter = () => {
      isHoveringRef.current = true;
    };
    const handleMouseLeave = () => {
      isHoveringRef.current = false;
      isDraggingRef.current = false;
    };
    const handleWheel = (e) => {
      e.preventDefault();
      wheelVelocityRef.current = clamp(
        wheelVelocityRef.current + e.deltaY * 0.05,
        -MAX_WHEEL_VELOCITY,
        MAX_WHEEL_VELOCITY,
      );
      if (Math.abs(e.deltaY) > 2) {
        directionRef.current = e.deltaY > 0 ? 1 : -1;
      }
      startWheelMomentum();
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

    const listeners = [
      ["scroll", handleScroll],
      ["mouseenter", handleMouseEnter],
      ["mouseleave", handleMouseLeave],
      ["wheel", handleWheel, { passive: false }],
      ["mousedown", handleMouseDown],
      ["mouseup", handleMouseUp],
      ["mousemove", handleMouseMove],
    ];

    listeners.forEach(([eventName, handler, options]) => {
      track.addEventListener(eventName, handler, options);
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const cancelAnimation = (ref) => {
      if (ref.current) {
        cancelAnimationFrame(ref.current);
        ref.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(autoScroll);

    return () => {
      controlsRef.current = null;
      cancelAnimation(animationRef);
      cancelAnimation(wheelAnimationRef);

      listeners.forEach(([eventName, handler]) => {
        track.removeEventListener(eventName, handler);
      });

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [trackRef, speed, pauseOnHover]);

  return {
    setDirection: (dir) => controlsRef.current?.(dir),
  };
};

export default useInfiniteCarousel;
