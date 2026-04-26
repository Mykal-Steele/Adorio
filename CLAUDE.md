# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adorio is a social media platform deployed at **adorio.space**. It is a JavaScript monorepo containing:
- A **Next.js 16 App Router** frontend (replaced Vite/React 18)
- A Node.js/Express backend (ES Modules)
- An AI exam-prep sidecar app (`ai-slop/`, React/TypeScript, Gemini API)
- An experimental Go backend (`backend-go/`, not deployed)

## Commands

### Development

```bash
# Run both Next.js dev server (port 3001) and backend (port 3000) together
npm run dev:full

# Frontend only (Next.js with Turbopack)
npm run dev

# Backend only
npm run dev:backend

# After cross-platform checkout (Windows ↔ Linux), reinstall native binaries
node scripts/sync-platform-deps.cjs
```

### Build

```bash
# Production build of the Next.js frontend → .next/standalone/
npm run build
# or directly:
./node_modules/.bin/next build
```

### Docker

```bash
# Start dev environment (port 8080)
docker compose up --build

# Start production environment (single container, port 8080)
docker compose -f docker-compose.prod.yml up --build
```

### Testing

```bash
# Full integration/E2E test suite (requires Docker running)
npm run test:integration

# Run tests against dev Docker containers
npm run test:dev

# Run tests against prod Docker containers
npm run test:prod

# Go backend tests
cd backend-go && go test ./...
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
- **Server Components**: Use `src/lib/serverFetch.ts` for SSR data fetching (reads `BACKEND_INTERNAL_URL` env var). `/home` uses Suspense streaming — `PostsLoader.tsx` is an async Server Component that streams posts into `Home.tsx`.
- **`dynamic({ssr:false})` rule**: ONLY for CodeMirror (DOM crashes on import), RyGame canvas, and Recharts in DataLookup. Everything else uses `'use client'` (which still SSRs to HTML).

### Backend Architecture (`backend/`)

All backend code uses ES Modules (`"type": "module"`). The pattern is strict **Controller → Service → Model**:
- Controllers handle only HTTP concerns (parsing request, sending response)
- Services contain all business logic and database access
- `asyncHandler` wraps every controller so thrown errors reach Express's error handler automatically

`ApiError` is the central error class; use its static factories (`ApiError.badRequest()`, `ApiError.unauthorized()`, etc.) rather than creating ad-hoc errors.

**Auth**: JWT access tokens (15 min) + refresh tokens (7 days), stored in `localStorage`. Three middleware variants exist: `verifyToken` (strict), `optional` (guest-friendly), `protect` (alias for strict), `isAdmin`.

**Rate limits**: 300 req/15 min general; 30 req/10 min for post creation; 60 req/1 min for likes.

### PostCard Compound Component

`src/Components/PostCard/` is a compound component with named sub-components (`AuthorHeader`, `CommentSection`, `ImageModal`, `InteractionButtons`, `PostContent`, `PostImage`). Like toggling uses a 100 ms debounce in `src/api/posts.ts` — only the final desired state is sent to the server.

### Analytics System

A first-party analytics system fingerprints visitors (canvas hash, WebGL, screen, network, fonts) and tracks page views via the `usePageTracking` hook on every route change. Uses `usePathname` + `useSearchParams` from `next/navigation`. Data lands in the `Visit` MongoDB collection. Visitor IDs are stable combinations of cookie ID + fingerprint hash + IP.

### AI Sidecar (`ai-slop/`)

A separate React/TypeScript app built independently and served at `/cao/`. It has its own `package.json` and build pipeline. In dev it runs as a separate Docker service; in production it is embedded in the main image.

## Key Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `BACKEND_INTERNAL_URL` | Next.js server (SSR only) | Internal URL for `serverFetch` (`http://localhost:3000`) |
| `NEXT_PUBLIC_CLOUDINARY_NAME` | Next.js client | Cloudinary cloud name |
| `MONGO_URI` | Backend | MongoDB Atlas connection string |
| `JWT_SECRET` | Backend | Signs access tokens |
| `REFRESH_TOKEN_SECRET` | Backend | Signs refresh tokens (falls back to `JWT_SECRET`) |
| `CLIENT_URL` | Backend | CORS allowed origin |
| `CLOUDINARY_NAME/KEY/SECRET/URL` | Backend + Frontend | Image upload/CDN |
| `VITE_GEMINI_API_KEY` | ai-slop build | Gemini API for exam prep |
| `NODE_ENV` | All | `development` \| `production` |

Backend-specific values live in `backend/.env`.

## Nginx Config Selection

The Dockerfile passes `--build-arg ENV=development|production` to copy either `nginx.development.conf` or `nginx.production.conf`. **`proxy_buffering off` on the `/*` location is mandatory** — without it, Nginx buffers the full response before sending, defeating Next.js Suspense streaming.
