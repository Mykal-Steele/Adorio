# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Quick Start

```bash
npm run setup
npm run dev:full     # frontend :3001 + backend :3000 — use this for all local dev
```

`npm run setup` installs root app, backend, and AI sidecar dependencies. Root `npm install` alone is not enough for full local dev.

If chunks fail to load after many file changes, clear the Turbopack cache:

```bash
rm -rf .next && npm run dev
```

After switching between Windows ↔ Linux:

```bash
node scripts/sync-platform-deps.cjs
```

## Project Overview

Adorio is a social media platform deployed at **adorio.space**. JavaScript monorepo:

| Directory     | Purpose                                   | Port |
| ------------- | ----------------------------------------- | ---- |
| `src/`        | Next.js 16 App Router frontend            | 3001 |
| `backend/`    | Node.js/Express API (ES Modules)          | 3000 |
| `ai-slop/`    | AI exam-prep sidecar (React + Gemini API) | —    |
| `backend-go/` | Experimental Go backend (not deployed)    | —    |

## Commands

```bash
# ── Daily development ─────────────────────────────────────────
npm run setup            # install all local packages once
npm run dev:full         # start frontend + backend together
npm run dev              # frontend only
npm run dev:backend      # backend only
npm run dev:ai-slop      # ai-slop only

# ── Code quality ──────────────────────────────────────────────
npm run lint             # ESLint
npm run format           # Prettier fix
npm run format:check     # Prettier check (used in CI)

# ── Production ────────────────────────────────────────────────
npm run build            # Next.js standalone build → .next/standalone/
npm run start            # serve the standalone build locally

# ── Docker ────────────────────────────────────────────────────
docker compose up --build                              # dev at :8080
docker compose -f docker-compose.prod.yml up --build  # prod at :8080

# ── Testing (requires Docker) ─────────────────────────────────
npm run test:dev         # integration tests against dev containers
npm run test:prod        # integration tests against prod containers
```

## Architecture

### Request Flow (Production)

```
Browser → Cloudflare CDN → Northflank (adorio.space, port 8080)
  └─ Nginx (port 80)
       ├─ /api/*          → localhost:3000 (Express backend)
       ├─ /cao/*          → static files /usr/share/nginx/html/cao/ (ai-slop)
       ├─ /_next/static/* → localhost:3001 (Next.js, 1yr cache)
       └─ /*              → localhost:3001 (Next.js SSR, proxy_buffering off)
```

The backend, Next.js standalone server, and Nginx all run in the same Docker container. `nginx.production.conf` / `nginx.development.conf` are selected at image build time via `$ENV` build arg.

### Hosting

- **Platform**: Northflank (combined service `adorio`, US-Central)
- **Compute**: 0.1 vCPU / 256 MB RAM (runtime); 4 vCPU / 16 GB RAM (builds)
- **Domain**: `adorio.space` → Northflank port 8080
- **CDN/Proxy**: Cloudflare sits in front of Northflank
- **Internal service URL**: `p01--adorio--lfyvvjybkxr8.code.run`
- **Database**: MongoDB Atlas (connection via `MONGO_URI`)
- **Images**: Cloudinary

### Frontend Architecture (`src/`)

- **Framework**: Next.js 16 App Router (`output: 'standalone'`, `transpilePackages: ['framer-motion']`)
- **Routing**: File-based App Router in `src/app/`. Route groups: `(public)` (no navbar), `(with-navbar)` (has navbar), `(with-navbar)/(protected)` (auth-gated).
- **State**: Redux Toolkit — only auth state (`userSlice` with `isAuthLoading`). Everything else is local component state.
- **Auth**: JWT in `localStorage`. `AuthBootstrapper.tsx` (wrapped in `<Suspense>` in root layout) runs `useAuthBootstrap` + `usePageTracking` on mount. Protected routes use `(protected)/layout.tsx` which reads Redux and redirects to `/login?redirect=<pathname>` if unauthenticated.
- **API layer**: `src/api/` — thin Axios wrappers. All requests use relative `/api` base URL. Next.js rewrites `/api/*` → `http://localhost:3000/api/*` in dev; Nginx handles it in production.
- **Server Components**: Use `src/lib/serverFetch.ts` for SSR data fetching (reads `BACKEND_INTERNAL_URL` env var). `/social` uses Suspense streaming — `PostsLoader.tsx` is an async Server Component that streams posts into `Home.tsx`.
- **`dynamic({ssr:false})` rule**: ONLY for CodeMirror (DOM crashes on import), RyGame canvas, and Recharts in DataLookup. Everything else uses `'use client'` (which still SSRs to HTML).

### Portfolio IDE (`src/views/Portfolio/`)

The public-facing portfolio lives at `/`, `/about`, `/projects`, `/projects/[id]`, and `/contact`. It is a VSCode-style IDE layout with a multi-theme system.

**Entry point**: `src/app/(public)/layout.tsx` wraps all portfolio routes with `PortfolioShell` (from `IDELayout.tsx`), which composes `ThemeProvider → IDEProvider → IDELayout`. The shell stays mounted across page navigations — only `children` swaps, preventing flicker. Login/register are in `(with-navbar)` so they are unaffected.

**Structure**:

```
src/views/Portfolio/
├── IDELayout.tsx          — PortfolioShell, IDELayout, DesktopShell, TabletShell, MobileShell
├── TitleBar.tsx            — 44px top bar with logo + ThemeSwitcher
├── ActivityBar.tsx         — 48px left icon column (Explorer/Profile/Git/Skills/Settings)
├── SidePanel.tsx           — 220px left panel with 4 sub-panels
├── SettingsPanel.tsx       — Settings sub-panel rendered inside SidePanel
├── TabBar.tsx              — 36px tab row with main + dynamic project tabs
├── RightPanel.tsx          — 280px right panel (System metrics + Ask Oo chat)
├── StatusBar.tsx           — 24px bottom status bar
├── Terminal.tsx            — Animated boot terminal with interactive commands
├── context/
│   ├── IDEContext.tsx      — activeSidePanel, terminalOpen, openProjectTabs
│   └── ThemeContext.tsx    — 5 themes (midnight/nord/dracula/one-dark/catppuccin), CSS vars injected via document.documentElement
├── hooks/useResponsive.ts  — SSR-safe breakpoint (initializes to 'desktop', reads window in useEffect)
├── data/portfolio.ts       — All portfolio content (projects, commits, PRs, skills, aiResponses)
├── constants/fonts.ts      — Font family strings
├── constants/status.ts     — statusConfig + codeColors for syntax highlighting
├── shared/                 — Badge, IDECard, Breadcrumb, LineNumbers, PageHeader, SectionLabel, ThemeSwitcher
├── mobile/                 — MobileHeader, MobileNav, MobileDrawer
└── pages/
    ├── Dashboard.tsx       — / (commit stream, PR list, project gallery)
    ├── About.tsx           — /about (bio, stack, timeline, community)
    ├── Projects.tsx        — /projects (project list + stats)
    ├── ProjectDetail.tsx   — /projects/[id] (accepts id prop)
    └── Contact.tsx         — /contact (channels + message form)
```

**Theme system**: CSS variables are set on `document.documentElement` at runtime by `ThemeProvider`. `globals.css` has the midnight defaults for SSR/flash prevention. The user's choice is persisted in `localStorage` under `ide-theme`.

**Navigation**: All Vike `navigate()` calls replaced with `useRouter().push()` from `next/navigation`. Route params passed as props (not from routeContext).

**Fonts**: Space Grotesk (sans), Be Vietnam Pro (body), JetBrains Mono (mono), Funny Hello (title). Google Fonts loaded via CSS `@import` in `globals.css`. Funny Hello served from `public/FunnyHello.otf`.

### Backend Architecture (`backend/`)

All backend code uses ES Modules (`"type": "module"`). The pattern is strict **Controller → Service → Model**, backed by a dedicated Schemas layer:

- **Schemas** (`schemas/`): where all data structures are defined. `schemas/db/` holds Mongoose schema definitions (document shape); `schemas/validation/` holds Zod schemas (request payload/query shape). Nothing else defines data structure. Called by: models (db schemas) and services (validation schemas).
- **Models** (`models/`): calls `schemas/db/` to register `mongoose.model()`; exports named DB operation functions (CRUD, queries, aggregations). No business logic, no Zod.
- **Services** (`services/`): calls model DB functions for data access; uses `schemas/validation/` (via `validate()`) to validate inputs; contains all business logic. Never calls Mongoose directly.
- **Controllers** (`controllers/`): calls services; pure HTTP — extract from `req`, call service, send response. No Zod, no DB, no business logic.
- `asyncHandler` wraps every controller so thrown errors reach Express's error handler automatically

**Folder layout:**

| Path | What lives here |
|---|---|
| `backend/schemas/` | **Where all data structures are defined.** Two sub-folders: |
| `backend/schemas/db/` | Mongoose schema definitions — shape of every DB document; `index.js` barrel-exports all |
| `backend/schemas/validation/` | Zod validation schemas — shape of every request payload/query; `index.js` barrel-exports all |
| `backend/schemas/index.js` | Re-exports all validation schemas (the entry-point services import from) |
| `backend/models/` | Mongoose `model()` registration + named DB operation functions (CRUD, queries, aggregations); `index.js` barrel-exports all |
| `backend/config/` | One-time setup only: DB connection, CORS, rate limiters, env, Cloudinary SDK config |
| `backend/utils/` | Reusable helpers called in multiple places: `cloudinaryUpload`, `imageFormatter`, `validate`, `asyncHandler`, `ApiError`, `monitoring` |

`ApiError` is the central error class; use its static factories (`ApiError.badRequest()`, `ApiError.unauthorized()`, etc.) rather than creating ad-hoc errors.

**Auth**: JWT access tokens (15 min) + refresh tokens (7 days), stored in `localStorage`. Three middleware variants exist: `verifyToken` (strict), `optional` (guest-friendly), `protect` (alias for strict), `isAdmin`.

**Rate limits**: 300 req/15 min general; 30 req/10 min for post creation; 60 req/1 min for likes; 20 req/5 min for secret message retrieval.

**SecretEnv (`GET /api/secretenv`) is intentionally unauthenticated** — it is a personal, curl-friendly encrypted message saver. The password hash protects the content. Do not add auth middleware to this route.

**Error handling pattern**: Frontend API layer uses Axios interceptor to catch all errors. Each API function uses a single `request()` wrapper that extracts `response.data`. Backend services throw `ApiError` instances; `asyncHandler` catches and forwards to Express error middleware. No manual try-catch unless handling specific cases (like debounced likes or fallback responses for anonymous users).

### PostCard Compound Component

`src/components/PostCard/` is a compound component with named sub-components (`AuthorHeader`, `CommentSection`, `ImageModal`, `InteractionButtons`, `PostContent`, `PostImage`). Like toggling uses a 100 ms debounce in `src/api/posts.ts` — only the final desired state is sent to the server.

See `src/CLAUDE.md` and `backend/CLAUDE.md` for full file-level breakdowns of each directory.

### Analytics System

A first-party analytics system fingerprints visitors (canvas hash, WebGL, screen, network, fonts) and tracks page views via the `usePageTracking` hook on every route change. Uses `usePathname` + `useSearchParams` from `next/navigation`. Data lands in the `Visit` MongoDB collection. Visitor IDs are stable combinations of cookie ID + fingerprint hash + IP.

### AI Sidecar (`ai-slop/`)

A separate React/TypeScript app built independently and served at `/cao/`. It has its own `package.json` and build pipeline. In dev it runs as a separate Docker service; in production it is embedded in the main image.

## Key Environment Variables

| Variable                         | Where                     | Purpose                                                  |
| -------------------------------- | ------------------------- | -------------------------------------------------------- |
| `BACKEND_INTERNAL_URL`           | Next.js server (SSR only) | Internal URL for `serverFetch` (`http://localhost:3000`) |
| `NEXT_PUBLIC_CLOUDINARY_NAME`    | Next.js client            | Cloudinary cloud name                                    |
| `MONGO_URI`                      | Backend                   | MongoDB Atlas connection string                          |
| `JWT_SECRET`                     | Backend                   | Signs access tokens                                      |
| `REFRESH_TOKEN_SECRET`           | Backend                   | Signs refresh tokens (falls back to `JWT_SECRET`)        |
| `CLIENT_URL`                     | Backend                   | CORS allowed origin                                      |
| `CLOUDINARY_NAME/KEY/SECRET/URL` | Backend + Frontend        | Image upload/CDN                                         |
| `VITE_GEMINI_API_KEY`            | ai-slop build             | Gemini API for exam prep                                 |
| `NODE_ENV`                       | All                       | `development` \| `production`                            |

Backend-specific values live in `backend/.env`.

## Nginx Config Selection

The Dockerfile passes `--build-arg ENV=development|production` to copy either `nginx.development.conf` or `nginx.production.conf`. **`proxy_buffering off` on the `/*` location is mandatory** — without it, Nginx buffers the full response before sending, defeating Next.js Suspense streaming.

## Code Quality

**Style guidelines:**

- Tailwind for all styling (raw CSS only for `@font-face`, CSS custom properties, `@keyframes`, vendor-prefixed properties, `::-webkit-scrollbar`)
- Portfolio IDE uses inline `style={{}}` with CSS vars — this is intentional (runtime theme switching)
- KISS and DRY: one function does one thing, no abstraction until something repeats
- `dynamic({ssr:false})` only for CodeMirror, RyGame canvas, and Recharts

**Patterns to avoid (AI smells):**

- Decorative comment dividers (`// ─────`)
- Obvious section comments (`// Hero section`, `// Icon with glow`)
- Duplicated helper functions (centralize in shared files)
- Over-engineered error handling (triple-nested Promise.race, custom timeout wrappers)
- Separate Axios instances per file (import from `src/api/index.ts`)
- Verbose type definitions when TypeScript can infer

## Environment Files

| File               | Used when                                                    |
| ------------------ | ------------------------------------------------------------ |
| `.env`             | Local dev fallback                                           |
| `.env.development` | `NODE_ENV=development` (Next.js picks this up automatically) |
| `.env.production`  | `NODE_ENV=production` builds                                 |
| `backend/.env`     | Express backend only — never read by Next.js                 |
