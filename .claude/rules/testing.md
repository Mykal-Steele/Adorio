---
description: Integration testing rules — Puppeteer tests against Docker containers
---

# Testing Rules

## What Exists

Tests are Puppeteer-based end-to-end integration tests in `__tests__/`. They run against real Docker containers (no mocks). There are two modes:
- `npm run test:dev` — dev containers
- `npm run test:prod` — prod containers (used in CI before deploy)

## Core Principle: No Mocks for Infrastructure

Don't mock the database, the HTTP server, or the Express app in integration tests. The whole point is to test the real stack. A test that passes against a mock can hide issues that only appear when the real DB, real Nginx, and real container networking are involved.

## What to Test

Focus integration tests on the golden path of critical user flows:
- Auth: register, login, token refresh, protected route access
- Posts: create, read feed, like, comment
- Profile: view, update
- Any new feature that involves a full request → DB → response round trip

Don't write integration tests for pure utility functions or pure UI rendering — those don't benefit from the full container stack.

## Test Structure

```js
// One describe block per feature area
describe('Auth', () => {
  // Setup once for the block if possible — avoid per-test container restarts
  beforeAll(async () => { ... })
  afterAll(async () => { ... })

  it('should register a new user and return JWT', async () => { ... })
  it('should reject login with wrong password', async () => { ... })
})
```

- Test names should read like requirements: "should [do thing] when [condition]"
- Each test should be independent — don't rely on state set by a previous test in the same file (use `beforeEach` setup or self-contained fixtures)

## Adding New Tests

When adding a new backend endpoint or frontend flow:
1. Add the happy-path test first
2. Add at least one failure/edge-case test (bad input, missing auth, not found)
3. Run `npm run test:prod` locally before pushing to verify

## CI Behavior

Integration tests run against `docker-compose.prod.yml` in CI — the same config as production. If a test passes locally in dev containers but fails in CI, the prod Docker config (Nginx, env vars, HTTPS) is usually the difference.

## Timeouts

- The health-check poller waits up to 240 seconds for prod containers — don't reduce this; the image build inside CI can be slow
- Individual Puppeteer tests should have sensible timeouts (default Jest/Puppeteer timeout is usually fine; override only for known-slow operations)
