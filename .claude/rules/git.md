---
description: Git workflow and commit message conventions
---

# Git Workflow

## Branching

- `main` is the production branch — every push to `main` triggers the full CI pipeline and deploys to the DO droplet if all checks pass
- Work on a feature branch; open a PR to `main`
- Branch names: `type/short-description` — e.g. `feat/add-comment-reactions`, `fix/auth-token-refresh`, `chore/update-deps`

## Commit Messages — Conventional Commits

Format: `<type>(<scope>): <subject>`

```
feat(auth): add Google OAuth login
fix(posts): prevent duplicate like on rapid clicks
chore(deps): bump next from 15.3.0 to 16.0.0
refactor(backend): extract email service from userService
docs(claude): update deployment info to DO droplet
```

**Types:**
| Type | When to use |
|---|---|
| `feat` | New feature visible to users |
| `fix` | Bug fix |
| `refactor` | Code change that's neither a feature nor a fix |
| `chore` | Build, deps, config, CI — no production code change |
| `docs` | Documentation only |
| `style` | Formatting, whitespace — no logic change |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |

**Subject line rules:**
- Imperative mood: "add" not "added" or "adds"
- No capital letter at start
- No period at the end
- Under 72 characters

**Breaking changes:** add `!` after the type/scope and a `BREAKING CHANGE:` footer:
```
feat(api)!: rename /api/users/:id/posts to /api/users/:id/feed

BREAKING CHANGE: clients must update their API calls
```

## CI Pipeline

All of these must pass before merging to `main`:
1. Format check (`npm run format:check`)
2. Lint (`npm run lint`)
3. TypeScript + build
4. Integration tests against prod containers

Never push directly to `main` to skip CI — the pipeline also gates the deploy.

## Husky Hooks

Pre-commit hooks run automatically (`npm run lint` + `npm run format:check`). If a hook fails, fix the issue rather than bypassing with `--no-verify`.
