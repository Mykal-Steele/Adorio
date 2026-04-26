# Adorio

Social media app. Live at [adorio.space](https://adorio.space).

**Stack:** Next.js 16 (App Router) + Express + MongoDB + Nginx in Docker.

## Run locally

```bash
npm install
npm run dev:full       # frontend :3001 + backend :3000
```

After switching between Windows ↔ Linux:
```bash
node scripts/sync-platform-deps.cjs
```

## Docker

```bash
docker compose up --build                              # dev, port 8080
docker compose -f docker-compose.prod.yml up --build  # prod, port 8080
```

## Build

```bash
npm run build
```

## Code quality

```bash
npm run format        # prettier fix
npm run format:check  # prettier check (CI)
npm run lint
```

## Tests

```bash
npm run test:dev   # integration against dev containers
npm run test:prod  # integration against prod containers
```

## Environment variables

**Frontend:**

| Variable | Purpose |
|---|---|
| `BACKEND_INTERNAL_URL` | SSR → Express URL (`http://localhost:3000`) |
| `NEXT_PUBLIC_CLOUDINARY_NAME` | Cloudinary cloud name |

**Backend** (`backend/.env`):

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas URI |
| `JWT_SECRET` | Access token signing key |
| `REFRESH_TOKEN_SECRET` | Refresh token key (falls back to `JWT_SECRET`) |
| `CLIENT_URL` | CORS origin |
| `CLOUDINARY_NAME` / `CLOUDINARY_KEY` / `CLOUDINARY_SECRET` / `CLOUDINARY_URL` | Cloudinary |

**Docker build args:**

| Arg | Values |
|---|---|
| `ENV` | `development` or `production` |
| `VITE_GEMINI_API_KEY` | Gemini key for the AI sidecar at `/cao/` |

## License

AGPL-3.0. [Details](https://www.gnu.org/licenses/agpl-3.0.en.html)
