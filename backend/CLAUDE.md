# backend/CLAUDE.md

Guidance for Claude Code when working in `backend/`.

## Quick Start

```bash
# From repo root
npm run dev:backend          # start backend only on :3000
npm run dev:full             # start frontend + backend together

# From backend/ directly
node --env-file=.env.development index.js
```

## Commands

```bash
# ── Development ───────────────────────────────────────────────
npm run dev:backend          # nodemon watch mode (run from repo root)

# ── Verify environment ────────────────────────────────────────
node backend/test-env.js     # prints loaded env vars and flags missing ones

# ── Code quality ──────────────────────────────────────────────
npm run format               # Prettier fix (covers backend/**/*.js)
npm run format:check         # Prettier check (used in CI)
npm run lint                 # ESLint

# ── Testing (requires Docker) ─────────────────────────────────
npm run test:dev             # integration tests against dev containers
npm run test:prod            # integration tests against prod containers
```

## Overview

Express.js API, port 3000, ES Modules (`"type": "module"` in `backend/package.json`). Entry point is `backend/index.js`.

The only other "backend" in the repo is `src/app/api/contact/route.ts` — a single Next.js route that handles the contact form. It is completely separate from this Express server and shares no code with it.

---

## Folder Structure

```
backend/
├── index.js                    — App setup: middleware stack, rate limiter wiring, route mounting, server start
├── test-env.js                 — Dev utility: prints loaded env vars, flags missing required ones
├── config/
│   ├── cloudinary.js           — Cloudinary SDK init (imported for side-effects only in index.js)
│   ├── corsOptions.js          — CORS policy: allowedOrigins list + Vercel preview wildcard
│   ├── database.js             — connectDatabase(): mongoose.connect with retry (5 attempts, 5s delay)
│   ├── environment.js          — Loads .env file, normalizes all env vars, exports environment object + allowedOrigins + isProduction
│   └── rateLimiters.js         — All express-rate-limit instances (standardLimiter, postLimiter, likeLimiter, registrationLimiter, authLimiter, secretLimiter)
├── controllers/
│   ├── analyticsController.js  — trackVisit, getPageViewSummary, getRecentVisitEntries, getVisitorSummary, getVisitorDetailsInfo, getHealthStatus, getSystemStats
│   ├── gameController.js       — getLeaderboardHandler, updateScoreHandler, getUserStatsHandler
│   ├── postController.js       — createPostHandler, getPostsHandler, getSinglePostHandler, toggleLikeHandler, addCommentHandler
│   ├── secretEnvController.js  — storeSecretMessage, retrieveSecretMessageHandler
│   └── userController.js       — getCurrentUser, registerUser, loginUser, refreshToken
├── middleware/
│   ├── authMiddleware.js       — Re-export shim pointing to verifyToken.js; kept for backwards compat — import from verifyToken.js directly
│   ├── errorHandler.js         — Global Express error handler; reads err.statusCode, strips stack in production, forwards optimisticId for UI rollback
│   ├── verifyToken.js          — JWT auth: default + protect = strict (401/403), optional = guest-friendly, admin = isAdmin guard
│   └── visitorIdentifier.js    — Builds req.visitor: hashes cookie + fingerprint + IP → stable visitorId; sets adorio_vid cookie (2yr)
├── models/
│   ├── index.js                — Barrel: re-exports all named exports from every model file
│   ├── Post.js                 — Post model + DB ops: createPost, countPosts, findPostsPaginated, findPostById, findPostLikesById, updatePostById, pushCommentToPost
│   ├── SecretEnv.js            — SecretEnv model + DB ops: createSecretEnv, findSecretByPasswordHash
│   ├── User.js                 — User model + DB ops: findUserById, findUserByEmail, findUserByEmailOrUsername, createUser, findUsersWithScore, updateUserRhythm, findUsersByIds
│   └── Visit.js                — Visit model + DB ops: createVisit, aggregateVisits, findRecentVisits, findVisitsByVisitorId
├── routes/
│   ├── analyticsRoutes.js      — /api/stats/* routes
│   ├── gameRoutes.js           — /api/game/* routes
│   ├── postRoutes.js           — /api/posts/* routes
│   ├── secretEnvRoutes.js      — /api/secretenv/* routes
│   └── userRoutes.js           — /api/users/* routes
├── schemas/
│   ├── index.js                — Barrel: re-exports everything from schemas/validation/index.js
│   ├── db/
│   │   ├── index.js            — Barrel: re-exports all Mongoose schema defaults
│   │   ├── imageSchema.js      — Mongoose sub-document schema for post images (strict: false for legacy snake_case fields)
│   │   ├── postSchema.js       — Mongoose schema for Post collection; uses imageSchema; date transform on toJSON/toObject
│   │   ├── secretEnvSchema.js  — Mongoose schema for SecretEnv collection; indexes on userId + passwordHash
│   │   ├── userSchema.js       — Mongoose schema for User collection; rhythmGame sub-doc; timestamps: true
│   │   └── visitSchema.js      — Mongoose schema for Visit collection; screen/browser/network fingerprint sub-docs; compound indexes
│   └── validation/
│       ├── index.js            — Barrel: re-exports all Zod schemas
│       ├── analyticsSchemas.js — pageViewsQuerySchema, recentVisitsQuerySchema, visitorStatsQuerySchema
│       ├── gameSchemas.js      — updateScoreSchema
│       ├── postSchemas.js      — createPostSchema, addCommentSchema, getPostsQuerySchema
│       ├── secretEnvSchemas.js — createSecretSchema
│       └── userSchemas.js      — registerSchema, loginSchema
├── services/
│   ├── analyticsService.js     — recordVisit, getPageViewStats, getRecentVisits, getVisitorStats, getVisitorDetails; runs MongoDB aggregation pipelines; generates deterministic visitor nicknames
│   ├── authService.js          — createAuthTokens (JWT access 15m + refresh 7d), verifyRefreshToken
│   ├── gameService.js          — getLeaderboard, updateUserScore, getUserStats
│   ├── postService.js          — createPost, getPaginatedPosts, getPostById, togglePostLike, addCommentToPost; normalizePost converts DB doc → response shape
│   ├── secretEnvService.js     — createSecretMessage (AES-256-CBC encrypt), retrieveSecretMessage (decrypt via password hash lookup)
│   └── userService.js          — createUserAccount, findUserById, authenticateUser, sanitizeUser
└── utils/
    ├── ApiError.js             — Error class; static factories: badRequest (400), unauthorized (401), forbidden (403), notFound (404), tooManyRequests (429), internalServerError (500)
    ├── asyncHandler.js         — Wraps async controller, catches thrown errors and forwards to Express next()
    ├── cloudinaryUpload.js     — multer + multer-storage-cloudinary; uploads to feelio/posts folder; 10 MB limit; JPEG/PNG/WEBP only
    ├── fingerprinting.js       — createVisitorFingerprint (hashes screen+locale+browser+network+IP), createStableVisitorId; used by visitorIdentifier middleware
    ├── imageFormatter.js       — extractUploadedImageMetadata (multer req.file → DB shape), normalizeExistingImage (DB doc → camelCase response with regenerated CDN URLs)
    ├── monitoring.js           — AnalyticsMonitor singleton (tracks timing + error metrics), validateFingerprint, validateVisitorId, monitoredFunction wrapper, in-memory RateLimiter class
    ├── validate.js             — Calls schema.safeParse(data); throws ApiError.badRequest with the first Zod issue message on failure; returns parsed data on success
    └── visitorMatching.js      — calculateFingerprintSimilarity, isSameVisitor, deduplicateVisitors, createFingerprintHash; used by analytics admin views for visitor de-duplication
```

---

## Architecture

Four layers, strict top-down dependency flow:

```
schemas/      defines all data shapes
    ↓
models/       registers mongoose.model() from schemas/db/; exports named DB operation functions
    ↓
services/     calls model functions for DB access; validates inputs via schemas/validation/; all business logic
    ↓
controllers/  calls services; pure HTTP — parse req, call service, send res
```

**Rules — enforce these every time:**
- Controllers never touch Mongoose, Zod, or business logic. Only `req`/`res`/`next`.
- Services never call Mongoose directly — always go through a model function.
- Models never contain business logic or Zod.
- Utils never import from models (prevents circular deps; monitoring.js uses `mongoose.connection.db.command` instead).
- All errors must use `ApiError` static factories. Never `new ApiError(...)` directly, never raw `new Error(...)`.
- Every controller must be wrapped in `asyncHandler`. No manual try-catch in controllers.
- Zod validation lives in services only, via `validate(schema, rawBody)`. Never in controllers or models.

---

## Routes

### All endpoints

| Method | Path | Auth | Handler |
|--------|------|------|---------|
| GET | `/api/users/me` | required | getCurrentUser |
| POST | `/api/users/register` | none | registerUser |
| POST | `/api/users/login` | none | loginUser |
| POST | `/api/users/refresh-token` | none | refreshToken |
| POST | `/api/posts` | required | createPostHandler (+ multer upload) |
| GET | `/api/posts` | none | getPostsHandler |
| GET | `/api/posts/:id` | none | getSinglePostHandler |
| PUT | `/api/posts/:id/like` | required | toggleLikeHandler |
| POST | `/api/posts/:id/comment` | required | addCommentHandler |
| GET | `/api/game/leaderboard` | none | getLeaderboardHandler |
| POST | `/api/game/update-score` | optional | updateScoreHandler |
| GET | `/api/game/user-stats` | optional | getUserStatsHandler |
| POST | `/api/secretenv` | required | storeSecretMessage |
| GET | `/api/secretenv` | **none** (by design) | retrieveSecretMessageHandler |
| POST | `/api/stats/track` | optional | trackVisit (+ visitorIdentifier middleware) |
| GET | `/api/stats/page-views` | required | getPageViewSummary |
| GET | `/api/stats/recent` | required | getRecentVisitEntries |
| GET | `/api/stats/visitor-stats` | required | getVisitorSummary |
| GET | `/api/stats/visitor/:visitorId` | required | getVisitorDetailsInfo |
| GET | `/api/stats/health` | none | getHealthStatus |
| GET | `/api/stats/stats` | required | getSystemStats |
| GET | `/api/health` | none | getHealthStatus (inline in index.js) |
| GET | `/api/test-env` | none (dev only) | inline in index.js |

### Auth middleware variants (`verifyToken.js`)

- `verifyToken` / `protect` — strict; 401 if no token, 403 if invalid
- `optional` — attaches `req.user` if token is valid, proceeds as guest if not
- `admin` — must run after `verifyToken`; 403 if `req.user.isAdmin` is false
- Import from `verifyToken.js` directly — `authMiddleware.js` is just a shim

### Rate limiters (`rateLimiters.js`)

| Limiter | Window | Max | Applied to |
|---------|--------|-----|------------|
| `standardLimiter` | 15 min | 300 | all routes (global) |
| `registrationLimiter` | 1 hour | 10 | POST /api/users/register |
| `authLimiter` | 15 min | 10 | POST /api/users/login + refresh-token |
| `postLimiter` | 10 min | 30 | POST /api/posts |
| `likeLimiter` | 1 min | 60 | PUT /api/posts/:id/like |
| `secretLimiter` | 5 min | 20 | GET /api/secretenv |

`app.set('trust proxy', 1)` is set in `index.js` — Northflank sits behind one Cloudflare hop.

---

## Key Packages

| Package | Purpose |
|---------|---------|
| `express` | HTTP server |
| `mongoose` | MongoDB ODM |
| `zod` | Request validation (v4.x — `z.coerce.*` available) |
| `jsonwebtoken` | JWT sign + verify |
| `bcryptjs` | Password hashing (salt rounds: 10) |
| `multer` + `multer-storage-cloudinary` | Image upload to Cloudinary |
| `cloudinary` | Cloudinary SDK for image URL generation |
| `express-rate-limit` | Per-IP rate limiting |
| `cors` | CORS middleware |
| `compression` | gzip response compression |
| `cookie-parser` | Parse `req.cookies` (visitor ID cookie) |
| `unique-names-generator` | Deterministic visitor nicknames in analytics |

---

## Analytics System

Three components work together:

1. **`visitorIdentifier` middleware** — runs on `POST /api/stats/track` before auth. Reads fingerprint data from request body, hashes (cookie + fingerprint + IP) → SHA-256 → stable 16-char visitor ID. Sets `adorio_vid` cookie (2yr). Attaches `req.visitor`.

2. **`analyticsController.js`** — extracts real client IP from `cf-connecting-ip` → `x-real-ip` → `x-forwarded-for` → `req.ip`. Validates visitor ID format. Wraps service calls in `monitoredFunction` to record timing metrics.

3. **`analyticsService.js`** — stores visits in the `Visit` collection. Stats queries use MongoDB aggregation pipelines. Visitor display names are generated with `uniqueNamesGenerator` using a deterministic seed (fingerprint or `ipAddress-visitorId`) so the same visitor always gets the same nickname across requests.

`monitoring.js` exports `monitor` (AnalyticsMonitor singleton — tracks avg processing time, error rate, health) and `rateLimiter` (in-memory per-IP rate limiter for the track endpoint, separate from `express-rate-limit`).

---

## SecretEnv

A personal encrypted message vault. Users POST `{ message, password }` while authenticated. The message is encrypted with AES-256-CBC using `password + user.email` as the key. The combined string is HMAC-SHA256 hashed (keyed with `JWT_SECRET`) and stored as the lookup key.

**`GET /api/secretenv` is intentionally unauthenticated** — designed for `curl` retrieval. The `Authorization` header carries the raw retrieval password (not a JWT). `secretLimiter` (20 req/5 min) prevents brute force. Without the correct password the content cannot be decrypted even if the DB is read directly. Do not add JWT auth middleware to this route.

---

## Image Handling

Uploads go through `utils/cloudinaryUpload.js` (multer + multer-storage-cloudinary) to Cloudinary folder `feelio/posts`. On success `req.file` contains Cloudinary's snake_case response fields.

`imageFormatter.js` handles two directions:
- `extractUploadedImageMetadata(req.file)` — converts Cloudinary's snake_case to camelCase for DB storage
- `normalizeExistingImage(dbImage)` — reads a DB image doc (may have legacy snake_case fields), regenerates optimized + thumbnail CDN URLs via SDK transforms, returns a consistent camelCase shape for API responses

`imageSchema.js` uses `strict: false` so legacy documents with `public_id`/`secure_url` fields still pass through `imageFormatter.js` without requiring a data migration.

---

## Error Handling

`ApiError` (`utils/ApiError.js`) is the single error class. Use its static factories everywhere:

```js
// Correct
throw ApiError.badRequest('Title is required');
throw ApiError.notFound('Post not found');
throw ApiError.unauthorized();

// Wrong — never do these
throw new ApiError('msg', 400);
throw new Error('Post not found');
```

`asyncHandler` wraps every controller. Thrown `ApiError` instances propagate to `errorHandler.js` which reads `err.statusCode`. In production the stack trace is stripped from the response but still logged to `console.error`.

`errorHandler.js` also checks `req.body.optimisticId` — if present, it echoes it back in the error response so the frontend can roll back an optimistic UI update.

---

## Patterns to Avoid

- Calling Mongoose directly from a service (`Post.find(...)` in a service is wrong — use `findPostsPaginated(...)` from the model)
- Calling `validate()` in a controller — belongs in the service
- Adding try-catch inside controllers — `asyncHandler` handles it
- Importing from `authMiddleware.js` — import from `verifyToken.js` directly
- Using `mongoose.model('Post')` anywhere outside `models/Post.js` — import the named function instead
- Adding a `GET /api/secretenv` auth middleware — the no-auth design is intentional
- Section comment dividers (`// ─────────`) or obvious comments (`// find the user`)
- Duplicating helper logic — check `utils/` before writing a new helper

---

## Environment Variables

Loaded by `config/environment.js`. In dev reads `backend/.env.development`; in production env vars are injected by Northflank.

| Variable | Purpose |
|----------|---------|
| `PORT` | Express listen port (default 3000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Signs 15-min access tokens; also used as HMAC key in secretenv |
| `REFRESH_TOKEN_SECRET` | Signs 7-day refresh tokens (falls back to `JWT_SECRET`) |
| `CLIENT_URL` | Dynamically added to CORS allowed origins |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `CLOUDINARY_KEY` | Cloudinary API key |
| `CLOUDINARY_SECRET` | Cloudinary API secret |
| `NODE_ENV` | `development` or `production` |

Run `node backend/test-env.js` to verify all required vars are set before starting.
