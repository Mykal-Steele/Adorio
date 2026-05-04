---
description: Next.js 16 App Router rules for src/
---

# Next.js App Router Rules

## Server vs Client Components

- Default to Server Components — they render on the server, reduce JS bundle, can `await` directly
- Add `'use client'` only when you need: `useState`, `useEffect`, `useRef`, event handlers, browser APIs, or third-party client libs
- `'use client'` marks a boundary, not the whole tree — push it as deep (leaf-ward) as possible
- **Never** use `dynamic({ ssr: false })` except for: CodeMirror, RyGame canvas, Recharts in DataLookup

```tsx
// bad — entire page is client just for one interactive button
'use client'
export default function Page() {
  const data = ...  // loses server-side benefits
}

// good — keep page as Server Component, isolate interactivity
// page.tsx (Server Component)
export default async function Page() {
  const data = await serverFetch(...)
  return <Layout><InteractiveButton /></Layout>
}
// InteractiveButton.tsx
'use client'
export function InteractiveButton() { ... }
```

## Data Fetching

- Use `src/lib/serverFetch.ts` for all SSR data fetching — it reads `BACKEND_INTERNAL_URL` automatically
- In Server Components, `await` data directly — no `useEffect` + `useState` fetch pattern
- For Suspense streaming (like `/social`), make the async Server Component the leaf that suspends, not the parent

## Route Groups

- `(public)` — no navbar (portfolio routes)
- `(with-navbar)` — has navbar
- `(with-navbar)/(protected)` — auth-gated; `layout.tsx` reads Redux and redirects to `/login?redirect=<pathname>` if unauthenticated
- Don't add routes to the wrong group — portfolio pages must stay in `(public)`, social pages in `(with-navbar)`

## Navigation

- Use `useRouter().push()` from `next/navigation` for programmatic navigation — never `window.location`
- Use `<Link>` for anchor navigation — automatic prefetching, no full reload
- Pass route params as props to components; don't access `routeContext` directly

## API Calls from Client

- All Axios requests use the relative `/api` base URL — never hardcode `localhost:3000` in frontend code
- Import the shared Axios instance from `src/api/index.ts` — never create a separate `axios.create()` per file

## State

- Redux Toolkit is for auth state only (`userSlice` / `isAuthLoading`)
- All other state is local component state (`useState`) or URL state (search params)
- Don't reach for Redux for UI state, form state, or server cache

## Images

- Use `next/image` (`<Image>`) for all images — automatic WebP, lazy loading, size optimization
- For Cloudinary images, use the Cloudinary URL directly as `src` with appropriate `width`/`height`

## Performance

- Don't import heavy libraries at the module level in `'use client'` files if they're only needed conditionally
- Keep `loading.tsx` and `error.tsx` files co-located with routes that need them
- The portfolio shell (`PortfolioShell`) stays mounted across navigations — don't unmount it by restructuring the layout hierarchy
