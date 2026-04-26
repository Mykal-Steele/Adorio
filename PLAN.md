}                                                                        
                                                                                                                                                                        
  Protected layout (no cookies needed):                                                                                                                                 
  'use client'                                                                                                                                                        
  // reads isAuthLoading + token from Redux                                                                                                                             
  // if isAuthLoading → show spinner (auth bootstrap running)                                                                                                         
  // if !token → router.replace('/login?redirect='+pathname)                                                                                                            
  // else → render children                                                                                                                                           
                                                                                                                                                                        
  Server metadata (every page):                                                                                                                                         
  export const metadata = {                                                                                                                                             
    title: 'Home | Adorio',                                                                                                                                             
    description: 'Recent posts from the Adorio community.',                                                                                                             
    openGraph: { ... }                                                                                                                                                
  }                                                                                                                                                                     
                                                                                                                                                                      
  Only use dynamic({ssr:false}) for:                                                                                                                                  
  - CodeMirror editor (DOM access on import)                                                                                                                            
  - RyGame canvas                           
  - Recharts in DataLookup (admin page, no SEO needed anyway)                                                                                                           
                                                                                                                                                                        
  src/lib/serverFetch.ts:                                                                                                                                             
  const BASE = process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:3000'                                                                                              
  export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {                                                                                  
    const res = await fetch(`${BASE}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })                                           
    if (!res.ok) throw new Error(`${res.status} ${path}`)                                                                                                               
    return res.json()                                                                                                                                                 
  }                                                                                                                                                                     
                                                                                                                                                                        
  ---                                                                                                                                                                   
  Environment variables                                                                                                                                                 
                                                                                                                                                                      
  # Server-only (Server Components, never in browser)                                                                                                                 
  BACKEND_INTERNAL_URL=http://localhost:3000                                                                                                                            
                                  
  # Public (if ever needed in client — currently nothing requires it)                                                                                                   
  NEXT_PUBLIC_CLOUDINARY_NAME=dboeqtx65                                                                                                                                 
                                                                                                                                                                        
  # Existing backend vars stay in backend/.env, unchanged                                                                                                               
                                                                                                                                                                        
  Remove VITE_BACKEND_URL everywhere — no longer exists.                                                                                                                
                                                                                                                                                                        
  ---                                                                                                                                                                   
  Dockerfile key changes                                                                                                                                              
                                                                                                                                                                        
  # Build: next build with output:'standalone'                                                                                                                        
  RUN npm run build
                                                                                                                                                                      
  # Runtime: copy standalone bundle (no node_modules needed)                                                                                                            
  COPY --from=build-nextjs /app/.next/standalone /nextjs                                                                                                              
  COPY --from=build-nextjs /app/.next/static /nextjs/.next/static                                                                                                       
  COPY --from=build-nextjs /app/public /nextjs/public                                                                                                                 
                                                                                                                                                                        
  # start.sh                                                                                                                                                          
  PORT=3000 node /app/backend/index.js &                                                                                                                                
  PORT=3001 HOSTNAME=0.0.0.0 node /nextjs/server.js &                                                                                                                 
  nginx -g "daemon off;"                                                                                                                                                
                                                                                                                                                                        
  ---                                                                                                                                                                   
  That's the complete state. Paste this into the next session and continue from "Files still to create/update."                                                         
                                                                                                                                                                        
✻ Brewed for 56s                                                                                                                                                      
                                                                                                                                                                        
❯ include all your plans too                                                                                                                                            
                                                                                                                                                                        
● Adorio → Next.js Migration: Complete Context Document                                                                                                               
                                                                                                                                                                      
  ---                                                                                                                                                                   
  The Request                     
                                                                                                                                                                        
  Migrate the Adorio codebase from Vite/React to Next.js 15 App Router. Primary goals in priority order:                                                              
  1. SEO — Google must crawl actual HTML content, not a JS bundle                                                                                                       
  2. Performance — user sees content instantly (static first, dynamic streams in)                                                                                       
  3. Developer experience — clean, simple, no repetition                                                                                                                
  4. Keep all existing features unchanged                                                                                                                               
                                                                                                                                                                        
  The user had a previous failed Next.js attempt that caused 13-second page loads. That must not happen again.                                                          
                                                                                                                                                                        
  ---                                                                                                                                                                 
  Why the Previous Migration Was 13 Seconds (Root Cause)                                                                                                                
                                                                                                                                                                        
  One of two causes:                                                                                                                                                  
  1. Entire pages wrapped in dynamic({ssr:false}) — makes Next.js behave identically to Vite: ship JS bundle, execute in browser, fetch data, paint. No SSR, no benefit,
   slower than Vite because of Next.js overhead.                                                                                                                        
  2. getServerSideProps (old Pages Router pattern) making blocking API calls — page can't send any HTML until the backend responds. If backend is slow or cold-starting,
   you wait.                                                                                                                                                            
                                                                                                                                                                        
  ---                                                                                                                                                                   
  Critical Mental Model: "use client" vs dynamic({ssr:false})                                                                                                           
                                                                                                                                                                      
  This is the most commonly misunderstood thing in Next.js App Router:
                                                                                                                                                                        
  - "use client" — the component is STILL pre-rendered as HTML on the server, THEN hydrated on the client. Google sees real content. Adding "use client" does NOT skip  
  SSR.                                                                                                                                                                  
  - dynamic({ssr:false}) — truly skips server rendering. The component only runs in the browser. Google sees nothing. Use ONLY for components that crash during SSR     
  (canvas, CodeMirror, things that access window at import time).                                                                                                       
  - Server Components (default, no directive) — rendered ONLY on the server, zero client JS sent. Perfect for data fetching + static content.
                                                                                                                                                                        
  So the rule:                                                                                                                                                        
  - Static/data pages → Server Components (no directive)                                                                                                                
  - Interactive components → "use client" (still SSRs to HTML)                                                                                                          
  - Canvas/CodeMirror/Recharts → dynamic({ssr:false}) (truly client-only)
                                                                                                                                                                        
  ---                                                                                                                                                                   
  The Suspense Streaming Pattern (Prevents the 13-Second Problem)                                                                                                       
                                                                                                                                                                        
  The industry standard for progressive rendering:                                                                                                                    
                                                                                                                                                                        
  User requests /home
    ↓ ~50ms                                                                                                                                                             
  Browser gets HTML shell (navbar, heading, skeleton placeholders) — renders INSTANTLY                                                                                
    ↓ ~300ms (backend fetching posts)                                                                                                                                   
  Backend responds → Next.js streams post HTML chunks into the browser                                                                                                  
    ↓                                                                                                                                                                   
  Posts appear — user sees them progressively, no full-page wait                                                                                                        
  Google waits for stream to finish → indexes ALL content                                                                                                               
                                                                                                                                                                        
  The code pattern:                                                                                                                                                     
  // page.tsx — Server Component, renders shell INSTANTLY (no await here)                                                                                               
  export default function HomePage() {                                                                                                                                  
    return (                                                                                                                                                          
      <div className="min-h-screen bg-gray-950">                                                                                                                        
        {/* This renders immediately as HTML */}
        <h1>Recent Posts</h1>                                                                                                                                           
                                                                                                                                                                        
        {/* fallback shows instantly, PostsLoader streams in when ready */}
        <Suspense fallback={<PostFeedSkeleton />}>                                                                                                                      
          <PostsLoader />                                                                                                                                             
        </Suspense>                                                                                                                                                     
      </div>                                                                                                                                                          
    )       
  }  
                                                                                                                                                                        
  // PostsLoader.tsx — async Server Component (the part that waits for data)
  async function PostsLoader() {                                                                                                                                        
    const data = await serverFetch('/api/posts?page=1&limit=5', { cache: 'no-store' })                                                                                
    return <Home initialPosts={data.posts} initialHasMore={data.hasMore} />                                                                                             
  }                                                                                                                                                                   
                                                                                                                                                                        
  proxy_buffering off in nginx is mandatory. Without it, nginx buffers the entire streamed response before sending to the client — completely defeating streaming. The
  skeleton never shows; users wait for all data just like before.                                                                                                       
                                                                                                                                                                      
  ---                                                                                                                                                                   
  What the Codebase Is                                                                                                                                                
                                                                                                                                                                        
  Stack:
  - React 18 frontend (Vite, being replaced)                                                                                                                            
  - Node.js/Express 4 backend in backend/ on port 3000 (UNCHANGED)                                                                                                      
  - MongoDB Atlas via Mongoose                                    
  - JWT auth in localStorage (15min access token, 7d refresh)                                                                                                           
  - Cloudinary for images                                                                                                                                             
  - Docker on Northflank (0.1vCPU/256MB runtime, 4vCPU/16GB build)                                                                                                      
  - Domain: adorio.space via Cloudflare CDN                                                                                                                           
  - ai-slop sidecar at /cao/ (separate React/TS app, UNCHANGED)                                                                                                         
                                                                                                                                                                      
  Current routing (React Router v7):                                                                                                                                    
  - / → TsBussing (portfolio landing, no navbar)                                                                                                                        
  - /home → Post feed (was protected, making public for SEO since GET /api/posts is already public)                                                                     
  - /login, /register → Auth forms                                                                                                                                      
  - /profile → User's own posts (protected)                                                                                                                             
  - /coding → In-browser coding challenges with CodeMirror                                                                                                              
  - /rygame → Canvas rhythm game (protected)                                                                                                                            
  - /sendenv → Secret message encryption tool (protected)                                                                                                               
  - /smartcity → Static SCB API docs page                                                                                                                               
  - /data-lookup → Admin analytics dashboard (protected)                                                                                                                
  - /tempBeforeReal → Retro CRT landing page                                                                                                                            
  - /tsbussing → Same as /                                                                                                                                            
  - /algo → External redirect to /algo.html                                                                                                                             
                                                                                                                                                                        
  Files using React Router that need updating:                                                                                                                          
  - src/App.jsx → DELETE (replaced by file-based routing)                                                                                                               
  - src/Components/Navbar.jsx → UPDATE                                                                                                                                  
  - src/Components/ProtectedRoute.jsx → DELETE (replaced by route group layout)                                                                                       
  - src/Components/NotFound.jsx → moves to src/app/not-found.tsx, UPDATE                                                                                                
  - src/views/Login.jsx → UPDATE (was src/pages/Login.jsx)                                                                                                              
  - src/views/Register.jsx → UPDATE                                                                                                                                     
  - src/views/SendEnv.jsx → UPDATE (remove useNavigate, auth handled by layout)                                                                                         
  - src/hooks/usePageTracking.js → UPDATE                                                                                                                               
                                                                                                                                                                        
  ---                                                                                                                                                                 
  Architecture Decision: SEO-Driven Route Classification                                                                                                                
                                                                                                                                                                      
  For Google to see content, pages must render content server-side. But protected pages (behind login) can't be indexed — Google doesn't have an account.               
                                                                                                                                                                        
  ┌───────────────────┬──────────────────────────────────────────────────┬───────────────────────────────────────────────┐                                              
  │       Route       │                   SSR Strategy                   │                    Reason                     │                                              
  ├───────────────────┼──────────────────────────────────────────────────┼───────────────────────────────────────────────┤                                              
  │ /                 │ Server Component (static)                        │ Portfolio content — Google's main entry point │                                            
  ├───────────────────┼──────────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ /home             │ Server Component + Suspense stream               │ Posts are public via API, should be indexed   │                                              
  ├───────────────────┼──────────────────────────────────────────────────┼───────────────────────────────────────────────┤                                              
  │ /coding           │ Server Component + dynamic(ssr:false) for editor │ Problem descriptions should be indexed        │                                              
  ├───────────────────┼──────────────────────────────────────────────────┼───────────────────────────────────────────────┤                                              
  │ /smartcity        │ Server Component (static)                        │ Static content, index it                      │                                            
  ├───────────────────┼──────────────────────────────────────────────────┼───────────────────────────────────────────────┤                                              
  │ /tempBeforeReal   │ Server Component                                 │ Static landing                                │                                            
  ├───────────────────┼──────────────────────────────────────────────────┼───────────────────────────────────────────────┤                                              
  │ /login, /register │ "use client" + robots:noindex                    │ Auth pages, no SEO value                      │                                            
  ├───────────────────┼──────────────────────────────────────────────────┼───────────────────────────────────────────────┤                                              
  │ /profile          │ "use client" (protected)                         │ Google can't log in                           │
  ├───────────────────┼──────────────────────────────────────────────────┼───────────────────────────────────────────────┤                                              
  │ /rygame           │ dynamic(ssr:false) (protected)                   │ Canvas crashes on server                      │                                            
  ├───────────────────┼──────────────────────────────────────────────────┼───────────────────────────────────────────────┤                                              
  │ /data-lookup      │ dynamic(ssr:false) (protected)                   │ Admin, Recharts crashes on server             │                                            
  ├───────────────────┼──────────────────────────────────────────────────┼───────────────────────────────────────────────┤                                              
  │ /sendenv          │ "use client" (protected)                         │ Utility, no SEO value                         │                                            
  └───────────────────┴──────────────────────────────────────────────────┴───────────────────────────────────────────────┘                                              
                                                                                                                                                                      
  Key product decision: /home becomes publicly readable (no login required to view posts). The Express API GET /api/posts already has no auth requirement — we're just  
  removing the frontend gate. Create/like/comment still requires login.                                                                                               
                                                                                                                                                                        
  ---                                                                                                                                                                 
  Production Architecture

  Browser
    → Cloudflare CDN
      → Northflank port 8080
        → Docker container (single container)                                                                                                                           
          → Nginx port 80
              /api/*         → Express localhost:3000                                                                                                                   
              /cao/*         → static files /usr/share/nginx/html/cao/                                                                                                
              /_next/static  → localhost:3001 (Next.js, nginx adds 1yr cache header)                                                                                    
              /*             → localhost:3001 (Next.js SSR, proxy_buffering off)                                                                                        
          → Express port 3000 (backend, unchanged)                                                                                                                      
          → Next.js port 3001 (standalone server.js from next build)                                                                                                    
                                                                                                                                                                        
  Dev locally (no Docker):                                                                                                                                              
  npm run dev:full                                                                                                                                                      
    → concurrently runs:                                                                                                                                                
      - cd backend && npm run dev    (Express on 3000 with nodemon)                                                                                                   
      - next dev --turbopack -p 3001 (Next.js with Turbopack on 3001)                                                                                                   
    → Next.js rewrites /api/* → http://localhost:3000/api/* in dev                                                                                                      
    → No CORS issues, no nginx needed locally                                                                                                                           
                                                                                                                                                                        
  ---                                                                                                                                                                 
  App Router Directory Structure                                                                                                                                        
                                                                                                                                                                        
  src/
  ├── app/                                                                                                                                                              
  │   ├── layout.tsx                          # Root: html/body, Providers — NO navbar                                                                                
  │   ├── globals.css                         # Tailwind + scrollbar styles                                                                                             
  │   ├── not-found.tsx                       # 404 page ("use client")                                                                                                 
  │   ├── Providers.tsx                       # "use client", Redux Provider                                                                                            
  │   ├── AuthBootstrapper.tsx                # "use client", auth+tracking, renders null                                                                               
  │   │                                                                                                                                                                 
  │   ├── (public)/                           # Route group: no navbar                                                                                                
  │   │   └── page.tsx                        # / → TsBussing                                                                                                           
  │   │                                                                                                                                                               
  │   └── (with-navbar)/                      # Route group: has Navbar                                                                                                 
  │       ├── layout.tsx                      # Renders <Navbar/>{children}                                                                                             
  │       ├── home/                                                                                                                                                     
  │       │   ├── page.tsx                    # Server Component, Suspense shell                                                                                        
  │       │   ├── PostsLoader.tsx             # async Server Component (streams data)                                                                                   
  │       │   └── loading.tsx                 # Route-level skeleton (instant)                                                                                        
  │       ├── login/page.tsx                                                                                                                                            
  │       ├── register/page.tsx                                                                                                                                         
  │       ├── coding/page.tsx                 # metadata + Coding client component                                                                                      
  │       ├── smartcity/page.tsx                                                                                                                                        
  │       ├── sendenv/page.tsx                # (in protected below)                                                                                                  
  │       ├── tempBeforeReal/page.tsx                                                                                                                                   
  │       └── (protected)/                                                                                                                                            
  │           ├── layout.tsx                  # Client auth guard                                                                                                       
  │           ├── profile/page.tsx                                                                                                                                      
  │           ├── rygame/page.tsx
  │           ├── sendenv/page.tsx                                                                                                                                      
  │           └── data-lookup/page.tsx                                                                                                                                  
  │
  ├── lib/                                                                                                                                                              
  │   └── serverFetch.ts                      # Server-side fetch helper                                                                                              
  │                                                                                                                                                                     
  ├── views/                                  # Renamed from src/pages/ (already done)
  │   ├── Home.jsx                            # UPDATE: accept initialPosts prop                                                                                        
  │   ├── Login.jsx                           # UPDATE: next/navigation                                                                                                 
  │   ├── Register.jsx                        # UPDATE: next/navigation                                                                                                 
  │   ├── SendEnv.jsx                         # UPDATE: remove useNavigate                                                                                              
  │   ├── Profile.jsx                         # Add "use client" only                                                                                                   
  │   ├── RyGame.jsx                          # Add "use client" only
  │   ├── DataLookup.jsx                      # Add "use client" only                                                                                                   
  │   ├── SmartCity.jsx                       # No changes needed                                                                                                     
  │   ├── Coding/                                                                                                                                                       
  │   │   ├── index.jsx                       # UPDATE: dynamic CodeEditor import                                                                                     
  │   │   └── components/                                                                                                                                               
  │   │       └── CodeEditor.jsx              # No changes (wrapped by dynamic above)                                                                                 
  │   └── TsBussing/                          # No changes (already client-compatible)                                                                                  
  │                                                                                                                                                                     
  ├── Components/                                                                                                                                                       
  │   ├── Navbar.jsx                          # UPDATE: next/link, usePathname, useRouter                                                                               
  │   ├── NotFound.jsx                        # content moved to app/not-found.tsx                                                                                      
  │   ├── PostCard/                           # NO CHANGES
  │   ├── SkeletonLoader.jsx                  # NO CHANGES                                                                                                              
  │   ├── ErrorBoundary.jsx                   # NO CHANGES                                                                                                            
  │   └── ProtectedRoute.jsx                  # DELETE                                                                                                                  
  │                                                                                                                                                                   
  ├── redux/                                                                                                                                                            
  │   ├── userSlice.js                        # UPDATE: add isAuthLoading state                                                                                       
  │   └── store.js                            # NO CHANGES                                                                                                              
  │                                                                                                                                                                     
  ├── hooks/                                                                                                                                                            
  │   ├── useAuthBootstrap.js                 # UPDATE: dispatch setAuthLoaded                                                                                          
  │   ├── usePageTracking.js                  # UPDATE: usePathname/useSearchParams                                                                                     
  │   ├── useInfiniteScroll.js                # NO CHANGES
  │   └── useClickOutside.js                  # NO CHANGES                                                                                                              
  │                                                                                                                                                                   
  ├── api/                                    # NO CHANGES except:                                                                                                      
  │   ├── index.js                            # NO CHANGES (uses API_BASE_URL)                                                                                          
  │   ├── posts.js                            # NO CHANGES                                                                                                              
  │   ├── analytics.js                        # NO CHANGES                                                                                                              
  │   ├── users.js                            # NO CHANGES (has existing CJS bug, ignore)                                                                               
  │   └── gameApi.js                          # UPDATE: remove import.meta.env                                                                                          
  │                                                                                                                                                                     
  ├── config/                                                                                                                                                           
  │   └── apiConfig.js                        # UPDATE: simplify to '/api'                                                                                              
  │                                                                                                                                                                     
  └── utils/                                  # NO CHANGES
                                                                                                                                                                        
  ---                                                                                                                                                                 
  Every File That Needs to Be Created or Changed                                                                                                                        
                                                                                                                                                                      
  NEW files to create:
                                                                                                                                                                        
  next.config.ts
                                                                                                                                                                        
  import type { NextConfig } from 'next'                                                                                                                                
  const config: NextConfig = {
    output: 'standalone',                                                                                                                                               
                                                                                                                                                                      
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'res.cloudinary.com' },
        { protocol: 'https', hostname: 'i.ibb.co' },                                                                                                                    
      ],                                            
    },                                                                                                                                                                  
                                                                                                                                                                      
    // In dev, proxy /api to Express so no CORS needed                                                                                                                  
    async rewrites() {                                                                                                                                                  
      if (process.env.NODE_ENV !== 'development') return []
      return [                                                                                                                                                          
        {                                                                                                                                                               
          source: '/api/:path*',
          destination: 'http://localhost:3000/api/:path*',                                                                                                              
        },                                                                                                                                                            
      ]   
    }, 
      
    async headers() {
      return [                                                                                                                                                          
        {     
          source: '/(.*)',                                                                                                                                              
          headers: [                                                                                                                                                  
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },                                                                                       
            { key: 'X-Adorio-Test', value: 'Hello' },                            
          ],                                                                                                                                                            
        },                                                                                                                                                            
      ]                                                                                                                                                                 
    },                                                                                                                                                                  
      
    experimental: {                                                                                                                                                     
      optimizePackageImports: ['@heroicons/react', 'lucide-react'],                                                                                                   
    },
  }                                                                                                                                                                     
   
  export default config                                                                                                                                                 
                                                                                                                                                                      
  tsconfig.json
  {
    "compilerOptions": {
      "target": "ES2017",
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,                         
      "skipLibCheck": true,                                                                                                                                             
      "strict": false,     
      "noEmit": true,                                                                                                                                                   
      "esModuleInterop": true,                                                                                                                                        
      "moduleResolution": "bundler",
      "resolveJsonModule": true,                                                                                                                                        
      "isolatedModules": true,  
      "jsx": "preserve",                                                                                                                                                
      "incremental": true,                                                                                                                                            
      "plugins": [{ "name": "next" }],
      "baseUrl": ".",                                                                                                                                                   
      "paths": {     
        "@/*": ["./src/*"],                                                                                                                                             
        "@components/*": ["./src/Components/*"]                                                                                                                       
      }                                        
    },                                                                                                                                                                  
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    "exclude": ["node_modules", "backend", "backend-go", "ai-slop"]                                                                                                     
  }                                                                                                                                                                   
                                                                                                                                                                        
  postcss.config.mjs (replaces postcss.config.cjs)                                                                                                                      
  export default {                                                                                                                                                      
    plugins: { tailwindcss: {}, autoprefixer: {} },                                                                                                                     
  }                                                                                                                                                                   
                                                                                                                                                                        
  src/app/globals.css — copy of src/index.css exactly (Tailwind directives + scrollbar styles)
                                                                                                                                                                        
  src/app/layout.tsx — Root layout, Server Component                                                                                                                    
  import type { Metadata } from 'next'                                                                                                                                  
  import './globals.css'                                                                                                                                                
  import Providers from './Providers'                                                                                                                                 
  import AuthBootstrapper from './AuthBootstrapper'
  import ErrorBoundary from '@/Components/ErrorBoundary'
                                                                                                                                                                        
  export const metadata: Metadata = {
    title: { default: 'Adorio', template: '%s | Adorio' },                                                                                                              
    description: 'A creative platform for builders, gamers, and makers.',                                                                                             
    metadataBase: new URL('https://adorio.space'),                                                                                                                      
    openGraph: {                                                                                                                                                        
      siteName: 'Adorio',                                                                                                                                               
      images: [{ url: 'https://i.ibb.co/KxH3wXDS/download-3.png' }],                                                                                                    
    },                                                                                                                                                                  
  }                                                                                                                                                                     
                                                                                                                                                                        
  export default function RootLayout({ children }: { children: React.ReactNode }) {                                                                                     
    return (                                                                                                                                                            
      <html lang="en">
        <body className="bg-gray-950">                                                                                                                                  
          <Providers>                                                                                                                                                 
            <ErrorBoundary>
              <AuthBootstrapper />                                                                                                                                      
              {children}          
            </ErrorBoundary>                                                                                                                                            
          </Providers>                                                                                                                                                
        </body>       
      </html>  
    )        
  }
                                                                                                                                                                        
  src/app/Providers.tsx — "use client"
  'use client'                                                                                                                                                          
  import { Provider } from 'react-redux'                                                                                                                              
  import store from '@/redux/store'     
                                   
  export default function Providers({ children }: { children: React.ReactNode }) {                                                                                      
    return <Provider store={store}>{children}</Provider>                          
  }                                                                                                                                                                     
                                                                                                                                                                      
  src/app/AuthBootstrapper.tsx — "use client", renders null, runs auth+tracking
  'use client'                                                                                                                                                          
  import useAuthBootstrap from '@/hooks/useAuthBootstrap'
  import usePageTracking from '@/hooks/usePageTracking'                                                                                                                 
                                                                                                                                                                      
  export default function AuthBootstrapper() {                                                                                                                          
    useAuthBootstrap()                                                                                                                                                
    usePageTracking()
    return null                                                                                                                                                         
  }
                                                                                                                                                                        
  src/lib/serverFetch.ts                                                                                                                                              
  const BASE = process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:3000'
                                                                          
  export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {                                                                                  
    const res = await fetch(`${BASE}${path}`, {                                       
      ...init,                                                                                                                                                          
      headers: { 'Content-Type': 'application/json', ...init?.headers },                                                                                                
    })                                                                  
    if (!res.ok) throw new Error(`serverFetch ${res.status}: ${path}`)                                                                                                  
    return res.json()                                                                                                                                                 
  }                                                                                                                                                                     
   
  src/app/(public)/page.tsx — TsBussing landing, Server Component                                                                                                       
  import type { Metadata } from 'next'                                                                                                                                  
  import TsBussing from '@/views/TsBussing'
                                                                                                                                                                        
  export const metadata: Metadata = {                                                                                                                                   
    title: 'Oakar Oo — Portfolio',   
    description: 'Full-stack developer. Web apps, games, digital art. React, Next.js, Node.js, MongoDB.',                                                               
    openGraph: {                                                                                                                                                        
      title: 'Oakar Oo — Portfolio | Adorio',                                                                                                                           
      description: 'View my projects: web apps, rhythm games, smart city demos.',                                                                                       
      images: [{ url: 'https://i.ibb.co/KxH3wXDS/download-3.png' }],                                                                                                    
    },                                                                                                                                                                  
  }                                                                                                                                                                     
                                                                                                                                                                        
  export default function LandingPage() {                                                                                                                             
    return <TsBussing />                                                                                                                                                
  }                                                                                                                                                                   

  src/app/(with-navbar)/layout.tsx
  import Navbar from '@/Components/Navbar'
                                          
  export default function NavbarLayout({ children }: { children: React.ReactNode }) {                                                                                   
    return (                                                                         
      <>                                                                                                                                                                
        <Navbar />                                                                                                                                                    
        {children}
      </>         
    )
  }                                                                                                                                                                     
   
  src/app/(with-navbar)/home/page.tsx — Suspense streaming, Server Component                                                                                            
  import { Suspense } from 'react'                                                                                                                                    
  import type { Metadata } from 'next'
  import SkeletonLoader from '@/Components/SkeletonLoader'                                                                                                              
  import PostsLoader from './PostsLoader'                 
                                                                                                                                                                        
  export const metadata: Metadata = {                                                                                                                                   
    title: 'Home',                   
    description: 'Recent posts from the Adorio community. Share thoughts, projects, and ideas.',                                                                        
  }                                                                                                                                                                   
                                                                                                                                                                        
  export default function HomePage() {
    return (                                                                                                                                                            
      <div className="min-h-screen bg-gray-950">                                                                                                                      
        <Suspense fallback={                    
          <div className="container mx-auto max-w-2xl px-4 py-8 pt-20">
            <SkeletonLoader count={5} />                               
          </div>                                                                                                                                                        
        }>                                                                                                                                                              
          <PostsLoader />                                                                                                                                               
        </Suspense>                                                                                                                                                     
      </div>                                                                                                                                                          
    )       
  }  
   
  src/app/(with-navbar)/home/PostsLoader.tsx — async Server Component (the data-fetching part)
  import { serverFetch } from '@/lib/serverFetch'                                                                                                                       
  import Home from '@/views/Home'                
                                                                                                                                                                        
  export default async function PostsLoader() {                                                                                                                       
    let initialPosts = []                                                                                                                                               
    let initialHasMore = true                                                                                                                                         
                                                                                                                                                                        
    try {
      const data = await serverFetch<{ posts: any[]; hasMore: boolean }>(                                                                                               
        '/api/posts?page=1&limit=5',                                                                                                                                  
        { cache: 'no-store' }       
      )                                                                                                                                                                 
      initialPosts = data.posts ?? []
      initialHasMore = data.hasMore ?? true                                                                                                                             
    } catch {                                                                                                                                                         
      // SSR fetch failed — Home will fetch client-side as fallback
    }                                                              
                                                                                                                                                                        
    return <Home initialPosts={initialPosts} initialHasMore={initialHasMore} />
  }                                                                                                                                                                     
                                                                                                                                                                      
  src/app/(with-navbar)/home/loading.tsx — route-level loading (shows before Suspense even runs)
  import SkeletonLoader from '@/Components/SkeletonLoader'                                                                                                              
                                                          
  export default function HomeLoading() {                                                                                                                               
    return (                                                                                                                                                          
      <div className="container mx-auto max-w-2xl px-4 py-8 pt-20">                                                                                                     
        <SkeletonLoader count={5} />                                                                                                                                  
      </div>                                                                                                                                                            
    )
  }                                                                                                                                                                     
                                                                                                                                                                      
  src/app/(with-navbar)/login/page.tsx
  import type { Metadata } from 'next'
  import Login from '@/views/Login'   
                                                                                                                                                                        
  export const metadata: Metadata = {
    title: 'Login',                                                                                                                                                     
    robots: { index: false, follow: false },                                                                                                                          
  }                                         
   
  export default function LoginPage() {
    return <Login />                                                                                                                                                    
  }                 
                                                                                                                                                                        
  src/app/(with-navbar)/register/page.tsx — same pattern as login                                                                                                     
                                                                                                                                                                        
  src/app/(with-navbar)/coding/page.tsx
  import type { Metadata } from 'next'                                                                                                                                  
  import Coding from '@/views/Coding'                                                                                                                                 
                                     
  export const metadata: Metadata = {
    title: 'Coding Challenges',                                                                                                                                         
    description: 'Solve JavaScript problems in your browser. Arrays, strings, algorithms, data structures.',
  }                                                                                                                                                                     
                                                                                                                                                                        
  export default function CodingPage() {
    return <Coding />                                                                                                                                                   
  }                                                                                                                                                                   
   
  src/app/(with-navbar)/smartcity/page.tsx
  import type { Metadata } from 'next'                                                                                                                                  
  import SmartCity from '@/views/SmartCity'
                                                                                                                                                                        
  export const metadata: Metadata = {                                                                                                                                 
    title: 'Smart City APIs',        
    description: 'SCB API documentation: DeepLink Mobile, Direct Debit.',
  }                                                                      
                                                                                                                                                                        
  export default function SmartCityPage() {
    return <SmartCity />                                                                                                                                                
  }                                                                                                                                                                   
   
  src/app/(with-navbar)/tempBeforeReal/page.tsx — same thin wrapper pattern
                                                                                                                                                                        
  src/app/(with-navbar)/(protected)/layout.tsx — client auth guard                                                                                                      
  'use client'                                                                                                                                                          
  import { useEffect } from 'react'                                                                                                                                     
  import { useSelector } from 'react-redux'                                                                                                                           
  import { useRouter, usePathname } from 'next/navigation'
                                                          
  export default function ProtectedLayout({ children }: { children: React.ReactNode }) {                                                                                
    const { token, isAuthLoading } = useSelector((s: any) => s.user)                    
    const router = useRouter()                                                                                                                                          
    const pathname = usePathname()                                                                                                                                      
                                  
    useEffect(() => {                                                                                                                                                   
      if (!isAuthLoading && !token) {                                                                                                                                   
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      }                                                                                                                                                                 
    }, [isAuthLoading, token, router, pathname])                                                                                                                        
                                                
    if (isAuthLoading) {                                                                                                                                                
      return (                                                                                                                                                        
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">                                            
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent mb-4" />                        
            <p className="text-gray-300 text-lg">Loading Adorio...</p>                                                                          
          </div>                                                                                                                                                        
        </div>                                                                                                                                                          
      )                                                                                                                                                                 
    }                                                                                                                                                                   
                                                                                                                                                                      
    if (!token) return null
                           
    return <>{children}</>
  }                       
   
  Protected page files (/profile, /rygame, /data-lookup, /sendenv) — all follow same thin wrapper pattern. RyGame and DataLookup use dynamic({ssr:false}):
  // rygame/page.tsx                                                                                                                                                    
  import dynamic from 'next/dynamic'
  const RyGame = dynamic(() => import('@/views/RyGame'), { ssr: false })                                                                                                
  export default function RyGamePage() { return <RyGame /> }                                                                                                            
                                                            
  // data-lookup/page.tsx                                                                                                                                               
  import dynamic from 'next/dynamic'                                                                                                                                  
  const DataLookup = dynamic(() => import('@/views/DataLookup'), { ssr: false })                                                                                        
  export default function DataLookupPage() { return <DataLookup /> }                                                                                                  
                                                                                                                                                                        
  src/app/not-found.tsx — content from Components/NotFound.jsx, updated
  'use client'                                                                                                                                                          
  import { useRouter } from 'next/navigation'                                                                                                                         
  // same component code but:                                                                                                                                           
  // - replace useNavigate() with useRouter()                                                                                                                         
  // - replace navigate('/') with router.push('/')                                                                                                                      
  // - replace window.innerHeight/Width with state+useEffect:                                                                                                           
  //   const [vh, setVh] = useState(800)                                                                                                                                
  //   const [vw, setVw] = useState(1200)                                                                                                                               
  //   useEffect(() => { setVh(window.innerHeight); setVw(window.innerWidth) }, [])                                                                                     
                                                                                                                                                                        
  src/app/algo/page.tsx                                                                                                                                                 
  'use client'                                                                                                                                                        
  import { useEffect } from 'react'                                                                                                                                     
  export default function AlgoPage() {                                                                                                                                  
    useEffect(() => { window.location.replace('/algo.html') }, [])
    return null                                                                                                                                                         
  }                                                                                                                                                                     
  
  ---                                                                                                                                                                   
  UPDATED files (existing files that change):                                                                                                                         
                                                                                                                                                                        
  tailwind.config.js — add src/app to content:
  content: [                                                                                                                                                            
    './src/app/**/*.{js,ts,jsx,tsx}',                                                                                                                                 
    './src/views/**/*.{js,jsx}',                                                                                                                                        
    './src/Components/**/*.{js,jsx}',                                                                                                                                 
    './src/hooks/**/*.{js}',                                                                                                                                            
  ]                         
                                                                                                                                                                        
  src/redux/userSlice.js — add isAuthLoading:                                                                                                                         
  const initialState = {                                                                                                                                                
    user: null,         
    token: null,                                                                                                                                                        
    isAuthLoading: true,  // true until bootstrap resolves                                                                                                            
  }                                                       
                                                                                                                                                                        
  // Add action:
  setAuthLoaded: (state) => { state.isAuthLoading = false },                                                                                                            
                                                                                                                                                                      
  // Update setUser:                                                                                                                                                    
  setUser: (state, action) => {                                                                                                                                         
    state.user = action.payload.user
    state.token = action.payload.token                                                                                                                                  
    state.isAuthLoading = false                                                                                                                                       
  },                           
    
  // Update logout:                                                                                                                                                     
  logout: (state) => {
    state.user = null                                                                                                                                                   
    state.token = null                                                                                                                                                
    state.isAuthLoading = false
    localStorage.removeItem('token')
  },
                                                                                                                                                                        
  src/hooks/useAuthBootstrap.js — dispatch setAuthLoaded when done:
  import { setUser, setAuthLoaded } from '../redux/userSlice'                                                                                                           
                                                                                                                                                                      
  // In the finally block AND in the no-token early return:                                                                                                             
  if (!storedToken) {                                                                                                                                                   
    dispatch(setAuthLoaded())  // ← add this                                                                                                                            
    return                                                                                                                                                              
  }                                                                                                                                                                     
   
  // In finally:                                                                                                                                                        
  } finally {                                                                                                                                                         
    dispatch(setAuthLoaded())  // ← ensure this always fires
  }                                                                                                                                                                     
   
  src/hooks/usePageTracking.js — replace react-router with next/navigation:                                                                                             
  import { usePathname, useSearchParams } from 'next/navigation'                                                                                                        
  // Remove: import { useLocation } from 'react-router-dom'     
                                                                                                                                                                        
  // Replace:                                                                                                                                                           
  // const location = useLocation()                                                                                                                                     
  // location.pathname → pathname                                                                                                                                       
  // location.search → '?' + searchParams.toString() (or searchParams.toString())                                                                                     
  // location.hash → '' (hash not available server-side, access via window.location.hash in effect)
                                                                                                                                                                        
  // The dependency array changes from:                                                                                                                                 
  // [location.pathname, location.search, location.hash, ...]                                                                                                           
  // to:                                                                                                                                                                
  // [pathname, searchParams.toString(), ...]                                                                                                                           
                                                                                                                                                                      
  src/config/apiConfig.js — replace entire file:                                                                                                                        
  // Client requests go to /api (relative, same origin)
  // Next.js rewrites handle /api → Express in dev                                                                                                                      
  // Nginx handles /api → Express in production                                                                                                                         
  export const API_BASE_URL = '/api'                                                                                                                                    
                                                                                                                                                                        
  src/api/gameApi.js — fix import.meta.env:                                                                                                                             
  // Change:                                                                                                                                                            
  baseURL: import.meta.env.VITE_BACKEND_URL || "",                                                                                                                    
  // To:                                                                                                                                                                
  baseURL: '/api',                                                                                                                                                    
                  
  // Change endpoint paths (remove the /api/ prefix since baseURL now includes it):                                                                                     
  // '/api/game/leaderboard' → '/game/leaderboard'                                                                                                                      
  // '/api/game/update-score' → '/game/update-score'                                                                                                                    
  // '/api/game/user-stats' → '/game/user-stats'                                                                                                                        
                                                                                                                                                                        
  src/Components/Navbar.jsx — replace react-router-dom:
  'use client'                                                                                                                                                          
  import Link from 'next/link'                                                                                                                                        
  import { useRouter, usePathname } from 'next/navigation'                                                                                                              
  // Remove: import { Link, useNavigate } from 'react-router-dom'                                                                                                     
                                                                                                                                                                        
  // Change:
  // const navigate = useNavigate() → const router = useRouter()                                                                                                        
  // navigate('/login') → router.push('/login')                                                                                                                       
                                                                                                                                                                        
  // NavLink sub-component: change <Link to={to}> → <Link href={href}>                                                                                                  
  // (rename prop: to → href in NavLink component and all call sites)                                                                                                   
                                                                                                                                                                        
  // Navbar hides itself on landing page (replaces App.jsx logic):                                                                                                      
  const pathname = usePathname()                                                                                                                                        
  if (pathname === '/') return null                                                                                                                                     
                                                                                                                                                                        
  // Remove darkMode/setDarkMode props (unused — no dark mode toggle in JSX)                                                                                          
  // Remove PropTypes import                                                                                                                                            
                            
  src/views/Login.jsx — replace react-router-dom:                                                                                                                       
  'use client'                                                                                                                                                          
  import Link from 'next/link'
  import { useRouter, useSearchParams } from 'next/navigation'                                                                                                          
  // Remove: import { Link, useNavigate, useLocation } from 'react-router-dom'                                                                                        
                                                                              
  // Replace:                                                                                                                                                           
  // const navigate = useNavigate() → const router = useRouter()
  // const location = useLocation() → const searchParams = useSearchParams()                                                                                            
  // const from = location.state?.from?.pathname || '/home'                                                                                                           
  //   → const from = searchParams.get('redirect') || '/home'                                                                                                           
  // navigate(from, { replace: true }) → router.replace(from)                                                                                                           
                                                                                                                                                                        
  // Register link (preserve redirect):                                                                                                                                 
  // <Link to="/register" state={{ from: location.state?.from }}>Sign up</Link>                                                                                         
  // → const redirect = searchParams.get('redirect')                                                                                                                    
  //   <Link href={redirect ? `/register?redirect=${redirect}` : '/register'}>Sign up</Link>                                                                            
                                                                                                                                                                      
  src/views/Register.jsx — same pattern as Login                                                                                                                        
                                                                                                                                                                        
  src/views/SendEnv.jsx — remove auth redirect (protected layout handles it):                                                                                           
  'use client'                                                                                                                                                          
  // Remove: import { useNavigate } from 'react-router-dom'                                                                                                             
  // Remove: const navigate = useNavigate()                                                                                                                           
  // Remove: the entire useEffect that checks user and navigates to /login
  // Keep everything else unchanged                                                                                                                                     
                                   
  src/views/Home.jsx — accept SSR initial data, make feed public:                                                                                                       
  'use client'                                                                                                                                                          
  // Add initialPosts and initialHasMore props:                                                                                                                         
  const Home = ({ initialPosts = [], initialHasMore = true }) => {                                                                                                      
    const [posts, setPosts] = useState(initialPosts)                                                                                                                    
    const [hasMore, setHasMore] = useState(initialHasMore)                                                                                                              
    // Start at page 2 if SSR provided page 1, else start at page 1                                                                                                     
    const [page, setPage] = useState(initialPosts.length > 0 ? 2 : 1)                                                                                                   
    const [loading, setLoading] = useState(initialPosts.length === 0)                                                                                                   
                                                                     
    // fetchPosts only runs when page > 1 (infinite scroll) OR on mount if no initial posts                                                                             
    const fetchPosts = useCallback(async () => {                                                                                                                        
      if (page === 1 && initialPosts.length > 0) return // SSR already loaded page 1                                                                                    
      // ... rest of existing fetch logic unchanged ...                                                                                                                 
    }, [page])                                                                                                                                                          
              
    // Gate create-post form behind auth:                                                                                                                               
    const { user } = useSelector((state) => state.user)                                                                                                               
    // In JSX: only render the create post form if user is logged in                                                                                                    
    // {user && <CreatePostSection />}                                                                                                                                  
    // Posts list renders for everyone (for SEO and public access)                                                                                                      
                                                                                                                                                                        
  src/views/Coding/index.jsx — dynamic CodeEditor import only:                                                                                                          
  'use client'                                                                                                                                                          
  import dynamic from 'next/dynamic'                                                                                                                                    
                                                                                                                                                                        
  // Replace static import:
  // import CodeEditor from './components/CodeEditor'                                                                                                                   
  // With:                                                                                                                                                            
  const CodeEditor = dynamic(() => import('./components/CodeEditor'), {                                                                                                 
    ssr: false,                                                        
    loading: () => <div className="h-[360px] bg-gray-900 animate-pulse rounded-lg" />,                                                                                  
  })                                                                                                                                                                  
  // Everything else in this file unchanged                                                                                                                             
  
  ---                                                                                                                                                                   
  INFRASTRUCTURE files:                                                                                                                                               
                                                                                                                                                                        
  Dockerfile — full rewrite:                                                                                                                                          
                                                                                                                                                                        
  # Stage 1: Build Next.js frontend
  FROM node:20-alpine AS build-nextjs                                                                                                                                   
  WORKDIR /app                                                                                                                                                          
  COPY package*.json ./
  RUN npm ci                                                                                                                                                            
  COPY . .                                                                                                                                                            
  ENV NEXT_TELEMETRY_DISABLED=1
  ENV NODE_ENV=production
  ENV BACKEND_INTERNAL_URL=http://localhost:3000
  RUN npm run build                                                                                                                                                     
  
  # Stage 2: Build AI-Slop (unchanged)                                                                                                                                  
  FROM node:20-alpine AS build-ai-slop                                                                                                                                
  WORKDIR /ai-slop                                                                                                                                                      
  ARG VITE_GEMINI_API_KEY                                                                                                                                             
  COPY ./ai-slop/AI-Slop-For-CAO-exam/package*.json ./
  RUN npm ci                                                                                                                                                            
  COPY ./ai-slop/AI-Slop-For-CAO-exam ./                                                                                                                                
  RUN npm run build                                                                                                                                                     
                                                                                                                                                                        
  # Stage 3: Production runtime                                                                                                                                       
  FROM node:20-alpine                                                                                                                                                   
  RUN apk add --no-cache nginx                                                                                                                                        
                              
  # Next.js standalone bundle (no node_modules needed at runtime)                                                                                                       
  COPY --from=build-nextjs /app/.next/standalone /nextjs         
  COPY --from=build-nextjs /app/.next/static /nextjs/.next/static                                                                                                       
  COPY --from=build-nextjs /app/public /nextjs/public                                                                                                                   
                                                     
  # AI-Slop static files                                                                                                                                                
  COPY --from=build-ai-slop /ai-slop/dist /usr/share/nginx/html/cao/                                                                                                  
                                                                                                                                                                        
  # Express backend                                                                                                                                                     
  COPY ./backend /app/backend
  WORKDIR /app/backend                                                                                                                                                  
  RUN npm ci --only=production                                                                                                                                          
                              
  # Nginx config                                                                                                                                                        
  ARG ENV=production                                                                                                                                                  
  COPY nginx.${ENV}.conf /etc/nginx/nginx.conf
                                                                                                                                                                        
  ENV NODE_ENV=production
  ENV BACKEND_INTERNAL_URL=http://localhost:3000                                                                                                                        
                                                                                                                                                                      
  RUN printf '#!/bin/sh\n\                                                                                                                                              
  PORT=3000 node /app/backend/index.js &\n\                                                                                                                           
  PORT=3001 HOSTNAME=0.0.0.0 node /nextjs/server.js &\n\
  nginx -g "daemon off;"\n' > /start.sh && chmod +x /start.sh                                                                                                           
                                                                                                                                                                        
  EXPOSE 80                                                                                                                                                             
  CMD ["/bin/sh", "/start.sh"]                                                                                                                                          
                                                                                                                                                                        
  nginx.production.conf — full rewrite (key: proxy_buffering off for streaming):                                                                                      
                                                                                                                                                                        
  events { worker_connections 1024; }
                                                                                                                                                                        
  http {                                                                                                                                                              
    include /etc/nginx/mime.types;                                                                                                                                      
    default_type application/octet-stream;                                                                                                                            

    server {
      listen 80;
      server_name adorio.space www.adorio.space;                                                                                                                        
      absolute_redirect off;
      port_in_redirect off;                                                                                                                                             
                                                                                                                                                                        
      add_header X-Adorio-Test "Hello" always;
      add_header X-Frame-Options "DENY" always;                                                                                                                         
      add_header X-Content-Type-Options "nosniff" always;                                                                                                               
      add_header Referrer-Policy "strict-origin-when-cross-origin" always;
                                                                                                                                                                        
      # Express API                                                                                                                                                     
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;                                                                                                                                    
        proxy_set_header X-Real-IP $remote_addr;                                                                                                                      
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;                                                                                                                     
      }                                            
                                                                                                                                                                        
      # AI-Slop static                                                                                                                                                
      location /cao/ {                                                                                                                                                  
        alias /usr/share/nginx/html/cao/;
        try_files $uri $uri/ /cao/index.html;                                                                                                                           
      }                                                                                                                                                               
      location = /cao { return 301 https://adorio.space/cao/; }                                                                                                         
                                                               
      # Next.js static assets — long cache, served directly                                                                                                             
      location /_next/static/ {                                                                                                                                         
        proxy_pass http://localhost:3001;                                                                                                                               
        add_header Cache-Control "public, max-age=31536000, immutable";                                                                                                 
        proxy_buffering on;  # static assets CAN be buffered                                                                                                          
      }                                                     
                                                                                                                                                                        
      # Everything else → Next.js SSR                                                                                                                                   
      location / {                                                                                                                                                      
        proxy_pass http://localhost:3001;                                                                                                                               
        proxy_http_version 1.1;                                                                                                                                       
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '';                                                                                                                                 
        proxy_set_header Host $host;   
        proxy_set_header X-Real-IP $remote_addr;                                                                                                                        
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;                                                                                                  
        proxy_set_header X-Forwarded-Proto $scheme;                                                                                                                     
        proxy_buffering off;        # CRITICAL: allows Suspense streaming to work
        proxy_read_timeout 60s;                                                                                                                                         
      }                                                                                                                                                                 
    }  
  }                                                                                                                                                                     
                                                                                                                                                                      
  nginx.development.conf — same structure but /cao proxies to ai-slop container:
                                                                                                                                                                        
  events { worker_connections 1024; }
    include /etc/nginx/mime.types;                                                                                                                                      
    default_type application/octet-stream;                                                                                                                            
                                                                                                                                                                        
    upstream nextjs { server localhost:3001; }                                                                                                                        
    upstream backend { server localhost:3000; }                                                                                                                         
    upstream ai-slop { server ai-slop:80; }    
                                                                                                                                                                        
    server {                                                                                                                                                            
      listen 80;
      server_name _;                                                                                                                                                    
                                                                                                                                                                      
      location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;                                                                                                                        
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;                                                                                                                     
      }                                                                                                                                                                 
       
      location /cao/ {                                                                                                                                                  
        proxy_pass http://ai-slop/;                                                                                                                                   
        proxy_set_header Host $host;
      }                                                                                                                                                                 
      location = /cao { return 301 /cao/; }
                                                                                                                                                                        
      location /_next/static/ {                                                                                                                                       
        proxy_pass http://nextjs;                                                                                                                                       
        add_header Cache-Control "public, max-age=31536000, immutable";
      }                                                                                                                                                                 
                                                                                                                                                                      
      location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;  
        proxy_set_header Upgrade $http_upgrade;                                                                                                                         
        proxy_set_header Connection '';        
        proxy_set_header Host $host;                                                                                                                                    
        proxy_buffering off;                                                                                                                                          
      }
    }                                                                                                                                                                   
  }
                                                                                                                                                                        
  ---                                                                                                                                                                 
  Files to DELETE:
                  
  - src/main.jsx
  - src/App.jsx                                                                                                                                                         
  - src/App.css
  - vite.config.js                                                                                                                                                      
  - index.html                                                                                                                                                        
  - postcss.config.cjs
  - src/Components/ProtectedRoute.jsx                                                                                                                                   
  - vercel.json (or update for Next.js if still deploying to Vercel)
                                                                                                                                                                        
  ---                                                                                                                                                                   
  Environment Variables                                                                                                                                                 
                                                                                                                                                                        
  # Server-only (used by Server Components, NOT exposed to browser)                                                                                                   
  BACKEND_INTERNAL_URL=http://localhost:3000                                                                                                                            
  
  # In Docker start.sh, Next.js standalone reads these automatically                                                                                                    
  NODE_ENV=production                                                                                                                                                 
  PORT=3001          # Next.js server port                                                                                                                              
  HOSTNAME=0.0.0.0   # Required for Docker                                                                                                                              
                                                                                                                                                                        
  # All existing backend/.env vars unchanged                                                                                                                            
  # VITE_BACKEND_URL removed everywhere — no longer exists                                                                                                              
                                                                                                                                                                        
  ---                                                                                                                                                                   
  What's Already Done                                                                                                                                                   
                                                                                                                                                                        
  1. src/pages/ renamed to src/views/ ✅                                                                                                                              
  2. package.json updated (vite removed, next@15 added, scripts updated) ✅                                                                                             
                                                                                                                                                                        
  ---                                                                                                                                                                   
  Execution Order for Next Session                                                                                                                                      
                                                                                                                                                                        
  1. Create next.config.ts
  2. Create tsconfig.json                                                                                                                                               
  3. Create postcss.config.mjs, delete postcss.config.cjs                                                                                                             
  4. Update tailwind.config.js                                                                                                                                          
  5. Create src/app/globals.css
  6. Create src/app/layout.tsx, Providers.tsx, AuthBootstrapper.tsx                                                                                                     
  7. Update src/redux/userSlice.js (isAuthLoading)                                                                                                                    
  8. Update src/hooks/useAuthBootstrap.js (setAuthLoaded)                                                                                                               
  9. Update src/config/apiConfig.js (→ /api)                                                                                                                          
  10. Update src/api/gameApi.js (remove import.meta.env)                                                                                                                
  11. Create src/lib/serverFetch.ts                                                                                                                                   
  12. Update src/Components/Navbar.jsx                                                                                                                                  
  13. Create all src/app/ pages                                                                                                                                       
  14. Update src/views/Login.jsx, Register.jsx, SendEnv.jsx, Home.jsx, Coding/index.jsx                                                                                 
  15. Create src/app/not-found.tsx                                                                                                                                      
  16. Update Dockerfile, nginx.production.conf, nginx.development.conf                                                                                                  
  17. Delete old Vite files                                                                                                                                             
  18. Run npm install then npm run dev to fix any SSR errors (window is not defined)                                                                                  
  19. Run npm run build to catch remaining issues                                                                                                                       
  20. Test Docker: npm run docker:prod:up                    