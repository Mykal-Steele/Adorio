---
description: TypeScript rules for the full monorepo (src/, backend/, ai-slop/)
---

# TypeScript Rules

## Strictness

- `strict: true` is set in `tsconfig.json` — never disable it or use `@ts-ignore` without a comment explaining why
- Never use `any`; use `unknown` and narrow with type guards, or let TypeScript infer
- Never use non-null assertion (`!`) when you can narrow with a condition

## Types vs Interfaces

- Use `type` for unions, intersections, mapped types, and React props
- Use `interface` only when you need declaration merging (rare)
- Don't re-declare types that TypeScript can infer — trust inference

```ts
// bad
const getUser = (id: string): Promise<User> => { ... }  // return type obvious from impl

// good
const getUser = (id: string) => fetchUser(id)
```

## Naming

- Types and interfaces: `PascalCase`
- Variables, functions, methods: `camelCase`
- Constants (module-level, truly immutable): `SCREAMING_SNAKE_CASE`
- Files: `camelCase.ts` for utilities, `PascalCase.tsx` for components
- No leading/trailing underscores — they signal "private" but TypeScript has `private`

## Functions

- Prefer named function declarations at module level, arrow functions for callbacks/inline
- Max 3 parameters — group related params into an object beyond that
- Keep functions under ~40 lines; if longer, it's probably doing two things

## Imports

- Use `type` imports for type-only imports: `import type { User } from './types'`
- Backend uses ES Modules (`"type": "module"`) — always use `.js` extension in relative imports even for `.ts` source files (Node ESM requirement)

```ts
// backend — correct
import { createUser } from './services/userService.js'

// src/ — correct (Next.js resolves without extension)
import { createUser } from './services/userService'
```

## Enums

- Prefer `const` object + `as const` + union type over `enum` — enums produce runtime code and have footguns

```ts
// bad
enum Status { Active, Inactive }

// good
const Status = { Active: 'active', Inactive: 'inactive' } as const
type Status = typeof Status[keyof typeof Status]
```

## Error handling

- Never swallow errors silently (`catch (e) {}`)
- In the backend, throw `ApiError` instances — never plain `Error` or plain strings
- In frontend API functions, let the Axios interceptor handle errors; no manual `try/catch` unless handling a specific case (like the debounced like toggle)
