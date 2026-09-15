// Torn-paper transition from the cream Navbar into a paper-themed page below it.
// Sticky at the same offset as the Navbar's own height so it scrolls as one
// unit with it instead of sliding away underneath. The wrapper's solid cream
// background backs the SVG's jagged "valleys" — those are fully transparent by
// design (that's what makes the tear read as a tear), so without a matching
// backdrop they'd reveal whatever page content happens to be scrolled behind
// them instead of a clean cut.
const PaperTornEdge = () => (
  <div className="sticky top-14 z-40 h-[23.4px] w-full bg-[var(--paper-cream)] sm:top-16 sm:h-9">
    <svg
      viewBox="0 0 1200 36"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="block h-full w-full"
    >
      <path
        fill="var(--paper-cream)"
        d="M0,0 H1200 V14 L1186,20 L1177,12 L1160,24 L1149,16 L1137,27 L1128,15 L1112,21 L1098,11 L1086,25 L1071,17 L1063,29 L1049,19 L1034,13 L1020,23 L1008,16 L994,26 L979,14 L968,21 L954,11 L939,24 L927,18 L913,28 L899,15 L884,22 L872,12 L857,25 L843,17 L828,30 L816,20 L801,13 L788,23 L774,16 L760,27 L745,14 L733,21 L718,11 L704,24 L690,18 L677,29 L662,20 L648,13 L634,23 L620,15 L606,26 L591,19 L578,12 L563,22 L549,16 L535,28 L520,21 L507,14 L493,24 L478,17 L464,30 L450,20 L436,12 L421,23 L408,16 L394,26 L379,19 L366,13 L352,22 L337,15 L323,27 L309,21 L295,14 L280,24 L266,17 L252,29 L238,20 L224,12 L209,23 L196,16 L182,25 L167,19 L154,13 L140,22 L126,15 L112,26 L98,20 L84,14 L69,24 L55,17 L41,28 L27,21 L13,15 L0,22 Z"
      />
    </svg>
  </div>
);

export default PaperTornEdge;
