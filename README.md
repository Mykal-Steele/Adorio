# New-Adorio

Next.js app with two main routes:

- `/`: portfolio-style home board
- `/social`: community board with posts, comments, votes, and attachments

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Prisma
- Tailwind CSS
- Vitest + Testing Library

## Scripts

- `bun run dev`: start local dev server
- `bun run build`: production build
- `bun run start`: run built app
- `bun run lint`: run ESLint
- `bun run typecheck`: run TypeScript checks
- `bun run test`: run tests once
- `bun run test:watch`: run tests in watch mode
- `bun run docker:dev:up`: run local dev in Docker
- `bun run docker:prod:up`: run production stack (app + nginx)

## Prisma

- `bun run prisma:generate`
- `bun run prisma:migrate`
- `bun run prisma:studio`

## Docker

- `bun run docker:build`
- `bun run docker:run`
- `bun run docker:logs`

### Dev vs Prod

- Dev uses `docker-compose.dev.yml` and runs Next.js with hot reload on port `3000`.
- Prod uses `docker-compose.yml` and runs:
  - Next.js standalone app container on internal port `3000`
  - Nginx reverse proxy on port `80`

Commands:

- `bun run docker:dev:up`
- `bun run docker:dev:down`
- `bun run docker:prod:up`
- `bun run docker:prod:down`

### Nginx (Prod)

- Proxies all traffic to the Next.js app service.
- Caches `/_next/static` aggressively.
- Includes basic security headers and a health endpoint at `/nginx-health`.
