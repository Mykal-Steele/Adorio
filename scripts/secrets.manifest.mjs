// Where every managed secret lives. This is the map the rotator reads — it is
// not something you edit for a normal rotation (edit the ROTATIONS block in
// scripts/rotate-secrets.mjs instead). Only touch this when a secret starts or
// stops living somewhere new.
//
// Per secret:
//   generate  'hex32' to auto-make a random value, or null to paste one by hand
//   files     local env files that contain the key (only existing lines are
//             rewritten — a key that isn't already in a file is never added)
//   github    whether to push it as a GitHub Actions repo secret
//   azure     { secret: '<name>' } for a Container App secret, or
//             { env: '<NAME>' } for a plain Container App env var, or null
//   note      human reminder shown in every run

export const SECRETS = {
  MONGO_URI: {
    generate: null,
    files: ['.env.development', '.env.production', 'backend-go/.env'],
    github: true,
    azure: { secret: 'mongo-uri' },
    note: 'rotate the Atlas db user password first, then copy the new driver string here',
  },
  JWT_SECRET: {
    generate: 'hex32',
    files: ['.env.development', '.env.production', 'backend-go/.env'],
    github: true,
    azure: { secret: 'jwt-secret' },
    note: 'rotating signs out every access token (15 min) — harmless, they just re-auth',
  },
  REFRESH_TOKEN_SECRET: {
    generate: 'hex32',
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { secret: 'refresh-token-secret' },
    note: 'rotating signs out every logged-in user — do this deliberately',
  },
  CLIENT_URL: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { env: 'CLIENT_URL' },
    note: 'not actually secret — the CORS origin, e.g. https://adorio.space',
  },
  CLOUDINARY_NAME: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { env: 'CLOUDINARY_NAME' },
    note: 'cloud name, not secret; the public name is also baked into the frontend build',
  },
  CLOUDINARY_KEY: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { secret: 'cloudinary-key' },
    note: 'cloudinary dashboard -> API Keys',
  },
  CLOUDINARY_SECRET: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { secret: 'cloudinary-secret' },
    note: 'cloudinary dashboard -> API Keys',
  },
  CLOUDINARY_URL: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { secret: 'cloudinary-url' },
    note: 'cloudinary dashboard -> API Keys -> API environment variable',
  },
  RESEND_API_KEY: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: false,
    azure: { secret: 'resend-api-key' },
    note: 'not used by CI integration tests, so GitHub is skipped',
  },
  PISTON_URL: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { secret: 'piston-url' },
    note: 'changes only if the Piston VM is recreated (piston.bicep output)',
  },
  PISTON_TOKEN: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { secret: 'piston-token' },
    note: 'must match the token baked into the Piston VM — changing it also needs a piston.bicep redeploy; not auto-rotated',
  },
  PISTON_CA_CERT: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { secret: 'piston-ca-cert' },
    note: 'tied to the Piston TLS keypair (infra/.secrets), not an independent secret',
  },
  VITE_GEMINI_API_KEY: {
    generate: null,
    files: [
      '.env',
      '.env.development',
      '.env.production',
      'ai-slop/AI-Slop-For-CAO-exam/.env.development',
    ],
    github: true,
    azure: null,
    note: 'build-time only — CI bakes it into the frontend image, never a runtime env var',
  },
  AUDIT_PASSWORD: {
    generate: 'hex32',
    files: ['scripts/.env'],
    github: false,
    azure: null,
    note: 'only used by scripts/encrypt-report.mjs',
  },
};

// Secrets that exist only in GitHub (deploy credentials) or only in the
// Northflank failover dashboard. Nothing local to read them from, so the
// rotator deliberately refuses to touch them — set these by hand.
export const NOT_MANAGED = {
  'AZURE_CLIENT_ID / AZURE_TENANT_ID / AZURE_SUBSCRIPTION_ID':
    'deploy identity — from `az identity show`, not a rotatable secret',
  'CLOUDFLARE_ZONE_ID / CLOUDFLARE_API_TOKEN':
    'Cloudflare dashboard, token scoped to Zone.Cache Purge',
  'Northflank failover env': 'separate dashboard, has its own copy of the runtime secrets',
};
