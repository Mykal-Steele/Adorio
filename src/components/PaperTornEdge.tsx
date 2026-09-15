// Torn-paper strip below the sticky Navbar. Stays sticky at the same offset as
// the Navbar's own height so it scrolls as one unit with it instead of sliding
// away underneath.
//
// The background is intentionally transparent, not a flat fill: the jagged
// valleys cut into the bottom edge are meant to reveal whatever real content
// (a feed card, scrolled up from below) is actually sitting behind them. A
// solid backdrop color there makes the tear look like it's painted on top of
// a rectangle instead of genuinely overlapping the page underneath it.
//
// Post cards share the exact cream fill color the tear uses, so a flat fill
// would vanish completely whenever a card scrolls up underneath it. Each path
// fills from a gradient instead: solid normal cream from the top down through
// the middle of the spikes (so it still reads as one seamless color with the
// Navbar above it), fading to a slightly darker cream only over the bottom
// half of each spike, darkest right at the tip. That gives the tips enough
// of their own identity to stay visible over a same-colored card without
// looking like a distinct shadow or rectangle sitting on top of the page.
//
// Mobile renders a sparser zigzag than desktop — the strip is shorter there,
// and the dense desktop pattern reads as noise at that height.
const PaperTornEdge = () => (
  <div className="sticky top-14 z-40 h-4 w-full bg-transparent sm:top-16 sm:h-6">
    <svg
      viewBox="0 0 1200 36"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="block h-full w-full sm:hidden"
    >
      <defs>
        <linearGradient
          id="tornTipGradientMobile"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="14"
          x2="0"
          y2="27"
        >
          <stop offset="0%" stopColor="var(--paper-cream)" />
          <stop offset="100%" stopColor="var(--paper-hero)" />
        </linearGradient>
      </defs>
      <path
        fill="url(#tornTipGradientMobile)"
        d="M0,0 H1200 V14 L1080,26 L960,13 L840,27 L720,14 L600,25 L480,12 L360,26 L240,14 L120,24 L0,16 Z"
      />
    </svg>
    <svg
      viewBox="0 0 1200 36"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="hidden h-full w-full sm:block"
    >
      <defs>
        <linearGradient
          id="tornTipGradientDesktop"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="14"
          x2="0"
          y2="30"
        >
          <stop offset="0%" stopColor="var(--paper-cream)" />
          <stop offset="100%" stopColor="var(--paper-hero)" />
        </linearGradient>
      </defs>
      <path
        fill="url(#tornTipGradientDesktop)"
        d="M0,0 H1200 V14 L1186,20 L1177,12 L1160,24 L1149,16 L1137,27 L1128,15 L1112,21 L1098,11 L1086,25 L1071,17 L1063,29 L1049,19 L1034,13 L1020,23 L1008,16 L994,26 L979,14 L968,21 L954,11 L939,24 L927,18 L913,28 L899,15 L884,22 L872,12 L857,25 L843,17 L828,30 L816,20 L801,13 L788,23 L774,16 L760,27 L745,14 L733,21 L718,11 L704,24 L690,18 L677,29 L662,20 L648,13 L634,23 L620,15 L606,26 L591,19 L578,12 L563,22 L549,16 L535,28 L520,21 L507,14 L493,24 L478,17 L464,30 L450,20 L436,12 L421,23 L408,16 L394,26 L379,19 L366,13 L352,22 L337,15 L323,27 L309,21 L295,14 L280,24 L266,17 L252,29 L238,20 L224,12 L209,23 L196,16 L182,25 L167,19 L154,13 L140,22 L126,15 L112,26 L98,20 L84,14 L69,24 L55,17 L41,28 L27,21 L13,15 L0,22 Z"
      />
    </svg>
  </div>
);

export default PaperTornEdge;
