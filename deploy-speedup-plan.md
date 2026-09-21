# Deploy Speedup Plan — push-to-live faster

Date: 2026-09-16
Status: P1, P2, P6, and P3 implemented (see `chore/deploy-speedup`). P4 and
P5 still just proposed — P4 needs an explicit call on CI safety guarantees,
P5 needs a way to track "last successfully deployed sha" that doesn't exist
yet.
Scope: `.github/workflows/ci.yml` + `Dockerfile` + `.dockerignore` only. No app code changes.

## 1. Where time goes now

Last successful deploy job: **3m27s (207s)**. Note: push-to-live is longer,
roughly 8–12 min, because `deploy` is gated on `format + lint + build + integration`.

Deploy job breakdown (from PR #64 run #158 logs):

| Step | Time | Share |
| ---- | ---- | ----- |
| `az acr build` | 2m54s (174s) | 84% |
| `containerapp update` | 18s | 9% |
| checkout + setup-node + wait-for-url + cleanup | ~15s | 7% |

Inside `az acr build` (~174s total):

| Work | Time |
| ---- | ---- |
| context pack + upload 61 MiB, 81 MB to daemon | ~10–15s |
| root `npm ci` | 31s |
| `next build` (compile 14.6s + static gen 2.1s) | ~17s |
| ai-slop `npm ci` 7s + `vite build` 4.9s | ~12s |
| backend `npm ci --only=production` | 4s |
| `node:24-alpine` pull x3, `apk add nginx`, copies, push 12s, ACR queue/wait | ~90s overhead |

End-to-end pipeline duplication per push to main:

1. `build` job: `npm ci` + `next build`
2. `integration` job: full prod docker build + Puppeteer
3. `deploy` job: `az acr build` again from scratch (no cache)

So we pay for ~3 full builds per push.

## 2. Proposals (biggest win first)

### P1. Shrink build context (~10s, trivial risk)

`.dockerignore` currently misses the big dirs. ACR packs 61 MiB per build.
Add:

```
.next
backend-go/
__tests__/
coverage/
reports/
dist/
.next/
.turbo/
*.log
ai-slop/**/node_modules
ai-slop/**/dist
.github/
scripts/
.husky/
```

Expected: context drops to <10 MB, upload 10–15s → ~2s.
Also reduces "Sending build context to Docker daemon 81 MB" time.

### P2. Fix Dockerfile layer-cache invalidation (~30s on no-dep-change pushes, low risk)

Correction: `build-nextjs` and `build-ai-slop` already copy their
`package*.json` and run `npm ci` before `COPY . .` — that part of the
Dockerfile is fine as-is, no reorder needed there.

The actual invalidation is in the **runtime stage**: it does
`COPY ./backend /app/backend` (all backend source, including
`package.json`) and only then runs `npm ci --only=production` — so any
backend source edit (not just a dependency change) busts that install's
cache. Fix by splitting the copy:

```dockerfile
# Express backend
COPY ./backend/package*.json /app/backend/
WORKDIR /app/backend
RUN npm ci --omit=dev --prefer-offline --no-audit --no-fund
COPY ./backend /app/backend
```

Combine the 5x single-line `ENV` into one `ENV` to cut layers.

Caution: keep `PUPPETEER_SKIP_DOWNLOAD=1` where it is.

### P3. Turn on build caching (30–60s, medium risk)

Every push currently rebuilds from scratch: re-pulls `node:24-alpine` 3x,
re-runs all `npm ci`.

Correction: `az acr build` has no `--cache-from` flag in the current Azure
CLI reference — the (a) option below as originally written would fail
before the build even starts. ACR Tasks doesn't expose a registry-cache
flag through `az acr build`; the only realistic options are:

- (a) Move the build to the GitHub runner with `docker buildx` —
  `cache-from: type=registry` / `cache-to: type=inline` (or `type=gha`),
  then `docker push` to `adorioacr.azurecr.io`. Skips tar-upload + ACR
  queue + cold agent. Typically 40–60s faster than ACR Tasks, and is the
  only option here that actually gets layer caching.
- (b) Stay on ACR Tasks with no build cache (current behavior) and accept
  the ~90s image-layer overhead as a fixed cost.

Recommend (a) directly — there's no working "minimal" ACR-Tasks-only
caching path to try first.

### P4. Stop building 3x per push (biggest end-to-end win, needs decision)

`deploy.needs: integration`, `integration.needs: build`. Push-to-live ≈
format + lint + build + integration (docker prod build + Puppeteer, 5–10 min)
+ deploy (3.5 min).

Options:

- (a) Run `integration` on `pull_request` only; on `push` to main run
  `build` → `deploy` directly. Cuts push-to-live to ~3–4 min.
- (b) Keep gate but make `format/lint/build` parallel (already are) and let
  `deploy` skip redundant `next build` by reusing the `build` job artifact.
- (c) Path filters: skip `deploy` when only `*.md` or `docs/**` change.
  Do not add `ai-slop/**` to this skip list — it's a real deployable
  artifact (served at `/cao/`), so an ai-slop-only push still needs to
  reach production; P5 below reuses the prebuilt ai-slop bundle only when
  the diff has no `ai-slop/**` changes, which is a separate thing from
  skipping deploy entirely.

This changes CI safety guarantees — needs explicit approval.

### P5. Skip ai-slop rebuild when untouched (~12s, low risk)

ai-slop rarely changes but costs ~12s every push (7s install + 5s vite).
If `git diff --name-only` shows no `ai-slop/**` change, reuse the last
built ai-slop bundle instead of rebuilding it.

Correction: the workflow only ever publishes `adorio:${{ github.sha }}` —
there is no `adorio:latest` tag being maintained, so
`COPY --from=adorioacr.azurecr.io/adorio:latest ...` would either fail
(no such tag) or, if something else happens to publish `latest`, silently
mix a stale ai-slop bundle with the current app code. Reference the
previous deploy's actual sha instead (e.g. pass the last successfully
deployed `github.sha` in as a workflow input/repo variable, or read it
back from the running Container App's current image) so the reused layer
is a known-good, specific revision:

```dockerfile
ARG PREVIOUS_IMAGE_SHA
COPY --from=adorioacr.azurecr.io/adorio:${PREVIOUS_IMAGE_SHA} /usr/share/nginx/html/cao/ /usr/share/nginx/html/cao/
```

instead of rebuilding the `build-ai-slop` stage. Implement as separate
tagged stage or conditional step in workflow.

### P6. Small cleanups (~10s total, trivial)

- Correction: keep `actions/setup-node` in `deploy`. The job runs
  `node scripts/wait-for-url.cjs`, and `package.json` pins
  `engines.node: >=24.0.0` — the GitHub-hosted runner's system Node isn't
  guaranteed to satisfy that, so dropping this step risks the deploy
  breaking on a runner image update rather than saving the ~6s.
- Pin base image: `FROM node:24-alpine@sha256:<digest>` so Docker skips the
  pull check 3x per build. Update digest monthly via Dependabot/renovate.
- Correction: don't swap the runtime stage to a plain `nginx:alpine`-derived
  base — `/start.sh` runs `node /app/backend/index.js` and
  `node /nextjs/server.js` alongside nginx, so the runtime image needs
  Node too. Either keep the current `node:24-alpine` base and accept the
  `apk add nginx` cost, or use a base that ships both nginx and Node (or
  installs Node explicitly on top of `nginx:alpine`).
- Leave `containerapp update` (18s) and `wait-for-url` (1s, 2s poll) alone —
  mostly Azure control-plane, not worth optimizing.

## 3. Expected outcome

| Change set | Deploy job | Push-to-live |
| ---------- | ---------- | ------------ |
| now | 3m27s | ~8–12 min |
| P1 + P2 + P6 only | ~2m–2m20s | ~7–10 min (gate unchanged) |
| + P3 cache | ~1m–1m30s | ~5–7 min |
| + P4 ungate integration | ~1m–1m30s | ~3–4 min |

## 4. Suggested implementation order

1. P1 (.dockerignore) — 5 min, zero behavior change.
2. P2 (backend-copy split in the runtime stage) — verify with one
   `docker build` locally + one `az acr build` on a branch.
3. P6 (pin node digest; keep setup-node and the node:24-alpine runtime base).
4. P5 (conditional ai-slop, revision-pinned) if ai-slop-untouched pushes are common.
5. P4 (CI gating) only after team agrees on safety tradeoff.
6. P3 (buildx on the runner with registry/gha cache) if the ACR Tasks
   queue remains the bottleneck — there's no lighter-weight ACR-only
   caching option to try first.

## 5. Verification per step

- `az acr build --registry adorioacr --image adorio:<sha> .` still succeeds.
- `az containerapp update` + `scripts/wait-for-url.cjs .../api/health` green.
- Compare "Sending context" size and per-step times in ACR logs before/after.
- No change to runtime behavior: same `nginx.production.conf` selection via
  `$ENV` build arg, same `/api/* → :3000`, `/* → :3001`, `/cao/*` static routing.

## 6. Open questions (for later review)

- Are we OK running integration on PRs only and deploying straight after build on main? (P4)
- Keep ACR Tasks with no build cache (simpler auth, slower) or move to
  runner buildx + push (faster, gets real layer caching, needs ACR login
  handling on the runner)? (P3)
- How often does ai-slop actually change, and is tracking "the last
  successfully deployed sha" for the reuse step worth the added
  workflow-state complexity? (P5)
