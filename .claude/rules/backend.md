---
description: Node.js/Express backend rules for backend/
---

# Backend Rules

## Architecture: Controller → Service → Model → Schema

Every request flows through exactly these layers — no skipping, no mixing:

| Layer | Responsibility | Must NOT |
|---|---|---|
| Controller | Extract from `req`, call service, send response | Contain business logic, call DB, use Zod |
| Service | Business logic, validation, orchestration | Call Mongoose directly, touch `req`/`res` |
| Model | DB operations (CRUD, queries, aggregations) | Contain business logic, use Zod |
| Schema/DB | Mongoose schema definition | Contain logic |
| Schema/Validation | Zod shape for request payloads | Contain logic |

```js
// bad — logic leaking into controller
export const createPost = asyncHandler(async (req, res) => {
  if (req.body.content.length > 500) throw new Error('too long')  // ← business logic
  const post = await Post.create(req.body)  // ← direct Mongoose in controller
  res.json(post)
})

// good
export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.create(req.user.id, req.body)
  res.status(201).json(post)
})
```

## Error Handling

- Throw `ApiError` static factories — never `new Error()`, never plain strings
- Use `asyncHandler` on every controller — it catches thrown errors and forwards to Express error middleware
- No manual `try/catch` in controllers unless handling a specific recoverable case

```js
// bad
throw new Error('User not found')
res.status(404).json({ message: 'not found' })

// good
throw ApiError.notFound('User not found')
```

## Validation

- All request payload/query validation happens in services via `validate()` with a Zod schema from `schemas/validation/`
- Never define a Zod schema inline inside a service or controller — it belongs in `schemas/validation/`
- Validate at the service layer boundary, not in the controller

## REST API Design

- Resource names are plural nouns: `/api/posts`, `/api/users`, `/api/comments`
- HTTP method conveys the action — no verbs in URLs: `/api/posts/:id/like` not `/api/likePost`
- Use correct status codes:
  - `200` OK, `201` Created, `204` No Content
  - `400` Bad Request (validation), `401` Unauthorized (no/bad token), `403` Forbidden (valid token, wrong permissions), `404` Not Found, `409` Conflict
  - `500` only for unexpected server errors (these should be rare and get fixed)
- Return consistent JSON shapes — `{ data: ... }` for success, `{ message: ... }` for errors

## Authentication Middleware

Three variants — pick the right one:
- `verifyToken` / `protect` — strict: rejects unauthenticated requests (use on write endpoints)
- `optional` — attaches `req.user` if token present but doesn't reject guests (use on read endpoints that behave differently for logged-in users)
- `isAdmin` — requires auth + admin role

## Route Organization

- Group routes by resource in `routes/` — one file per resource
- Keep route files thin: just `router.method(path, middleware, controller)`
- Rate limiters are applied at the route level, not inside controllers

## ES Modules

- All files use ES Module syntax (`import`/`export`) — the package is `"type": "module"`
- Always include `.js` extension on relative imports (Node ESM requirement, even though source is `.ts`)
- No `require()` or `module.exports`

## Logging / Monitoring

- Use the `monitoring` utility from `backend/utils/monitoring` — don't `console.log` directly in production code
- Never log sensitive data (tokens, passwords, full request bodies containing credentials)
