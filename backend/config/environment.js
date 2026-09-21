import dotenv from 'dotenv';
import tls from 'node:tls';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ApiError from '../utils/ApiError.js';

// Cloud platforms (Azure Container Apps, Northflank) inject env vars directly —
// no .env file involved there. Locally, both native `cd backend && npm run dev`
// and the Docker image start from different working directories, so this
// resolves the repo root from this file's own location instead of relying on
// CWD. The root .env.development / .env.production are the single source of
// truth for local dev — shared with the frontend and with docker-compose's
// env_file, instead of a separate backend-only copy that drifts out of sync.
const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.join(repoRoot, '.env.development') });
} else if (!process.env.MONGO_URI) {
  // Only load a file if environment variables aren't already set (local
  // production testing via `npm run start` / docker-compose.prod.yml)
  dotenv.config({ path: path.join(repoRoot, '.env.production') });
}

const normalize = (value) => (typeof value === 'string' ? value.trim() : value);

const pistonUrl = normalize(process.env.PISTON_URL);
// Only enforced in production — the deployed Piston instance is TLS-only, but
// a local dev Piston (or none at all) shouldn't crash the whole backend over
// a scheme check that has nothing to do with the rest of the app.
if (
  normalize(process.env.NODE_ENV) === 'production' &&
  pistonUrl &&
  !pistonUrl.startsWith('https://')
) {
  throw ApiError.internalServerError(
    'PISTON_URL must use https:// — the Piston deployment only accepts TLS',
  );
}

// Piston's cert is self-signed and pinned here rather than issued by a public
// CA (no per-instance renewal, works cleanly behind an autoscaled LB — see
// infra/piston.bicep). tls.setDefaultCACertificates (not NODE_EXTRA_CA_CERTS,
// which Node only reads once at process launch — setting it from process.env
// here has no effect) extends the trust store at runtime. Appending to the
// existing default list, rather than replacing it, means this only adds a
// trust anchor; it can't weaken certificate verification for any other host.
// Some hosts (Northflank's bulk .env import, notably) reject a secret value
// that spans multiple physical lines, even quoted — the only way to store a
// PEM cert there is as one line with literal \n sequences. Azure Container
// App secrets store real newlines fine. Un-escaping \n here (a no-op if the
// value already has real newlines) makes both work without caring which host
// this runs on.
const pistonCaCert = normalize(process.env.PISTON_CA_CERT)?.replace(/\\n/g, '\n');
if (pistonCaCert) {
  tls.setDefaultCACertificates([...tls.getCACertificates('default'), pistonCaCert]);
}

const environment = {
  nodeEnv: normalize(process.env.NODE_ENV) || 'development',
  port: normalize(process.env.PORT) || 3000,
  mongoUri: normalize(process.env.MONGO_URI),
  jwtSecret: normalize(process.env.JWT_SECRET),
  refreshTokenSecret:
    normalize(process.env.REFRESH_TOKEN_SECRET) || normalize(process.env.JWT_SECRET),
  clientUrl: normalize(process.env.CLIENT_URL),
  viteBackendUrl: normalize(process.env.VITE_BACKEND_URL),
  cloudinary: {
    name: normalize(process.env.CLOUDINARY_NAME),
    key: normalize(process.env.CLOUDINARY_KEY),
    secret: normalize(process.env.CLOUDINARY_SECRET),
  },
  piston: {
    url: pistonUrl,
    token: normalize(process.env.PISTON_TOKEN),
  },
  leaderboardMaxAgeDays: Number(normalize(process.env.LEADERBOARD_MAX_AGE_DAYS)) || 30,
  testUserTtlMinutes: Number(normalize(process.env.TEST_USER_TTL_MINUTES)) || 60,
};

const isProduction = environment.nodeEnv === 'production';

const defaultOrigins = [
  'https://mykal-steele.github.io',
  'https://www.mykal-steele.github.io',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174', // In case vite uses alternate port
  'https://adorio.space',
  'http://adorio.space',
  'https://www.adorio.space',
  'https://adorio.vercel.app',
  'http://127.0.0.1:5173',
  'http://103.253.145.214',
  'http://163.47.9.93',
];

const dynamicOrigins = [environment.clientUrl, environment.viteBackendUrl].filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...dynamicOrigins])];

export { environment, allowedOrigins, isProduction };
