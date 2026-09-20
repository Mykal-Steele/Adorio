// Portfolio data — single source of truth for all portfolio UI

export interface ProjectStat {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'STABLE' | 'BETA' | 'DEPRECATED';
  language: string;
  langColor: string;
  description: string;
  archNote: string;
  tags: string[];
  stats: ProjectStat[];
  branch: string;
  color: string;
  npm?: string;
  repoUrl?: string;
  liveUrl?: string;
}

export interface TimelineItem {
  year: string;
  hash: string;
  event: string;
  branch: string;
  status: 'IN_PROGRESS' | 'SHIPPED' | 'MILESTONE' | 'INIT';
}

export interface ExperienceItem {
  role: string;
  org: string;
  period: string;
  highlights: string[];
}

export interface StackGroup {
  category: string;
  items: string[];
  color: string;
}

export interface LanguageStat {
  name: string;
  pct: number;
  color: string;
}

export interface SearchResult {
  file: string;
  line: number;
  content: string;
  path: string;
}

export const portfolioData = {
  name: 'Oakar Oo',
  handle: 'OAKAR_OO',
  role: 'Full-Stack Developer',
  tagline: 'Full-stack developer, Bangkok.',
  branch: 'main/production',
  version: 'v2.0.0-stable',
  email: 'oakar@adorio.space',
  github: 'github.com/Mykal-Steele',
  linkedin: 'linkedin.com/in/oakaroo',
  googleDev: 'g.dev/oakaroo',
  location: 'Bangkok, Thailand',
  timezone: 'UTC+7',
  university: 'KMUTT — CS Year 2 · GPA 3.38',

  community: [
    {
      name: 'Microsoft Student Ambassadors',
      short: 'MSA',
      color: '#00a4ef',
    },
    {
      name: 'Google Developer Group (GDG)',
      short: 'GDG',
      color: '#4285f4',
    },
  ],

  experience: [
    {
      role: 'Team Lead · Fullstack Developer',
      org: 'KMUTT Integrated Project',
      period: 'Aug – Dec 2025',
      highlights: [
        'Led financial team in a 50+ developer project, coordinating API dev and payment integration',
        'Integrated PromptPay + Siam Commercial Bank APIs with real-time transaction processing',
        'Built WebSocket-based real-time feedback and failover mechanisms',
        'Automated deployment workflows using DevOps practices',
      ],
    },
    {
      role: 'Hardware & Backend Engineer',
      org: 'KMUTT IOT Hackathon — 2nd Place',
      period: 'Jan 2026',
      highlights: [
        'Built NFC-based attendance system using ESP32 + PN532 NFC/RFID reader with TFT-240 display',
        'Implemented real-time device sync via RabbitMQ for low-latency updates (<1s per scan)',
      ],
    },
  ] as ExperienceItem[],

  projects: [
    {
      id: 'adorio',
      name: 'Adorio',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        "The site you're on right now. A full-stack social platform: a Next.js 16 App Router frontend paired with a separate Express REST API, both in TypeScript. JWT auth, post creation with Cloudinary image uploads, likes, comments, and an infinite feed that streams in over React Suspense. A first-party analytics system fingerprints visitors (canvas, WebGL, screen, fonts) to track page views without a third-party tool.",
      archNote:
        'Backend follows a strict Controller to Service to Model to Schema layering with Zod validation and MongoDB Atlas via Mongoose. The whole stack, Nginx included, ships as one Docker image to Azure Container Apps behind Cloudflare. Every push to main runs format, lint, typecheck, build, and real Puppeteer integration tests against Docker containers before GitHub Actions authenticates via OIDC and deploys, gated on the new revision actually coming up healthy.',
      tags: ['#NEXTJS', '#EXPRESS', '#MONGODB', '#AZURE'],
      stats: [
        { label: 'Last Push', value: 'Sep 2026' },
        { label: 'Created', value: 'Jan 2025' },
        { label: 'Size', value: '86 MB' },
        { label: 'License', value: 'AGPL-3.0' },
      ],
      branch: 'main',
      color: '#00ffc2',
      repoUrl: 'github.com/Mykal-Steele/Adorio',
    },
    {
      id: 'create-adorex',
      name: 'create-adorex',
      status: 'STABLE',
      language: 'JavaScript',
      langColor: '#f7df1e',
      description:
        'A CLI published on NPM that scaffolds a backend project in one command: Express 5, TypeScript, Prisma 7 with SQLite (via libsql), one Prisma model, two starter routes. Built on cac for argument parsing and @clack/prompts for the interactive setup, with a plain string-replace templating step, no config file.',
      archNote:
        'One template exists (express-sqlite) — there is no Bun/Elysia or Astro template despite what earlier commit messages implied. The CLI itself has three runtime dependencies (cac, @clack/prompts, picocolors), a real node --test suite, and currently no auth scaffolding in the generated project.',
      tags: ['#NPM', '#CLI', '#JAVASCRIPT', '#SCAFFOLDING'],
      stats: [
        { label: 'Version', value: 'v1.4.14' },
        { label: 'Downloads', value: '50/mo' },
        { label: 'Last Push', value: 'Apr 2026' },
        { label: 'License', value: 'MIT' },
      ],
      branch: 'main',
      color: '#00ffc2',
      npm: 'npmjs.com/package/create-adorex',
      repoUrl: 'github.com/Mykal-Steele/adorex-cli',
    },
    {
      id: 'vexta',
      name: 'Vexta',
      status: 'STABLE',
      language: 'Dart',
      langColor: '#0175C2',
      description:
        'Turns a phone into a virtual webcam on Windows over the local network. A Flutter/Dart mobile app captures and JPEG-compresses camera frames and streams them over a raw TCP socket; a second Flutter/Dart app on the Windows side decodes the JPEGs and pipes the raw frames through Dart FFI into a virtual-camera driver so any video call app can see it as a webcam.',
      archNote:
        'The frame capture, TCP streaming, JPEG decode, and FFI bridge are all authored Dart. The virtual-camera driver itself is a vendored, unmodified third-party C++ library (softcam by tshino, MIT licensed), not code written for this project. An Inno Setup install script exists but no built installer has been published as a release yet.',
      tags: ['#FLUTTER', '#DART', '#TCP', '#FFI'],
      stats: [
        { label: 'Last Push', value: 'Feb 2026' },
        { label: 'Size', value: '2.3 MB' },
        { label: 'License', value: 'none (vendored driver: MIT)' },
      ],
      branch: 'main',
      color: '#0175C2',
      repoUrl: 'github.com/Mykal-Steele/Vexta',
    },
    {
      id: 'cognimax',
      name: 'CogniMax',
      status: 'BETA',
      language: 'Python',
      langColor: '#3572A5',
      description:
        "A chess research project modeling how a player of a given skill level actually plays, not just the strongest move. An expectimax search takes Stockfish's top candidate replies and weights them by maia3's predicted human-reply probabilities (with a risk-sensitivity parameter), so the engine can flag moves that are statistically likely to induce a blunder at a target Elo.",
      archNote:
        "Runs as a notebook on Google Colab with a GPU for the maia3 policy net, paired with a local Stockfish 18 binary and python-chess. A real statistics layer backs the results: bootstrap A/B tests, Holm-corrected paired tests, power analysis. The author's own README says runs 1 through 5 are complete and run 6 stopped partway after an out-of-memory crash — this is an active, self-audited research project, not a finished product.",
      tags: ['#PYTHON', '#CHESS', '#PYTORCH', '#RESEARCH'],
      stats: [
        { label: 'Last Push', value: 'Jul 2026' },
        { label: 'Size', value: '34 MB' },
        { label: 'License', value: 'none' },
      ],
      branch: 'main',
      color: '#fe9d00',
      repoUrl: 'github.com/Mykal-Steele/CogniMax',
    },
    {
      id: 'archmaster',
      name: 'ArchMaster',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        "A Gemini-backed study tool for a Computer Architecture exam, built into this site at /cao/. A real bank of problems (ISA encoding, cache mapping, virtual memory translation, pipeline hazards, Amdahl's law, and more) each ship with a fully worked solution, and a chat panel answers follow-up questions grounded in a retrieval layer over the course notes rather than the model's memory alone.",
      archNote:
        'The retrieval step chunks a bundled study-notes file and scores chunks against the question with Fuse.js fuzzy search plus a hand-written keyword-overlap score, then feeds the best matches into the prompt before streaming the answer back. A "Reasoning On" toggle swaps in a slower model with a larger thinking budget for harder questions.',
      tags: ['#REACT', '#GEMINI', '#RAG', '#VITE'],
      stats: [
        { label: 'Type', value: 'Vite + React app' },
        { label: 'Served at', value: '/cao/' },
      ],
      branch: 'main',
      color: '#00ffc2',
      liveUrl: '/cao/',
    },
    {
      id: 'rhythm-dots',
      name: 'Rhythm Dots',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        'A canvas rhythm game built into this site at /rygame. Dots fall down 8 lanes in time with a synced audio track; hit the matching key when a dot lands and keep the streak alive. Difficulty levels, achievements, a daily quest, and a real backend leaderboard for logged-in players, with a localStorage fallback for anonymous play.',
      archNote:
        "Hand-rolled game loop on a canvas, driven by requestAnimationFrame synced to the audio element's currentTime, no game engine. Adapted from an existing rhythm-game concept (credited in-app to Jack Eisenmann / ostracod, music by Soleviio) rather than an original design from scratch.",
      tags: ['#CANVAS', '#GAME', '#REACT'],
      stats: [
        { label: 'Type', value: 'Canvas game' },
        { label: 'Served at', value: '/rygame' },
      ],
      branch: 'main',
      color: '#ff9195',
      liveUrl: '/rygame',
    },
    {
      id: 'mistbound',
      name: 'Mistbound',
      status: 'BETA',
      language: 'C#',
      langColor: '#178600',
      description:
        'A Unity 2D action-platformer prototype. Double-jump and wall-slide movement, mouse-aimed shooting, two enemy types (including a timing-based QTE enemy that freezes game time during the encounter), a kill-count quest tracker, and a health/damage system with UI.',
      archNote:
        "Built solo over about 16 months (79 commits). Still missing a finished death/game-over flow (there's a literal TODO for it in the player controller), and one enemy's damage handler is an empty stub. A genuine work in progress, not a finished game.",
      tags: ['#UNITY', '#CSHARP', '#GAMEDEV'],
      stats: [
        { label: 'Last Push', value: 'Jul 2025' },
        { label: 'Commits', value: '79' },
        { label: 'Size', value: '37 MB' },
        { label: 'License', value: 'MIT' },
      ],
      branch: 'main',
      color: '#178600',
      repoUrl: 'github.com/Mykal-Steele/MIstboundMain',
    },
    {
      id: 'chronochunk',
      name: 'ChronoChunk',
      status: 'BETA',
      language: 'Python',
      langColor: '#3572A5',
      description:
        "A Discord bot. What's actually deployed on the default branch is a small, working MVP: a number-guessing game and a utility command that splits long pasted text into Discord's message-size limit, kept alive on Render's free tier via a scheduled health-check ping. The real work in progress lives on an unmerged branch: AI personality and memory, and music playback via yt-dlp.",
      archNote:
        'discord.py + aiohttp for the deployed MVP; the unmerged branch adds a proper module layout with its own pytest suite. Described here as BETA because the substantial version of this project has not shipped to the branch that runs in production yet.',
      tags: ['#PYTHON', '#DISCORD', '#AI'],
      stats: [
        { label: 'Active branch', value: 'ai/chat' },
        { label: 'Last Push', value: 'Jul 2026' },
        { label: 'License', value: 'MIT' },
      ],
      branch: 'ai/chat',
      color: '#fe9d00',
      repoUrl: 'github.com/Mykal-Steele/ChronoChunk',
    },
    {
      id: 'coding-challenges',
      name: 'Coding Challenges',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        'An in-browser JavaScript problem set built into this site at /coding, nine problems from easy to hard (prime sieves, Tower of Hanoi, matrix multiplication, closest pair of points, grid word search, and more). A CodeMirror editor, per-problem test cases with a deep-equal checker, and progress saved to localStorage.',
      archNote:
        "Code runs directly on the main thread via the Function constructor against each test case, not in an isolated Web Worker (a worker-based runner exists in the codebase but isn't actually wired up).",
      tags: ['#REACT', '#CODEMIRROR', '#DSA'],
      stats: [
        { label: 'Problems', value: '9' },
        { label: 'Served at', value: '/coding' },
      ],
      branch: 'main',
      color: '#00ffc2',
      liveUrl: '/coding',
    },
    {
      id: 'data-lookup',
      name: 'Data Lookup',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        "This site's own analytics dashboard, built at /data-lookup for logged-in accounts. Charts (Recharts) and tables built on the same first-party visitor-fingerprinting data Adorio itself collects: top pages, recent visits, a per-visitor drilldown with browser, screen, and visit history.",
      archNote:
        'Fetches from four real backend endpoints in parallel with Promise.allSettled, so one failing endpoint does not blank the whole page.',
      tags: ['#REACT', '#RECHARTS', '#ANALYTICS'],
      stats: [
        { label: 'Access', value: 'requires login' },
        { label: 'Served at', value: '/data-lookup' },
      ],
      branch: 'main',
      color: '#00ffc2',
      liveUrl: '/data-lookup',
    },
    {
      id: 'finance',
      name: 'Runway',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        'A personal finance tracker at /finance for logged-in accounts. Ported from a standalone localStorage-only artifact into a full-stack, per-user MongoDB-backed feature: balance and monthly budget tracking, categorized income/expense transactions, and a daily spending allowance that excludes fixed costs like rent from the day-to-day budget math.',
      archNote:
        'Three Mongoose collections (settings, categories, transactions) scoped per-user via JWT. Budget math (daily allowance, month-to-date spend, category breakdown) is computed in the service layer, not the client.',
      tags: ['#REACT', '#MONGODB', '#FINANCE'],
      stats: [
        { label: 'Access', value: 'requires login' },
        { label: 'Served at', value: '/finance' },
      ],
      branch: 'main',
      color: '#22c55e',
      liveUrl: '/finance',
    },
    {
      id: 'social',
      name: 'Social Feed',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        "This site's actual social feed, at /social. JWT-authenticated users post text and Cloudinary-hosted images, like and comment on posts, and scroll an infinite feed that streams in over React Suspense — the first page renders server-side, then infinite scroll takes over client-side.",
      archNote:
        'PostsLoader is an async Server Component that SSR-fetches the first page and hands it to Home, which continues with an IntersectionObserver-driven infinite scroll. Likes are debounced 100ms client-side so rapid clicks only send the final state to the server.',
      tags: ['#NEXTJS', '#SUSPENSE', '#MONGODB'],
      stats: [
        { label: 'Access', value: 'requires login' },
        { label: 'Served at', value: '/social' },
      ],
      branch: 'main',
      color: '#00ffc2',
      liveUrl: '/social',
    },
    {
      id: 'smartcity',
      name: 'SmartCity',
      status: 'STABLE',
      language: 'HTML',
      langColor: '#e34c26',
      description:
        "A small documentation viewer at /smartcity hosting real developer-guide docs from Siam Commercial Bank's DeepLink Mobile and Direct Debit APIs, from a smart-city fintech engagement. This is a document reader, not a live API integration, no request/response demo runs on this page.",
      archNote: 'Static HTML guides served from the app, opened through a simple link list.',
      tags: ['#DOCS', '#FINTECH'],
      stats: [{ label: 'Served at', value: '/smartcity' }],
      branch: 'main',
      color: '#e34c26',
      liveUrl: '/smartcity',
    },
  ] as Project[],

  skills: [
    { name: 'typescript', version: '5.4.0', category: 'Language', active: true },
    { name: 'javascript', version: 'ES2024', category: 'Language', active: true },
    { name: 'go', version: '1.22.0', category: 'Language', active: true },
    { name: 'python', version: '3.12.0', category: 'Language', active: true },
    { name: 'dart', version: '3.x', category: 'Language', active: true },
    { name: 'rust', version: '1.77.0', category: 'Language', active: false },
    { name: 'c++', version: 'C++20', category: 'Language', active: true },
    { name: 'c#', version: '.NET 8', category: 'Language', active: true },
    { name: 'java', version: '21 LTS', category: 'Language', active: false },
    { name: 'sql', version: 'Standard', category: 'Language', active: true },
    { name: 'react', version: '18.3.0', category: 'Framework', active: true },
    { name: 'next.js', version: '16.2.0', category: 'Framework', active: true },
    { name: 'flutter', version: '3.x', category: 'Framework', active: true },
    { name: 'express', version: '4.18.0', category: 'Framework', active: true },
    { name: 'tailwind css', version: '3.4.3', category: 'Framework', active: true },
    { name: 'node.js', version: '20 LTS', category: 'Runtime', active: true },
    { name: 'bun', version: '1.1.x', category: 'Runtime', active: true },
    { name: 'git', version: '2.44.0', category: 'Tool', active: true },
    { name: 'docker', version: '25.x', category: 'Tool', active: true },
    { name: 'prisma', version: '7.x', category: 'Tool', active: true },
    { name: 'unity', version: '2022 LTS', category: 'Tool', active: true },
    { name: 'cli development', version: '—', category: 'Tool', active: true },
    { name: 'figma', version: 'latest', category: 'Tool', active: false },
  ],

  stack: [
    {
      category: 'Languages',
      items: ['TypeScript', 'JavaScript', 'Go', 'Python', 'Dart', 'C#', 'C++', 'SQL'],
      color: 'var(--ide-accent)',
    },
    {
      category: 'Frontend',
      items: ['React', 'Next.js', 'Flutter', 'Tailwind CSS'],
      color: 'var(--ide-orange)',
    },
    {
      category: 'Backend',
      items: ['Express', 'Node.js', 'Bun'],
      color: 'var(--ide-purple)',
    },
    {
      category: 'Tools & Infra',
      items: ['Docker', 'Prisma', 'Git', 'Unity', 'CLI Development'],
      color: 'var(--ide-blue)',
    },
  ] as StackGroup[],

  timeline: [
    {
      year: '2026',
      hash: 'a4d2c19',
      event:
        'Microsoft Student Ambassador. 2nd place KMUTT IOT Hackathon (NFC attendance system). Maintaining create-adorex and researching CogniMax, a chess engine that models opponent skill.',
      branch: 'main',
      status: 'IN_PROGRESS',
    },
    {
      year: '2025',
      hash: 'b7e9f31',
      event:
        'Started CS at KMUTT (GPA 3.38). Published create-adorex on NPM. Joined GDG & attended FOSSASIA Summit Bangkok. Team Lead on 50+ dev fintech integration project.',
      branch: 'main',
      status: 'SHIPPED',
    },
    {
      year: '2023',
      hash: 'e9c2a18',
      event:
        'Built first Discord bots and MERN apps. Switched to TypeScript strict mode. Started shipping real projects.',
      branch: 'main',
      status: 'SHIPPED',
    },
    {
      year: '2021',
      hash: 'f6d1e34',
      event: 'Started coding. Picked up React, TypeScript, and the MERN stack.',
      branch: 'origin',
      status: 'INIT',
    },
  ] as TimelineItem[],

  languageDistribution: [
    { name: 'TypeScript', pct: 60, color: 'var(--ide-ts-blue)' },
    { name: 'JavaScript', pct: 20, color: 'var(--ide-yellow)' },
    { name: 'Python', pct: 10, color: 'var(--ide-blue)' },
    { name: 'C++', pct: 6, color: 'var(--ide-orange)' },
    { name: 'Go', pct: 4, color: 'var(--ide-cyan)' },
  ] as LanguageStat[],

  searchResults: [
    { file: 'dashboard.tsx', line: 1, content: '// Full-Stack Developer — Oakar Oo', path: '/' },
    {
      file: 'dashboard.tsx',
      line: 12,
      content: "const developer = { name: 'Oakar Oo' }",
      path: '/',
    },
    { file: 'about_me.md', line: 7, content: '# Full-Stack Dev at KMUTT Bangkok', path: '/about' },
    { file: 'about_me.md', line: 14, content: 'MSA · GDG · FOSSASIA Summit', path: '/about' },
    {
      file: 'projects.json',
      line: 1,
      content: '"name": "create-adorex" // NPM CLI',
      path: '/projects',
    },
    { file: 'contact.sh', line: 3, content: '#!/bin/bash — init_connection()', path: '/contact' },
  ] as SearchResult[],

  portfolioDeps: [
    'next@16.2.4',
    'react@18.3.1',
    'tailwindcss@3.x',
    'framer-motion@12.x',
    'next-themes@0.4.6',
    'lucide-react@latest',
    'redux-toolkit@2.x',
  ],
};
