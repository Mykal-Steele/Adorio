# src/CLAUDE.md

Guidance for Claude Code when working in `src/` (Next.js 16 App Router frontend).

## Quick Start

```bash
npm run dev:full         # frontend :3001 + backend :3000
npm run dev              # frontend only on :3001
npm run typecheck        # tsc --noEmit
npm run lint             # ESLint
npm run format           # Prettier fix (covers src/**/*.{ts,tsx})
```

## Overview

Next.js 16 App Router with `output: 'standalone'`. The `src/app/` directory is **strictly routing only** — it imports and mounts views, nothing more. All page content lives in `src/views/`.

TypeScript throughout. `@/` is the path alias for `src/`. All relative imports within `src/views/` are relative; everything outside the view uses `@/`.

---

## Folder Structure

```
src/
├── app/                         — Next.js App Router (routing only)
│   ├── layout.tsx               — Root layout: metadata, Providers, ErrorBoundary, AuthBootstrapper
│   ├── Providers.tsx            — next-themes ThemeProvider + Redux Provider (must be in app/ to inject blocking script before hydration)
│   ├── AuthBootstrapper.tsx     — Runs useAuthBootstrap + usePageTracking on mount; wrapped in Suspense
│   ├── globals.css              — Tailwind base + CSS vars for portfolio IDE themes (midnight defaults for SSR)
│   ├── not-found.tsx            — 404 page
│   ├── robots.ts                — robots.txt generation
│   ├── sitemap.ts               — sitemap.xml generation
│   ├── api/
│   │   └── contact/route.ts     — Next.js Route Handler for contact form email (uses Resend)
│   ├── performance/route.ts     — Encrypted performance report endpoint
│   ├── algo/page.tsx            — Mounts views/Algo
│   ├── (public)/                — Route group: portfolio IDE (no navbar, PortfolioShell wraps children)
│   │   ├── layout.tsx           — Wraps children in PortfolioShell from views/Portfolio/IDELayout
│   │   ├── page.tsx             — / → mounts views/Portfolio/pages/Dashboard
│   │   ├── about/page.tsx       — /about → mounts views/Portfolio/pages/About
│   │   ├── contact/page.tsx     — /contact → mounts views/Portfolio/pages/Contact
│   │   └── projects/
│   │       ├── page.tsx         — /projects → mounts views/Portfolio/pages/Projects
│   │       └── [id]/page.tsx    — /projects/[id] → mounts views/Portfolio/pages/ProjectDetail
│   └── (with-navbar)/           — Route group: app pages (Navbar rendered in group layout)
│       ├── layout.tsx           — Renders <Navbar /> above {children}
│       ├── login/page.tsx       — /login → mounts views/Login
│       ├── register/page.tsx    — /register → mounts views/Register
│       ├── coding/page.tsx      — /coding → mounts views/Coding
│       ├── smartcity/page.tsx   — /smartcity → mounts views/SmartCity
│       ├── tempBeforeReal/page.tsx — temporary placeholder
│       ├── social/
│       │   ├── page.tsx         — /social → SSR shell with Suspense, streams PostsLoader → views/Home
│       │   ├── PostsLoader.tsx  — Async Server Component: SSR-fetches initial posts, passes to Home
│       │   └── loading.tsx      — Suspense fallback for /social
│       └── (protected)/         — Route group: auth-gated pages
│           ├── layout.tsx       — Client layout: checks isAuthLoading + token, redirects to /login if not authed
│           ├── profile/page.tsx — /profile → mounts views/Profile
│           ├── rygame/
│           │   ├── page.tsx     — /rygame → mounts RyGameClient
│           │   └── RyGameClient.tsx — dynamic({ssr:false}) wrapper for views/RyGame
│           ├── data-lookup/
│           │   ├── page.tsx     — /data-lookup → mounts DataLookupClient
│           │   └── DataLookupClient.tsx — dynamic({ssr:false}) wrapper for views/DataLookup
│           └── sendenv/page.tsx — /sendenv → mounts views/SendEnv
├── api/                         — Axios API layer (one instance shared across all API calls)
│   ├── index.ts                 — Axios instance, request interceptors (auth token, error handling), request() wrapper; re-exports from other api files
│   ├── analytics.ts             — trackPageView (sendBeacon + fetch fallback), fetchPageViewSummary, fetchRecentVisits, fetchVisitorStats, fetchVisitorDetails
│   ├── contact.ts               — sendContactMessage → POST /api/contact (Next.js Route Handler)
│   ├── gameApi.ts               — fetchLeaderboard, updateScore, fetchUserGameStats (with anonymous fallbacks)
│   ├── posts.ts                 — getPosts, createPost, likePost (100ms debounce), addComment, getSinglePost
│   └── users.ts                 — fetchUserData (re-export from index)
├── components/                  — Reusable components shared across multiple views
│   ├── AdSenseScript.tsx        — Google AdSense script injection
│   ├── ErrorBoundary.tsx        — React error boundary wrapper
│   ├── Navbar.tsx               — Top navigation bar (reads auth state from Redux, dispatches logout)
│   ├── NotFound.tsx             — 404 message component
│   ├── ui/                      — Generic UI primitives (shadcn-compatible structure)
│   │   ├── index.ts             — Barrel: exports Button, Spinner, SkeletonLoader
│   │   ├── Button.tsx           — Motion-enhanced button with gradient style
│   │   ├── Spinner.tsx          — Animated loading spinner (sm/md/lg sizes, optional label)
│   │   └── SkeletonLoader.tsx   — Animated post skeleton placeholder (count prop)
│   └── PostCard/                — Compound component for social posts
│       ├── index.tsx            — Root: orchestrates all sub-components, handles like + comment state
│       ├── constants.ts         — ADMIN_AVATAR_URL and other PostCard-scoped constants
│       ├── hooks/
│       │   └── useImageLoader.ts — Manages image load/error state for post images
│       └── components/
│           ├── AuthorHeader.tsx  — Avatar, username, timestamp, admin badge
│           ├── PostContent.tsx   — Title + body with expand/collapse
│           ├── PostImage.tsx     — Image with lazy load and click-to-expand
│           ├── ImageModal.tsx    — Full-screen image lightbox
│           ├── InteractionButtons.tsx — Like count + comment count buttons
│           └── CommentSection/
│               ├── index.tsx    — Scrollable comment list + form wrapper
│               ├── CommentForm.tsx — Text input + emoji picker
│               └── CommentItem.tsx — Single comment row
├── config/                      — App-level configuration constants
│   └── apiConfig.ts             — API_BASE_URL: /api in prod, http://localhost:3000/api in dev
├── hooks/                       — Shared React hooks (used across multiple views or globally)
│   ├── useAuthBootstrap.ts      — Reads token from localStorage, fetches user, dispatches to Redux; runs once on app mount
│   ├── useClickOutside.ts       — Fires callback when user clicks outside a ref element
│   ├── useInfiniteScroll.ts     — IntersectionObserver hook; returns lastPostRef callback
│   └── usePageTracking.ts       — Tracks route changes via pathname+searchParams; sends analytics on each navigation
├── lib/                         — Server-only utilities
│   └── serverFetch.ts           — Generic fetch for Server Components; uses BACKEND_INTERNAL_URL env var
├── schemas/                     — Zod validation schemas (frontend form validation)
│   └── contactSchema.ts         — Zod schema for the /contact form
├── store/                       — Redux Toolkit (auth state only)
│   ├── index.ts                 — Barrel: exports store, hooks, actions, UserState type
│   ├── store.ts                 — configureStore with userReducer; exports RootState + AppDispatch types
│   ├── hooks.ts                 — useAppDispatch, useAppSelector (typed wrappers)
│   └── userSlice.ts             — userSlice: setUser, setAuthLoaded, logout; UserState interface defined here
├── types/                       — TypeScript domain interfaces
│   ├── index.ts                 — User, Post, PostImage, Comment interfaces
│   └── declarations.d.ts        — Module declarations (*.css)
├── utils/                       — Shared utilities (used across multiple views or layers)
│   ├── authFlow.ts              — getRedirectPaths, applyAuthSession (dispatch + localStorage), getAuthErrorMessage
│   ├── browserFingerprinting.ts — generateBrowserFingerprint, generateVisitorId (localStorage/sessionStorage/IndexedDB persistence)
│   ├── errorHandling.ts         — ApiClientError, AbortError, isAbortError, handleApiError
│   ├── frontendMonitoring.ts    — FrontendMonitor singleton, withPerformanceTracking wrapper
│   └── timeFormatting.ts        — formatDuration (ms → "1h 30m 45s"), formatCompactNumber (1500 → "1.5K")
└── views/                       — Page content (the actual UI for each route)
    ├── Home/index.tsx           — Social feed: post list with SSR hydration, infinite scroll, post creation form
    ├── Login/index.tsx          — Login form with redirect support
    ├── Register/index.tsx       — Registration form with redirect support
    ├── Profile/index.tsx        — User's own post feed, filtered client-side
    ├── DataLookup/index.tsx     — Admin analytics dashboard (Recharts, react-query)
    ├── RyGame/index.tsx         — Rhythm game (canvas-based, ssr:false required)
    ├── SendEnv/index.tsx        — Encrypted secret message store form
    ├── SmartCity/index.tsx      — SmartCity API demo with embedded HTML guides
    ├── tempBeforeReal/
    │   ├── index.tsx            — Temporary placeholder view
    │   └── RetroTV.tsx          — RetroTV animation component
    ├── Coding/                  — In-browser JS coding challenge environment
    │   ├── index.tsx            — Main layout: problem list + editor + terminal
    │   ├── CodeRunner.ts        — Main-thread code execution (class-based, no Worker)
    │   ├── problems.ts          — All coding problem definitions
    │   ├── types.ts             — Coding-specific types (TestCase, Problem, etc.)
    │   ├── components/
    │   │   ├── CodeEditor.tsx   — CodeMirror editor wrapper
    │   │   ├── ProblemDetails.tsx — Problem description panel
    │   │   ├── ProblemList.tsx  — Sidebar problem list
    │   │   ├── ResizableTerminal.tsx — Drag-resizable output terminal
    │   │   ├── ResultsPanel.tsx — Test results summary
    │   │   └── TestResults.tsx  — Per-test result rows
    │   └── utils/
    │       ├── codeRunnerWorker.ts — Web Worker implementation for isolated code execution
    │       └── problemStorage.ts   — localStorage persistence for user code per problem
    └── Portfolio/               — VSCode-style IDE portfolio (public-facing, no auth)
        ├── IDELayout.tsx        — PortfolioShell, IDELayout, Desktop/Tablet/MobileShell
        ├── ActivityBar.tsx      — 48px left icon column (Explorer/Profile/Git/Skills/Settings)
        ├── SidePanel.tsx        — 220px left panel with 4 sub-panels
        ├── SettingsPanel.tsx    — Settings sub-panel
        ├── TabBar.tsx           — Tab row with main + dynamic project tabs
        ├── TitleBar.tsx         — 44px top bar with logo + ThemeSwitcher
        ├── RightPanel.tsx       — 280px right panel (metrics + Ask Oo chat)
        ├── StatusBar.tsx        — 24px bottom status bar
        ├── Terminal.tsx         — Boot terminal with interactive commands
        ├── context/
        │   ├── IDEContext.tsx   — activeSidePanel, terminalOpen, openProjectTabs
        │   └── ThemeContext.tsx — 5 themes (midnight/nord/dracula/one-dark/catppuccin), CSS vars on documentElement
        ├── data/portfolio.ts    — All portfolio content (projects, commits, PRs, skills, AI responses)
        ├── constants/
        │   ├── fonts.ts         — Font family strings
        │   └── status.ts        — statusConfig + codeColors for syntax highlighting
        ├── hooks/
        │   ├── useProjectNavigation.ts — navigate between project tabs
        │   └── useResponsive.ts — SSR-safe breakpoint (initializes 'desktop', reads window in useEffect)
        ├── shared/              — IDE-specific shared primitives
        │   ├── index.ts         — Barrel export
        │   ├── Badge.tsx        — Tag/label badge
        │   ├── Breadcrumb.tsx   — File path breadcrumb
        │   ├── IDECard.tsx      — Card component with IDE styling
        │   ├── LineNumbers.tsx  — Gutter line number display
        │   ├── PageHeader.tsx   — Section header
        │   ├── SectionLabel.tsx — Sub-section label
        │   └── ThemeSwitcher.tsx — Theme selector dropdown
        ├── mobile/
        │   ├── MobileDrawer.tsx — Slide-in drawer for mobile nav
        │   ├── MobileHeader.tsx — Mobile top bar
        │   └── MobileNav.tsx    — Mobile navigation links
        └── pages/               — Portfolio route content (mounted by app/(public)/ pages)
            ├── Dashboard.tsx    — / : commit stream, PR list, project gallery
            ├── About.tsx        — /about: bio, stack, timeline, community
            ├── Projects.tsx     — /projects: project grid + stats
            ├── ProjectDetail.tsx — /projects/[id]: detailed project view
            └── Contact.tsx      — /contact: channels + message form (uses contactSchema)
```

---

## Architecture

```
app/         → routing only — imports views, exports metadata, handles SSR
views/       → page content — all JSX that makes up a page lives here
components/  → reusable across 2+ views — PostCard, Navbar, UI primitives
hooks/       → shared hooks — used by multiple views or globally (auth, tracking)
api/         → HTTP layer — one axios instance, one file per domain
store/       → Redux — auth state only (user, token, isAuthLoading)
schemas/     → Zod schemas — form validation only
types/       → TypeScript interfaces — domain models (User, Post, Comment)
utils/       → pure functions — no React, no hooks, no side effects at import time
lib/         → server-only — runs in Node.js context (Server Components, Route Handlers)
config/      → constants derived from env vars — API_BASE_URL etc.
```

**Rules:**
- `app/` pages contain at most: `export const metadata`, `export default function Page()` which returns `<ViewComponent />` (plus Suspense/loading wrappers for streaming routes)
- Views are self-contained — internal components/hooks/utils that are only used in one view live inside that view's folder, not in global `src/`
- `components/ui/` are dumb primitives: no API calls, no hooks, no business logic — just props → JSX
- `api/` always uses the single axios instance from `api/index.ts`. No separate Axios instances per file.
- `store/` has one slice (user). Redux is justified because `isAuthLoading` + `token` + `user` are read in Navbar, protected layout, multiple views, and analytics hooks simultaneously. If auth state only lived in one place, Context would be enough — but it doesn't.
- `schemas/` holds Zod only. TypeScript interfaces in `types/`. Do not mix them.
- `utils/` functions must be pure and have no React imports. If it needs React, it's a hook.

---

## Auth Flow

1. `layout.tsx` renders `<AuthBootstrapper />` wrapped in `<Suspense>` — renders null, triggers hooks
2. `useAuthBootstrap` checks localStorage for token, calls `GET /api/users/me`, dispatches `setUser` or `setAuthLoaded`
3. Redux store: `isAuthLoading = true` until bootstrap resolves
4. Protected routes: `(protected)/layout.tsx` waits for `!isAuthLoading`, then checks `token`. Redirects to `/login?redirect=<pathname>` if missing.
5. `useAuthBootstrap` and `usePageTracking` both run inside `AuthBootstrapper` — that's why `AuthBootstrapper` is a named component and not inline in layout.

**Auth utilities** (`utils/authFlow.ts`):
- `applyAuthSession(dispatch, response)` — validates response shape, stores token in localStorage, dispatches `setUser`
- `getRedirectPaths(searchParams)` — extracts redirect param, defaults to `/social`
- `getAuthErrorMessage(error, fallback)` — converts API error to user-facing string

---

## State Management

Redux Toolkit with a single `user` slice. Use `useAppSelector` and `useAppDispatch` from `@/store/hooks` — never the raw `useSelector`/`useDispatch`.

```ts
// Correct
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/userSlice';

// Wrong
import { useSelector } from 'react-redux';
import { logout } from '@/redux/userSlice';   // redux/ no longer exists
```

Everything else is local component state or URL state — no additional slices, no Zustand, no Context for data.

---

## API Layer

One axios instance in `api/index.ts`. All other API files import it.

```ts
import API, { request } from './index';

export const getMyThing = (id: string) => request(API.get(`/things/${id}`));
```

- `request()` unwraps `response.data`
- The response interceptor calls `handleApiError` — throws `ApiClientError` with `statusCode`
- The request interceptor adds `Authorization: Bearer <token>` from localStorage
- `likePost` in `posts.ts` uses a 100ms debounce — only the final intended state is sent to the server

---

## Rendering Rules

- `dynamic({ssr:false})` **only** for: CodeMirror (DOM crash on SSR), RyGame canvas, Recharts in DataLookup
- Everything else uses `'use client'` which SSRs to HTML fine
- `/social` uses React Suspense streaming: `PostsLoader` is an async Server Component that SSR-fetches page 1, `Home` hydrates with those posts and continues client-side infinite scroll
- Portfolio IDE uses CSS vars on `document.documentElement` for theming — inline `style={{}}` with CSS vars in Portfolio components is intentional, **not** a Tailwind violation

---

## Style Rules

- Tailwind for all styling
- Raw CSS only for: `@font-face`, CSS custom property declarations, `@keyframes`, `::webkit-scrollbar`, vendor-prefixed properties
- Portfolio IDE components use `style={{ color: 'var(--ide-fg)' }}` — intentional runtime theming
- No separate CSS modules (`.module.css`) unless there's no Tailwind alternative

---

## Patterns to Avoid

- Putting page content in `app/` pages directly — views belong in `src/views/`
- Importing from `@/redux/*` — the folder was renamed to `@/store/`
- Importing SkeletonLoader from `@/components/SkeletonLoader` — it moved to `@/components/ui/SkeletonLoader`
- Adding a second Redux slice for things that are local state — one slice for auth, that's it
- Creating a new Axios instance per API file — import from `@/api/index`
- Defining domain types in schemas/ or Redux state shape in types/ — keep them separate
- Using raw `useSelector` / `useDispatch` — always use the typed wrappers from `@/store/hooks`
- Putting view-only components/hooks/utils in global `src/components`, `src/hooks`, `src/utils` — if it's only used in one view, it lives inside that view's folder

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` + `react` | Framework |
| `@reduxjs/toolkit` + `react-redux` | Global auth state |
| `axios` | HTTP client (one instance in `api/index.ts`) |
| `framer-motion` | Animations (`transpilePackages` in next.config.ts required) |
| `zod` | Form validation |
| `next-themes` | Theme switching without flash (injects blocking script) |
| `@heroicons/react` | Icon set |
| `lucide-react` | Additional icons |
| `@tanstack/react-query` | Server state in DataLookup view |
| `@uiw/react-codemirror` + `@codemirror/*` | Code editor (Coding view, `ssr:false`) |
| `recharts` | Charts in DataLookup (`ssr:false`) |
| `@emoji-mart/react` | Emoji picker in PostCard |
| `lodash` | debounce in Home view and like batching |
| `moment` | Date formatting in Portfolio and game views |
| `socket.io-client` | Real-time in SmartCity/tempBeforeReal |
| `dompurify` | HTML sanitization |

---

## Environment Variables

| Variable | Used in |
|----------|---------|
| `NEXT_PUBLIC_CLOUDINARY_NAME` | Image upload from client |
| `BACKEND_INTERNAL_URL` | `lib/serverFetch.ts` for SSR (defaults to `http://localhost:3000`) |
| `NODE_ENV` | Dev/prod conditional logging |
| Resend key | `app/api/contact/route.ts` — server-only, never exposed to client |
