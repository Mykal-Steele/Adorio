/**
 * Infinite Carousel Utility
 * Creates a smooth, infinite scrolling carousel with mouse/drag/button controls
 */

/**
 * Initialize an infinite carousel
 * @param {Object} config - Configuration object
 * @param {string} config.trackId - ID of the scrollable track container
 * @param {string} config.carouselId - ID of the carousel content container
 * @param {string} config.prevBtnId - ID of the previous button (optional)
 * @param {string} config.nextBtnId - ID of the next button (optional)
 * @param {number} config.autoScrollSpeed - Initial auto-scroll speed (default: 1)
 * @param {number} config.gap - Gap between cards in pixels (default: 32)
 * @param {boolean} config.pauseOnHover - Whether to pause auto-scroll on hover (default: true)
 * @returns {Object} - Carousel controller with methods to control the carousel
 */
function initCarousel(config) {
  const {
    trackId,
    carouselId,
    prevBtnId,
    nextBtnId,
    autoScrollSpeed: initialSpeed = 1,
    gap = 32,
    pauseOnHover = true,
  } = config;

  const track = document.getElementById(trackId);
  const carousel = document.getElementById(carouselId);

  if (!track || !carousel) {
    console.error("Carousel: Could not find track or carousel elements");
    return null;
  }

  // keep the og cards
  const originalCards = carousel.innerHTML;

  carousel.innerHTML = originalCards + originalCards + originalCards;

  //  redo the icons after cloning
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  const firstCard = carousel.querySelector(".carousel-card");
  if (!firstCard) {
    console.error('Carousel: No cards found with class "carousel-card"');
    return null;
  }

  const cardWidth = firstCard.offsetWidth;
  const totalCards = carousel.querySelectorAll(".carousel-card").length;
  const originalCardCount = totalCards / 3;
  const singleSetWidth = originalCardCount * (cardWidth + gap);

  // start in the middle so we can scroll both ways
  track.scrollLeft = singleSetWidth;

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

  // the main scroll loop
  function autoScroll() {
    if (!(pauseOnHover && isHovering) && !isDragging) {
      track.scrollLeft += autoScrollSpeed * autoScrollDirection;
    }
    animationId = requestAnimationFrame(autoScroll);
  }

  autoScroll();

  track.addEventListener("mouseenter", () => {
    isHovering = true;
    track.style.cursor = "grab";
  });

  track.addEventListener("mouseleave", () => {
    isHovering = false;
    isDragging = false;
    track.style.cursor = "default";
    // keep going the way user was scrolling
    autoScrollDirection = lastManualDirection;
  });

  function smoothWheelScroll() {
    if (Math.abs(wheelVelocity) > 0.5) {
      track.scrollLeft += wheelVelocity;
      wheelVelocity *= 0.92; // slow down gradually
      wheelAnimationId = requestAnimationFrame(smoothWheelScroll);
    } else {
      wheelVelocity = 0;
      wheelAnimationId = null;
    }
  }

  track.addEventListener(
    "wheel",
    (e) => {
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
    },
    { passive: false }
  );

  track.addEventListener("mousedown", (e) => {
    isDragging = true;
    track.style.cursor = "grabbing";
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    lastDragX = e.pageX;
  });

  track.addEventListener("mouseup", () => {
    isDragging = false;
    if (isHovering) track.style.cursor = "grab";
  });

  track.addEventListener("mousemove", (e) => {
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
  });

  // prev/next buttons
  if (prevBtnId) {
    const prevBtn = document.getElementById(prevBtnId);
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        autoScrollDirection = 1;
        lastManualDirection = 1;
        autoScrollSpeed = Math.min(3, autoScrollSpeed + 0.5);
      });
    }
  }

  if (nextBtnId) {
    const nextBtn = document.getElementById(nextBtnId);
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        autoScrollDirection = -1;
        lastManualDirection = -1;
        autoScrollSpeed = Math.min(3, autoScrollSpeed + 0.5);
      });
    }
  }

  // return some functions to control it from outside
  return {
    setDirection: (dir) => {
      autoScrollDirection = dir;
      lastManualDirection = dir;
    },
    setSpeed: (speed) => {
      autoScrollSpeed = speed;
    },
    getSpeed: () => autoScrollSpeed,
    getDirection: () => autoScrollDirection,
    pause: () => {
      isHovering = true;
    },
    resume: () => {
      isHovering = false;
    },
    destroy: () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (wheelAnimationId) cancelAnimationFrame(wheelAnimationId);
    },
  };
}

/**
 * Generate card HTML from data
 * @param {Array} cards - Array of card data objects
 * @param {Object} card - Card object with properties:
 *   - image: string (image URL)
 *   - title: string
 *   - subtitle: string
 *   - rating: number
 *   - price: string
 *   - badge: string (optional, e.g., "New", "Best Seller")
 *   - badgeColor: string (optional, tailwind bg class, default "bg-white/90")
 * @returns {string} - HTML string for all cards
 */
function generateCarouselCards(cards) {
  return cards
    .map((card, index) => {
      const badgeHtml = card.badge
        ? `
      <div class="absolute top-4 right-4 ${
        card.badgeColor || "bg-white/90 backdrop-blur-sm"
      } px-4 py-2 rounded-full text-sm font-semibold ${
            card.badgeColor ? "text-white" : "text-gray-900"
          }">
        ${card.badge}
      </div>
    `
        : "";

      return `
      <div class="carousel-card shrink-0 w-[400px] md:w-[500px] group">
        <div class="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-indigo-500/10">
          <div class="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
            <img
              src="${card.image}"
              alt="${card.title}"
              class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            />
            ${badgeHtml}
          </div>
          <div class="p-6">
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="text-xl font-bold text-gray-900">${card.title}</h3>
                <p class="text-gray-500 text-base">${card.subtitle}</p>
              </div>
              <div class="flex items-center gap-1 text-amber-500">
                <i data-lucide="star" class="w-5 h-5 fill-current"></i>
                <span class="text-base font-medium text-gray-700">${card.rating}</span>
              </div>
            </div>
            <div class="mt-5 flex items-center justify-between">
              <span class="text-2xl font-bold text-gray-900">${card.price}</span>
              <button class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 hover:bg-indigo-600 hover:text-white transition-colors">
                <i data-lucide="arrow-up-right" class="w-6 h-6"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

/**
 * Create a complete carousel component
 * @param {string} containerId - ID of the container element to render carousel into
 * @param {Array} cards - Array of card data objects
 * @param {Object} options - Additional options
 * @param {boolean} options.showControls - Whether to show prev/next buttons (default: true)
 * @param {boolean} options.showGradients - Whether to show side gradients (default: true)
 * @returns {Object} - Carousel controller
 */
function createCarousel(containerId, cards, options = {}) {
  const { showControls = true, showGradients = true } = options;
  const container = document.getElementById(containerId);

  if (!container) {
    console.error("Carousel: Container not found");
    return null;
  }

  // random ids so we can have multiple carousels
  const uniqueId = "carousel_" + Math.random().toString(36).substr(2, 9);
  const trackId = uniqueId + "_track";
  const carouselId = uniqueId + "_content";
  const prevBtnId = uniqueId + "_prev";
  const nextBtnId = uniqueId + "_next";

  // build all the html
  const controlsHtml = showControls
    ? `
    <div class="px-6 sm:px-8 lg:px-12 mb-6 flex justify-end">
      <div class="flex gap-3">
        <button
          id="${prevBtnId}"
          class="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95"
        >
          <i data-lucide="arrow-left" class="w-6 h-6"></i>
        </button>
        <button
          id="${nextBtnId}"
          class="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-900/20"
        >
          <i data-lucide="arrow-right" class="w-6 h-6"></i>
        </button>
      </div>
    </div>
  `
    : "";

  const gradientsHtml = showGradients
    ? `
    <div class="carousel-gradient-left hidden md:block"></div>
    <div class="carousel-gradient-right hidden md:block"></div>
  `
    : "";

  const cardsHtml = generateCarouselCards(cards);

  container.innerHTML = `
    ${controlsHtml}
    <div class="relative w-full py-4">
      ${gradientsHtml}
      <div id="${trackId}" class="overflow-x-auto scrollbar-hide" style="scroll-behavior: auto">
        <div id="${carouselId}" class="flex gap-8 py-8 items-center pl-4" style="width: max-content">
          ${cardsHtml}
        </div>
      </div>
    </div>
  `;

  // icons need to be initialized after adding html
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // hook it up
  return initCarousel({
    trackId,
    carouselId,
    prevBtnId: showControls ? prevBtnId : null,
    nextBtnId: showControls ? nextBtnId : null,
  });
}

// for if someone uses this with node or whatever
if (typeof module !== "undefined" && module.exports) {
  module.exports = { initCarousel, generateCarouselCards, createCarousel };
}
