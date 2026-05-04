---
description: Security rules — OWASP Top 10 for this Node.js/Express + Next.js stack
---

# Security Rules

## Input Validation (OWASP A03 — Injection)

- Validate and sanitize ALL user input at the service boundary using Zod schemas
- Never interpolate user input directly into MongoDB queries — use Mongoose model methods which parameterize automatically
- Strip/reject unexpected fields — Zod `.strict()` on input schemas to reject unknown keys
- Never pass `req.body` directly to a Mongoose method

```js
// bad — mass assignment vulnerability
await User.findByIdAndUpdate(req.params.id, req.body)

// good — explicitly pick allowed fields via service + Zod validation
const updates = validate(UpdateUserSchema, req.body)
await updateUser(req.params.id, updates)
```

## Authentication (OWASP A07)

- JWT access tokens expire in 15 min; refresh tokens in 7 days — never extend these without reason
- Tokens live in `localStorage` (current architecture) — never log them, never include them in error responses
- Always verify token signature AND expiry — `verifyToken` middleware handles this
- The `SecretEnv` route (`GET /api/secretenv`) is intentionally unauthenticated — do not add auth middleware to it

## Authorization (OWASP A01 — Broken Access Control)

- Check ownership before mutating a resource (e.g., only the post author can delete their post)
- Don't rely solely on obscure IDs — always verify `req.user.id` matches the resource owner
- `isAdmin` middleware must be applied to any admin-only operation

```js
// bad — any authenticated user can delete any post
export const deletePost = asyncHandler(async (req, res) => {
  await postService.delete(req.params.id)
})

// good
export const deletePost = asyncHandler(async (req, res) => {
  await postService.delete(req.params.id, req.user.id)  // service verifies ownership
})
```

## Rate Limiting (OWASP A04 — Insecure Design)

Existing limits — don't remove or raise them:
- General: 300 req / 15 min
- Post creation: 30 req / 10 min
- Likes: 60 req / 1 min
- Secret message retrieval: 20 req / 5 min

New sensitive endpoints must have a rate limiter applied at the route level.

## Sensitive Data Exposure (OWASP A02)

- Never return password hashes, refresh tokens, or internal DB fields in API responses — use Mongoose `.select('-password')` or map to a safe DTO
- Never commit secrets — all credentials go in `.env` / `backend/.env`, which are `.gitignore`d
- Never log `MONGO_URI`, `JWT_SECRET`, or `CLOUDINARY_SECRET`

## Security Headers

- Helmet is configured in `backend/config/` — don't remove it or override restrictive defaults without reason
- CORS is configured via `CLIENT_URL` env var — never set `origin: '*'` in production

## Dependency Security

- Run `npm audit` before adding a new dependency; don't add packages with high-severity vulnerabilities
- Prefer packages with active maintenance and known provenance

## File Upload

- All uploads go through Cloudinary via `cloudinaryUpload` utility — never write user-uploaded files to disk directly
- Validate MIME type and file size before uploading (service layer, not just frontend)

## XSS (OWASP A03)

- Never use `dangerouslySetInnerHTML` without sanitizing with DOMPurify first
- Rely on React's default escaping for all dynamic content rendering
