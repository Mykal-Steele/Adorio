# AGENTS.md

Guidance for coding agents working in this repository.

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

# ── Docker (local) ────────────────────────────────────────────
docker compose up --build                              # dev at :8080
docker compose -f docker-compose.prod.yml up --build  # prod at :8080

# ── Testing (requires Docker) ─────────────────────────────────
npm run test:dev         # integration tests against dev containers
npm run test:prod        # integration tests against prod containers
```

## Architecture

### Request Flow (Production)

```
Browser → Cloudflare CDN (SSL mode: Full strict) → Azure Container Apps ingress (managed TLS, Envoy)
  └─ Container App `adorio` (single active revision, minReplicas 1, autoscale to 3)
       └─ Nginx (plain HTTP :8080 — Container Apps terminates TLS at the platform edge)
            ├─ /api/*          → localhost:3000 (Express backend)
            ├─ /cao/*          → static files /usr/share/nginx/html/cao/ (ai-slop)
            ├─ /_next/static/* → localhost:3001 (Next.js, 1yr cache)
            └─ /*              → localhost:3001 (Next.js SSR, proxy_buffering off)
```

The backend, Next.js standalone server, and Nginx all run in the same Docker container, same as before the Azure migration. `nginx.production.conf` no longer terminates TLS itself (dropped in the migration — Container Apps' ingress does that now with a free managed certificate). `nginx.production.conf` / `nginx.development.conf` are still selected at image build time via the `$ENV` build arg.

**Custom domain**: `adorio.space` and `www.adorio.space` are both bound to the Container App with Azure-managed certificates (`SniEnabled`). Root domain uses an A record to the Container Apps environment's static IP + `HTTP` validation (apex domains can't use CNAME/managed-cert validation the way subdomains can); `www` uses a CNAME straight to the container app's default FQDN + `CNAME` validation. Both records are proxied through Cloudflare (SSL mode `Full (strict)`, safe now that the origin presents a real trusted cert instead of a manually mounted one).

### Hosting

- **Platform**: Azure Container Apps — region `southeastasia`, resource group `adorio-prod-rg`, subscription funded by a recurring $150/mo Visual Studio Enterprise credit
- **Compute**: single Container App (`adorio`) — 1.0 vCPU / 2Gi memory, `minReplicas: 1` (always warm, no cold start), `maxReplicas: 3`, `/api/health` wired as both liveness and readiness probe
- **Registry**: Azure Container Registry `adorioacr` — the container app pulls images via its own user-assigned managed identity (`AcrPull`), no admin credentials on the registry
- **Deploys**: a separate user-assigned managed identity authenticates GitHub Actions via OIDC (no stored secret) with `AcrPush` + `Container Registry Tasks Contributor` (registry-scoped) and `Container Apps Contributor` (resource-group-scoped) — see `infra/main.bicep`
- **Infra as code**: `infra/main.bicep` (app stack: environment, registry, container app, identities, RBAC) and `infra/budget.bicep` (subscription cost budget) — both applied manually via `az deployment group create` / `az deployment sub create`, **not** run automatically by CI. `infra/main.bicep`'s `containerImage` parameter has no default on purpose — always pass the currently-running image explicitly when re-applying it, or it'll reset the live app
- **Budget guardrail**: subscription-level Azure Cost Management budget, $150/mo, email alerts at 50/80/100% actual spend and 100% forecasted — alert-only, does not cap or throttle spend automatically
- **Code runner (Piston)**: one VM, `adorio-piston-vm` (`Standard_D4as_v5`), defined in `infra/piston.bicep`. It is deallocated whenever nobody is running Java/Python code, so it bills by the hour of real use. The backend starts it when a logged-in user opens a Java/Python problem, keeps it on for `PISTON_IDLE_MINUTES` (30) after each run, and deallocates it after that (`backend/services/codeRunnerService.js`). An admin can hold it on for a class from the practice page. Safeguards: a daily on-time cap (`PISTON_DAILY_LIMIT_MINUTES`, 480), and a timer on the VM itself that deallocates it after 5 hours without a submission in case the backend never does. The backend acts through its own identity (`adorio-piston-control-identity`) with a custom role limited to read, start, and deallocate on that one VM
- **Database**: MongoDB Atlas (connection via `MONGO_URI`)
- **Images**: Cloudinary

### CI/CD

GitHub Actions (`.github/workflows/ci.yml`) triggers on push to `main`.

Pipeline order (each step gates the next):

1. **Format check** — `npm run format:check`
2. **Lint** — `npm run lint`
3. **TypeScript + build** — `npm run build`
4. **Integration tests** — spins up prod Docker containers, runs Puppeteer tests (`npm run test:prod`)
5. **Deploy** — authenticates to Azure via OIDC (`azure/login`, no stored client secret), builds and pushes the image with `az acr build` (runs the existing multi-stage `Dockerfile` unmodified via ACR Tasks, cloud-side), rolls out the new image with `az containerapp update`, verifies `/api/health` actually comes back healthy on the real FQDN with `scripts/wait-for-url.cjs` before the job succeeds — a revision that never goes healthy fails the deploy loudly instead of silently leaving a broken revision live — then purges the whole Cloudflare cache via the API

**Why the Cloudflare purge step exists**: Next.js serves prerendered pages (like `/`) with `Cache-Control: s-maxage=31536000` (1 year). Cloudflare takes that literally and will keep serving the same cached HTML for up to a year without re-checking origin. Since `output: 'standalone'` builds only ship the current build's `_next/static/chunks/`, a stale cached HTML page from before a deploy points at chunk hashes that no longer exist on disk — every asset 404s (served as `text/plain`, which the browser refuses to run/apply due to strict MIME checking) and the page never hydrates, showing a white screen. Purging on every successful deploy forces Cloudflare to re-fetch HTML that matches what's actually on disk. If this ever needs doing manually: Cloudflare dashboard → Caching → Configuration → Purge Everything.

Secrets stored in GitHub: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` (identify the deploy-time managed identity — no password or key material, just identifiers), `CLOUDFLARE_ZONE_ID` + `CLOUDFLARE_API_TOKEN` (token scoped to `Zone.Cache Purge` only, for the `adorio.space` zone), plus all app env vars injected during the integration-test step. Runtime secrets the live Container App actually uses (`MONGO_URI`, `JWT_SECRET`, etc.) are baked in separately via the Bicep deployment, not by this pipeline.

### Frontend Architecture (`src/`)

- **Framework**: Next.js 16 App Router (`output: 'standalone'`, `transpilePackages: ['framer-motion']`)
- **Routing**: File-based App Router in `src/app/`. Route groups: `(public)` (no navbar), `(with-navbar)` (has navbar), `(with-navbar)/(protected)` (auth-gated).
- **State**: Redux Toolkit — only auth state (`userSlice` with `isAuthLoading`). Everything else is local component state.
- **Auth**: JWT in `localStorage`. `AuthBootstrapper.tsx` (wrapped in `<Suspense>` in root layout) runs `useAuthBootstrap` + `usePageTracking` on mount. Protected routes use `(protected)/layout.tsx` which reads Redux and redirects to `/login?redirect=<pathname>` if unauthenticated.
- **API layer**: `src/api/` — thin Axios wrappers. All requests use relative `/api` base URL. Next.js rewrites `/api/*` → `http://localhost:3000/api/*` in dev; Nginx handles it in production.
- **Server Components**: Use `src/lib/serverFetch.ts` for SSR data fetching (reads `BACKEND_INTERNAL_URL` env var). `/social` uses Suspense streaming — `PostsLoader.tsx` is an async Server Component that streams posts into `Home.tsx`.
- **`dynamic({ssr:false})` rule**: ONLY for CodeMirror (DOM crashes on import), RyGame canvas, and Recharts in DataLookup. Everything else uses `'use client'` (which still SSRs to HTML).

### Portfolio IDE (`src/views/Portfolio/`)

The public-facing portfolio lives at `/`, `/projects`, `/projects/[id]`, `/skills/[id]`, and `/contact`. It is a VSCode-style IDE layout in the same paper style as `/social` and `/coding` (plus five dark themes).

**Entry point**: `src/app/(public)/layout.tsx` wraps all portfolio routes with `PortfolioShell` (from `IDELayout.tsx`), which composes `ThemeProvider → IDEProvider → IDELayout`. The shell stays mounted across page navigations — only `children` swaps, preventing flicker. Login/register are in `(with-navbar)` so they are unaffected.

**Structure**:

```
src/views/Portfolio/
├── IDELayout.tsx          — PortfolioShell and one Shell; CSS breakpoints pick which bars show
├── TitleBar.tsx            — 48px top bar with Portfolio label + ThemeSwitcher
├── ActivityBar.tsx         — 48px left column, one button that shows or hides the explorer
├── SidePanel.tsx           — 240px explorer: root files plus projects/ and skills/ folders
├── TabBar.tsx              — 40px tab row of open files, closable like an editor
├── StatusBar.tsx           — 24px bottom status bar
├── Terminal.tsx            — Animated boot terminal with interactive commands
├── context/
│   ├── IDEContext.tsx      — sidePanelOpen, terminalOpen, openTabs (every visited page gets a tab)
│   └── ThemeContext.tsx    — theme names and labels, plus useTheme over next-themes
├── hooks/useContentWidth.ts — editor-area width, only for behavior (the theme tip); layout uses container queries
├── data/portfolio.ts       — All portfolio content (projects, experience, skills with a `story` field, setup, timeline)
├── data/files.ts           — file names for tabs and the explorer
├── data/skills.ts          — which projects and roles mention each skill
├── constants/fonts.ts      — Font family strings
├── constants/status.ts     — statusConfig (display label per project status)
├── constants/type.ts       — shared text and button styles (eyebrow, body, primaryButton, textLink)
├── shared/                 — IDECard (with Tape), FileIcon, Lightbox, LogoTile, PageHeader, ProjectCard, ProjectImage, SectionLabel, StatusLabel, TechLogo, ThemeHint, ThemeSwitcher
├── mobile/                 — MobileHeader, MobileNav, MobileDrawer
└── pages/
    ├── About.tsx           — / (bio, social links, featured projects, stack, timeline, community)
    ├── Projects.tsx        — /projects (visual project card grid)
    ├── ProjectDetail.tsx   — /projects/[id] (accepts id prop)
    ├── SkillDetail.tsx     — /skills/[id]: logo, your story, and the projects and roles that use it
    └── Contact.tsx         — /contact (channels + message form)
```

**Theme system**: CSS variables are set on `document.documentElement` at runtime by `ThemeProvider`. `globals.css` has the one-dark fallback plus a `paper` theme (the default) that matches the `/social` and `/coding` colors. The user's choice is persisted by next-themes in `localStorage` under `theme`.

**Navigation**: All Vike `navigate()` calls replaced with `useRouter().push()` from `next/navigation`. Route params passed as props (not from routeContext).

**Fonts**: the same set as the paper pages. Playfair Display for headings, Karla for body and UI text, Courier Prime for the main button and the terminal, and Patrick Hand only for the handwritten theme hint. The files are in `src/app/fonts/` and load through `next/font/local` in `src/app/fonts.ts`, so builds never download fonts.

**Interaction states**: buttons, links, cards, logo tiles, and photo prints use the `.pf-btn-primary`, `.pf-btn`, `.pf-link`, `.pf-card`, `.pf-tile`, and `.pf-print` classes in `globals.css`. Inline styles would override any `:hover`, so keep transforms and shadows for these elements in the classes, not in `style={{}}`.

**Motion**: a new page eases in on client navigation (`usePageEnter` in `IDELayout.tsx`, never on the first load), theme changes crossfade with a view transition (`ThemeContext.tsx`), and going from one mobile drawer to another waits for the first to close (`onExited`). The page change progress bar (`src/components/NavigationProgressBar.tsx`, on every page) only shows when a page takes longer than 150ms, and creeps on instead of stopping partway. Everything checks `prefersReducedMotion()` from `motion.ts` or has a `prefers-reduced-motion` rule in `globals.css`. Keep new motion to things the user did, and use the same `cubic-bezier(0.23, 1, 0.32, 1)` curve.

### Backend Architecture (`backend/`)

All backend code uses ES Modules (`"type": "module"`). The pattern is strict **Controller → Service → Model**, backed by a dedicated Schemas layer:

- **Schemas** (`schemas/`): where all data structures are defined. `schemas/db/` holds Mongoose schema definitions (document shape); `schemas/validation/` holds Zod schemas (request payload/query shape). Nothing else defines data structure. Called by: models (db schemas) and services (validation schemas).
- **Models** (`models/`): calls `schemas/db/` to register `mongoose.model()`; exports named DB operation functions (CRUD, queries, aggregations). No business logic, no Zod.
- **Services** (`services/`): calls model DB functions for data access; uses `schemas/validation/` (via `validate()`) to validate inputs; contains all business logic. Never calls Mongoose directly.
- **Controllers** (`controllers/`): calls services; pure HTTP — extract from `req`, call service, send response. No Zod, no DB, no business logic.
- `asyncHandler` wraps every controller so thrown errors reach Express's error handler automatically

**Folder layout:**

| Path                          | What lives here                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/schemas/`            | **Where all data structures are defined.** Two sub-folders:                                                                            |
| `backend/schemas/db/`         | Mongoose schema definitions — shape of every DB document; `index.js` barrel-exports all                                                |
| `backend/schemas/validation/` | Zod validation schemas — shape of every request payload/query; `index.js` barrel-exports all                                           |
| `backend/schemas/index.js`    | Re-exports all validation schemas (the entry-point services import from)                                                               |
| `backend/models/`             | Mongoose `model()` registration + named DB operation functions (CRUD, queries, aggregations); `index.js` barrel-exports all            |
| `backend/config/`             | One-time setup only: DB connection, CORS, rate limiters, env, Cloudinary SDK config                                                    |
| `backend/utils/`              | Reusable helpers called in multiple places: `cloudinaryUpload`, `imageFormatter`, `validate`, `asyncHandler`, `ApiError`, `monitoring` |

`ApiError` is the central error class; use its static factories (`ApiError.badRequest()`, `ApiError.unauthorized()`, etc.) rather than creating ad-hoc errors.

**Auth**: JWT access tokens (15 min) + refresh tokens (7 days), stored in `localStorage`. Three middleware variants exist: `verifyToken` (strict), `optional` (guest-friendly), `protect` (alias for strict), `isAdmin`.

**Rate limits**: 300 req/15 min general; 30 req/10 min for post creation; 60 req/1 min for likes; 20 req/5 min for secret message retrieval.

**Never answer 5xx for "the code runner is off or starting".** The Cloudflare failover worker treats any 5xx from the Azure backend as the primary being down, and two in a row fail the whole site over to Northflank. `/api/coding/run` answers 409 with `details.code = 'RUNNER_NOT_READY'` instead, and the runner status routes always answer 200 with a `state`.

**The Northflank failover copy cannot start the code runner** (it has no Azure identity, and `PISTON_VM_RESOURCE_ID` is not set there). It reports the runner as `offline` unless the VM happens to be on, and the practice page shows a maintenance message. This is intended.

**SecretEnv (`GET /api/secretenv`, `GET /api/secretenv/:name`) is intentionally unauthenticated** — it is a personal, curl-friendly encrypted message saver. Named envs use a passphrase with AES-256-GCM; legacy records use the old password+email hash. Do not add auth middleware to these routes.

**Error handling pattern**: Frontend API layer uses Axios interceptor to catch all errors. Each API function uses a single `request()` wrapper that extracts `response.data`. Backend services throw `ApiError` instances; `asyncHandler` catches and forwards to Express error middleware. No manual try-catch unless handling specific cases (like debounced likes or fallback responses for anonymous users).

### PostCard Compound Component

`src/components/PostCard/` is a compound component with named sub-components (`AuthorHeader`, `CommentSection`, `ImageModal`, `InteractionButtons`, `PostContent`, `PostImage`). Like toggling uses a 100 ms debounce in `src/api/posts.ts` — only the final desired state is sent to the server.

See `src/AGENTS.md` and `backend/AGENTS.md` for full file-level breakdowns of each directory.

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
| `PISTON_URL/TOKEN/CA_CERT`       | Backend                   | Where Piston is, its shared token, its pinned TLS cert   |
| `PISTON_VM_RESOURCE_ID`          | Backend (Azure only)      | Turns on start/stop control of the Piston VM             |
| `PISTON_CONTROL_CLIENT_ID`       | Backend (Azure only)      | Which managed identity to use for that control           |
| `CLIENT_URL`                     | Backend                   | CORS allowed origin                                      |
| `CLOUDINARY_NAME/KEY/SECRET/URL` | Backend + Frontend        | Image upload/CDN                                         |
| `R2_ACCOUNT_ID/BUCKET/PUBLIC_URL`| Backend                   | Cloudflare R2 file host: account, bucket, public origin  |
| `R2_ACCESS_KEY_ID/SECRET_ACCESS_KEY` | Backend               | R2 API token (S3) for presigning uploads and deletes     |
| `HOSTED_STORAGE_LIMIT_BYTES`     | Backend                   | Hard cap on total hosted-file storage (default 9 GiB, under R2's 10 GB free tier) |
| `TURNSTILE_SITE_KEY/SECRET_KEY`  | Backend                   | Cloudflare Turnstile bot check on uploads (blank disables it) |
| `VITE_GEMINI_API_KEY`            | ai-slop build             | Gemini API for exam prep                                 |
| `NODE_ENV`                       | All                       | `development` \| `production`                            |

Backend-specific values live in the root `.env.development` / `.env.production` — see [Environment Files](#environment-files) below.

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

## Pull Requests

Write PR descriptions the way the owner would: short, plain, first person ("I moved the resume to R2 because..."). Casual is fine. Don't write it like a report or an AI summary ("The sweep came back clean: ..."), don't use em dashes, and don't add any AI attribution.

Every PR uses this format:

```markdown
## Summary

What changed and why, in a few sentences. Add a small diff, tree, or code sketch only if it makes the change clearer.

## Evidence

Real proof it works: the test that failed before and passes now, a before/after screenshot, or the command output.

## Merge Danger

**Door:** one-way or two-way (can it be rolled back?)

**Blast Radius:** what could break if this is wrong
```

## Environment Files

One centralized set at the repo root — frontend, backend, and Docker dev all read the same files. There is no `backend/.env`; `backend/config/environment.js` resolves the repo root from its own file location and loads the root files directly, regardless of the working directory it's started from.

| File                           | Used when                                                                                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env`                         | Docker Compose's own `${VAR}` substitution inside `docker-compose*.yml` (currently just `VITE_GEMINI_API_KEY`) — not app runtime config                           |
| `.env.development`             | Local dev, all of it: native `npm run dev` / `npm run dev:backend`, and `docker compose up --build` (`env_file:`)                                                 |
| `.env.production`              | Local "production-mode" testing only (`npm run bs`, `docker-compose.prod.yml`) — real prod secrets live in Azure Container App config, set via `infra/main.bicep` |
| `ai-slop/.../.env.development` | The ai-slop Vite app's own build — only `VITE_GEMINI_API_KEY`, since that's the only var its code reads                                                           |
| `backend-go/.env`              | The experimental (undeployed) Go backend — only `JWT_SECRET`/`MONGO_URI`, kept in sync manually                                                                   |
| `scripts/.env`                 | `scripts/audit.mjs` only — a single `AUDIT_PASSWORD`, unrelated to the app                                                                                        |
| `infra/.secrets/`              | Deploy-time secrets (SSH key, TLS keypair, Piston auth token) for redeploying `infra/piston.bicep` — never app runtime config, see its `README.md`                |

All of the above are gitignored and local-only. Nothing here is what's actually running in production — that's Azure Container App secrets (`infra/main.bicep`) and, for the Northflank failover copy, its own separately-configured dashboard env vars — anything changed here that the app needs at runtime must be mirrored there too.
