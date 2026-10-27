import dotenv from 'dotenv';
import tls from 'node:tls';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ApiError from '../utils/ApiError.js';

// Azure and Northflank inject env vars directly, no .env file there. Locally,
// `cd backend && npm run dev` and the Docker image start in different working
// directories, so the repo root comes from this file's location, not CWD. The
// root .env.development / .env.production are shared with the frontend and
// docker-compose's env_file, so there's no backend-only copy to drift.
const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.join(repoRoot, '.env.development') });
} else if (!process.env.MONGO_URI) {
  // only when vars aren't already set (local prod testing with `npm run start`
  // or docker-compose.prod.yml)
  dotenv.config({ path: path.join(repoRoot, '.env.production') });
}

const normalize = (value) => (typeof value === 'string' ? value.trim() : value);

// `Number('-5') || fallback` is still -5 (truthy), so a bad value quietly gives
// a future cutoff. A negative leaderboard age hides every score, and a negative
// test-user TTL deletes every matching account on the next cleanup.
const readPositiveInteger = (name, fallback) => {
  const raw = normalize(process.env[name]);
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw ApiError.internalServerError(`${name} must be a positive integer`);
  }
  return parsed;
};

const pistonUrl = normalize(process.env.PISTON_URL);
// prod Piston is TLS only. Local dev Piston (or none) is plain http and
// shouldn't crash the backend over it.
if (
  normalize(process.env.NODE_ENV) === 'production' &&
  pistonUrl &&
  !pistonUrl.startsWith('https://')
) {
  throw ApiError.internalServerError(
    'PISTON_URL must use https:// — the Piston deployment only accepts TLS',
  );
}

// Piston's cert is self-signed and pinned here instead of coming from a public
// CA (no per-instance renewal, see infra/piston.bicep). This uses
// tls.setDefaultCACertificates because Node only reads NODE_EXTRA_CA_CERTS at
// launch, so setting it here would do nothing. It appends to the default list,
// so it only adds a trust anchor and can't weaken checks for other hosts.
// Northflank's bulk .env import rejects multi-line secrets even when quoted, so
// there the PEM is one line with literal \n. Azure keeps real newlines. Turning
// \n back into newlines works for both (no-op on real newlines).
const pistonCaCert = normalize(process.env.PISTON_CA_CERT)?.replace(/\\n/g, '\n');
if (pistonCaCert) {
  tls.setDefaultCACertificates([...tls.getCACertificates('default'), pistonCaCert]);
}

// Only set on the Azure Container App, which can start and stop the Piston VM
// through its managed identity. Unset in local dev, CI and the Northflank
// failover, where the backend just reports whether Piston answers. The id goes
// into an ARM URL, so anything that isn't a plain VM resource id is rejected.
const VM_RESOURCE_ID_PATTERN =
  /^\/subscriptions\/[0-9a-f-]{36}\/resourceGroups\/[\w.()-]+\/providers\/Microsoft\.Compute\/virtualMachines\/[\w-]+$/i;
const pistonVmResourceId = normalize(process.env.PISTON_VM_RESOURCE_ID);
if (pistonVmResourceId && !VM_RESOURCE_ID_PATTERN.test(pistonVmResourceId)) {
  throw ApiError.internalServerError('PISTON_VM_RESOURCE_ID is not a virtual machine resource id');
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
    vmResourceId: pistonVmResourceId,
    controlClientId: normalize(process.env.PISTON_CONTROL_CLIENT_ID),
    idleMinutes: readPositiveInteger('PISTON_IDLE_MINUTES', 30),
    dailyLimitMinutes: readPositiveInteger('PISTON_DAILY_LIMIT_MINUTES', 480),
  },
  r2: {
    accountId: normalize(process.env.R2_ACCOUNT_ID),
    accessKeyId: normalize(process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: normalize(process.env.R2_SECRET_ACCESS_KEY),
    bucket: normalize(process.env.R2_BUCKET),
    publicUrl: normalize(process.env.R2_PUBLIC_URL)?.replace(/\/+$/, ''),
  },
  turnstile: {
    siteKey: normalize(process.env.TURNSTILE_SITE_KEY),
    secretKey: normalize(process.env.TURNSTILE_SECRET_KEY),
  },
  // hard cap on hosted-file storage. 9 GiB default keeps us a gigabyte under
  // R2's 10 GB free tier so we never get billed for going over
  hostedStorageLimitBytes: readPositiveInteger(
    'HOSTED_STORAGE_LIMIT_BYTES',
    9 * 1024 * 1024 * 1024,
  ),
  leaderboardMaxAgeDays: readPositiveInteger('LEADERBOARD_MAX_AGE_DAYS', 30),
  testUserTtlMinutes: readPositiveInteger('TEST_USER_TTL_MINUTES', 60),
};

const isProduction = environment.nodeEnv === 'production';

const defaultOrigins = [
  'https://mykal-steele.github.io',
  'https://www.mykal-steele.github.io',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174', // vite's fallback port
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
