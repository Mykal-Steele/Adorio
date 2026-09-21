# Deploy Speedup Plan — push-to-live faster

Date: 2026-09-16
Status: proposed, not implemented
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

Current `build-nextjs` stage does `COPY . .` before `npm ci`, so any file
change busts the npm cache. Reorder to:

```dockerfile
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --prefer-offline --no-audit --no-fund
COPY src ./src
COPY backend ./backend
COPY public ./public
# ... only files next build actually needs
```

Same for `build-ai-slop` stage (package files first, source second).
Combine the 5x single-line `ENV` into one `ENV` to cut layers.
Change `npm ci --only=production` → `npm ci --omit=dev --prefer-offline --no-audit --no-fund`.

Caution: keep `PUPPETEER_SKIP_DOWNLOAD=1` where it is.

### P3. Turn on build caching (30–60s, medium risk)

Every push currently rebuilds from scratch: re-pulls `node:24-alpine` 3x,
re-runs all `npm ci`. Two options:

- (a) Minimal, keep ACR Tasks:
  `az acr build --cache-from adorioacr.azurecr.io/adorio:latest ...`
  plus `--build-arg BUILDKIT_INLINE_CACHE=1` on first seeded build.
- (b) Faster, move build to GitHub runner:
  `docker buildx` with `cache-from: type=registry` / `cache-to: type=inline`
  (or `type=gha`), then `docker push`. Skips tar-upload + ACR queue +
  cold agent. Typically 40–60s faster than ACR Tasks.

Recommend (a) first, measure, then (b) if still slow.

### P4. Stop building 3x per push (biggest end-to-end win, needs decision)

`deploy.needs: integration`, `integration.needs: build`. Push-to-live ≈
format + lint + build + integration (docker prod build + Puppeteer, 5–10 min)
+ deploy (3.5 min).

Options:

- (a) Run `integration` on `pull_request` only; on `push` to main run
  `build` → `deploy` directly. Cuts push-to-live to ~3–4 min.
- (b) Keep gate but make `format/lint/build` parallel (already are) and let
  `deploy` skip redundant `next build` by reusing the `build` job artifact.
- (c) Path filters: skip `deploy` when only `*.md`, `docs/**`, `ai-slop/**`
  (for backend-only changes use prebuilt ai-slop, see P5).

This changes CI safety guarantees — needs explicit approval.

### P5. Skip ai-slop rebuild when untouched (~12s, low risk)

ai-slop rarely changes but costs ~12s every push (7s install + 5s vite).
If `git diff --name-only` shows no `ai-slop/**` change, reuse last image:

```dockerfile
COPY --from=adorioacr.azurecr.io/adorio:latest /usr/share/nginx/html/cao/ /usr/share/nginx/html/cao/
```

instead of rebuilding the `build-ai-slop` stage. Implement as separate
tagged stage or conditional step in workflow.

### P6. Small cleanups (~10s total, trivial)

- Remove `actions/setup-node` from `deploy` job. It is unused there
  (only `az` + `node scripts/wait-for-url.cjs` run; system node suffices).
  Saves ~6s.
- Pin base image: `FROM node:24-alpine@sha256:<digest>` so Docker skips the
  pull check 3x per build. Update digest monthly via Dependabot/renovate.
- Replace `RUN apk add --no-cache nginx` (~5s + layer) with a prebuilt
  runtime base or `nginx:alpine`-derived stage.
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
2. P2 (Dockerfile ordering + npm flags) — verify with one
   `docker build` locally + one `az acr build` on a branch.
3. P6 (drop setup-node in deploy, pin node digest).
4. P3a (`--cache-from`), measure two pushes.
5. P5 (conditional ai-slop) if ai-slop untouched pushes are common.
6. P4 (CI gating) only after team agrees on safety tradeoff.
7. P3b (buildx on runner) if ACR Tasks queue remains the bottleneck.

## 5. Verification per step

- `az acr build --registry adorioacr --image adorio:<sha> .` still succeeds.
- `az containerapp update` + `scripts/wait-for-url.cjs .../api/health` green.
- Compare "Sending context" size and per-step times in ACR logs before/after.
- No change to runtime behavior: same `nginx.production.conf` selection via
  `$ENV` build arg, same `/api/* → :3000`, `/* → :3001`, `/cao/*` static routing.

## 6. Open questions (for later review)

- Are we OK running integration on PRs only and deploying straight after build on main? (P4)
- Keep ACR Tasks (simpler auth) or move to runner buildx + push (faster, needs ACR login handling)? (P3)
- How often does ai-slop actually change — worth the conditional logic? (P5)
