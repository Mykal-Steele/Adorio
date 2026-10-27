// Where every managed secret lives, read by the rotator. For a normal rotation edit
// ROTATIONS in scripts/rotate-secrets.mjs instead. Only change this when a secret
// moves somewhere new.
//
// Per secret:
//   generate  'hex32' to auto-make a random value, or null to paste one by hand
//   files     local env files that contain the key (only existing lines get
//             rewritten, a missing key is never added)
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
  R2_ACCOUNT_ID: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { env: 'R2_ACCOUNT_ID' },
    note: 'Cloudflare account id that owns the R2 bucket; not a secret',
  },
  R2_ACCESS_KEY_ID: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { secret: 'r2-access-key-id' },
    note: 'R2 dashboard -> API -> Manage API Tokens -> create a bucket-scoped token',
  },
  R2_SECRET_ACCESS_KEY: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { secret: 'r2-secret-access-key' },
    note: 'shown once when the R2 token is created — create a new token if it was lost',
  },
  R2_BUCKET: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { env: 'R2_BUCKET' },
    note: 'bucket name; not a secret',
  },
  R2_PUBLIC_URL: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { env: 'R2_PUBLIC_URL' },
    note: "the bucket's public custom domain, e.g. https://files.adorio.space",
  },
  TURNSTILE_SITE_KEY: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { env: 'TURNSTILE_SITE_KEY' },
    note: 'Turnstile dashboard -> Add widget; the public site key',
  },
  TURNSTILE_SECRET_KEY: {
    generate: null,
    files: ['.env.development', '.env.production'],
    github: true,
    azure: { secret: 'turnstile-secret-key' },
    note: 'same Turnstile widget — the private secret key; blank disables the bot check',
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

// only in GitHub (deploy credentials) or the Northflank dashboard. There's nothing
// local to read them from, so the rotator won't touch them. Set these by hand.
export const NOT_MANAGED = {
  'AZURE_CLIENT_ID / AZURE_TENANT_ID / AZURE_SUBSCRIPTION_ID':
    'deploy identity — from `az identity show`, not a rotatable secret',
  'CLOUDFLARE_ZONE_ID / CLOUDFLARE_API_TOKEN':
    'Cloudflare dashboard, token scoped to Zone.Cache Purge',
  'Northflank failover env': 'separate dashboard, has its own copy of the runtime secrets',
};
