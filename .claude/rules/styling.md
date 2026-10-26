---
description: Styling rules — Tailwind, CSS, and Portfolio IDE theme system
---

# Styling Rules

## Tailwind First

- Use Tailwind utility classes for all styling — no inline `style={{}}` except in the Portfolio IDE (see below)
- No raw CSS except for: `@font-face`, CSS custom properties, `@keyframes`, vendor-prefixed properties, `::-webkit-scrollbar`
- Don't create new CSS files for component-level styles — co-locate classes with the component using Tailwind

## Portfolio IDE — Exception

The Portfolio IDE (`src/views/Portfolio/`) uses inline `style={{ }}` with CSS variables intentionally — this is how runtime theme switching works. Don't convert these to Tailwind classes.

```tsx
// bad — breaks runtime theme switching
<div className="bg-[#1e2030] text-[#cad3f5]">

// good — reads from CSS vars set by ThemeProvider at runtime
<div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
```

## Class Ordering

Follow the Tailwind recommended order (enforced by Prettier plugin if configured):
1. Layout (display, position, z-index)
2. Box model (width, height, margin, padding)
3. Typography (font, text)
4. Visual (background, border, shadow, opacity)
5. Interactive (cursor, transition, hover/focus variants)

## Responsive Design

- Mobile-first: base classes are mobile, add `sm:`, `md:`, `lg:`, `xl:` for larger screens
- The Portfolio IDE lays out with CSS only, so the server renders the right layout on every screen. Use `md:`/`lg:` classes for screen size and container queries (`@[880px]:`, `@[640px]:`) for the width of the editor area (`<main>` has `@container`). Don't pick layouts in JavaScript (no `isMobile ? ... : ...` styles): they render the desktop layout first and jump after hydration

## Dark Mode

- The app doesn't use Tailwind's `dark:` variant — the social feed uses a fixed dark design
- The Portfolio IDE has its own 5-theme system via CSS vars; don't mix `dark:` classes into portfolio components

## Animations

- Use Framer Motion for non-trivial animations — the package is already in the bundle (`transpilePackages: ['framer-motion']`)
- Use Tailwind transition utilities (`transition`, `duration-200`, `ease-in-out`) for simple hover/focus effects
- Define custom `@keyframes` in `globals.css` only if Framer Motion and Tailwind can't cover the use case

## Custom Fonts

Four fonts are used. Portfolio components take them from `src/views/Portfolio/constants/fonts.ts`:
- Playfair Display: headings (`serif`)
- Karla: body and UI text (`sans`)
- Courier Prime: the main button and the terminal (`mono`)
- Patrick Hand: only the handwritten theme hint (`hand`)

Fonts are files in `src/app/fonts/` loaded with `next/font/local` in `src/app/fonts.ts`. Add a new one there (latin woff2, see `src/app/fonts/README.md`), not with `next/font/google` or a `<link>` tag: those download from Google at build time, and a failed download fails the build.

## Component Class Extraction

Don't create a `.btn-primary` CSS class for a pattern used twice — just repeat the Tailwind classes. Extract only when the same combination appears 5+ times across different components, and then prefer a shared React component over a CSS class.
