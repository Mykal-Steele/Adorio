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

## Prisma

- `bun run prisma:generate`
- `bun run prisma:migrate`
- `bun run prisma:studio`

## Docker

- `bun run docker:build`
- `bun run docker:run`
- `bun run docker:logs`
