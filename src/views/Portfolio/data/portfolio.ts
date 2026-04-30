// Portfolio data — single source of truth for all portfolio UI

export interface Project {
  id: string;
  name: string;
  status: 'STABLE' | 'BETA' | 'DEPRECATED';
  language: string;
  langColor: string;
  description: string;
  lastCommit: string;
  commitMessage: string;
  commitHash: string;
  footprint: string;
  stars: number;
  tags: string[];
  uptime: string;
  cpu: string;
  latency: string;
  mem: string;
  threadPool: string;
  kernelSync: string;
  archNote: string;
  branch: string;
  color: string;
  npm?: string;
  repoUrl?: string;
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

  commits: [
    {
      hash: 'a4d2c19',
      message: 'feat: release create-adorex v1.4.0 with Bun/Elysia template',
      branch: 'main',
      time: '2 days ago',
      additions: 234,
      deletions: 18,
    },
    {
      hash: 'b7e9f31',
      message: 'feat: add Hono backend scaffold to adorex CLI',
      branch: 'main',
      time: '1 week ago',
      additions: 187,
      deletions: 42,
    },
    {
      hash: 'c1a8e72',
      message: 'fix: resolve Windows path normalization bug in CLI',
      branch: 'fix/win-paths',
      time: '2 weeks ago',
      additions: 23,
      deletions: 11,
    },
    {
      hash: 'd3f4b56',
      message: 'feat: build portfolio as VSCode-style IDE',
      branch: 'main',
      time: '1 month ago',
      additions: 1842,
      deletions: 0,
    },
    {
      hash: 'e9c2a18',
      message: 'refactor: migrate discord-forge to TypeScript strict mode',
      branch: 'feature/ts-strict',
      time: '2 months ago',
      additions: 312,
      deletions: 289,
    },
    {
      hash: 'f6d1e34',
      message: 'chore: update TypeScript 5.4, Bun to 1.1.x',
      branch: 'main',
      time: '3 months ago',
      additions: 14,
      deletions: 8,
    },
    {
      hash: 'g0b7c91',
      message: 'feat: initial Axum REST API scaffold with SQLx + JWT',
      branch: 'feature/rust-backend',
      time: '4 months ago',
      additions: 447,
      deletions: 0,
    },
  ],

  pullRequests: [
    {
      id: 18,
      title: 'feat: Add Astro + Tailwind 4.0 template to adorex',
      status: 'open',
      base: 'main',
      head: 'feature/astro-template',
      reviews: 0,
      comments: 3,
      time: '3 days ago',
    },
    {
      id: 17,
      title: 'fix: Windows path resolution in create-adorex CLI',
      status: 'merged',
      base: 'main',
      head: 'fix/win-paths',
      reviews: 1,
      comments: 5,
      time: '2 weeks ago',
    },
    {
      id: 15,
      title: 'feat: Add Hono + Bun backend scaffold',
      status: 'merged',
      base: 'main',
      head: 'feature/hono-scaffold',
      reviews: 0,
      comments: 2,
      time: '1 month ago',
    },
    {
      id: 12,
      title: 'docs: Add CONTRIBUTING.md and usage examples',
      status: 'closed',
      base: 'main',
      head: 'docs/contributing',
      reviews: 0,
      comments: 1,
      time: '2 months ago',
    },
  ],

  projects: [
    {
      id: 'create-adorex',
      name: 'create-adorex',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        'CLI tool on NPM that scaffolds production-ready backend environments. Generates an Express + TypeScript + Prisma 7 + SQLite project in one command — like create-vite but for backends. Reduces setup time by 70–80%. v1.4.0 adds Bun/Elysia and Astro templates.',
      lastCommit: '2 days ago',
      commitMessage: 'feat: bump to v1.4.0, add Bun/Elysia template',
      commitHash: 'a4d2c19',
      footprint: '48 KB',
      stars: 24,
      tags: ['#NPM', '#CLI', '#TYPESCRIPT', '#SCAFFOLDING'],
      uptime: '99.99%',
      cpu: '0.1%',
      latency: '0.3ms',
      mem: '64 MB',
      threadPool: '1 ACTIVE',
      kernelSync: 'STABLE',
      archNote:
        'Zero runtime dependencies. Template engine reads adorex.config.ts and scaffolds routes, DB schemas, and auth wiring. Cross-platform path normalization added in v1.3.x. Available on NPM: npx create-adorex.',
      branch: 'main',
      color: '#00ffc2',
      npm: 'npmjs.com/package/create-adorex',
      repoUrl: 'github.com/Mykal-Steele/adorex-cli',
    },
    {
      id: 'chroma-board',
      name: 'ChromaBoard',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        'Project management web app built with the MERN stack. Features real-time board sync, kanban boards, and role-based access control. Uses Express + MongoDB Atlas with JWT auth and Socket.io for live collaboration.',
      lastCommit: '2 months ago',
      commitMessage: 'feat: add real-time board sync via WebSockets',
      commitHash: 'f2a9c84',
      footprint: '2.1 MB',
      stars: 11,
      tags: ['#REACT', '#EXPRESS', '#MONGODB', '#WEBSOCKET'],
      uptime: '98.4%',
      cpu: '4.2%',
      latency: '22ms',
      mem: '512 MB',
      threadPool: '4 ACTIVE',
      kernelSync: 'STABLE',
      archNote:
        'Socket.io handles real-time sync. Express REST API with JWT auth middleware. MongoDB Atlas for cloud storage. React Query for client-side cache invalidation and optimistic updates.',
      branch: 'main',
      color: '#00ffc2',
    },
    {
      id: 'vexta',
      name: 'Vexta',
      status: 'STABLE',
      language: 'C++',
      langColor: '#f34b7d',
      description:
        'Cross-platform system to use your phone as a virtual webcam on Windows. Flutter (Dart) mobile sender streams JPEG frames over TCP to a C++ desktop receiver that registers a virtual camera driver (Softcam), making it visible to any video conferencing app.',
      lastCommit: '3 months ago',
      commitMessage: 'chore: bundle DLL registration into Inno Setup installer',
      commitHash: 'v1.0.1',
      footprint: '—',
      stars: 0,
      tags: ['#C++', '#FLUTTER', '#DART', '#TCP'],
      uptime: '—',
      cpu: '—',
      latency: '<1ms',
      mem: '—',
      threadPool: '—',
      kernelSync: 'STABLE',
      archNote:
        'Flutter mobile app → TCP port 4444 → C++ JPEG decoder. Virtual camera driver registered via CMake + CMake + regsvr32. Inno Setup packages everything for one-click Windows install. Reduced setup complexity by ~90%.',
      branch: 'main',
      color: '#f34b7d',
      repoUrl: 'github.com/Mykal-Steele/Vexta',
    },
    {
      id: 'discord-forge',
      name: 'DiscordForge',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        'Discord bot with a web dashboard. Handles slash commands, role automation, and server analytics. Built with Discord.js, Express, and MongoDB.',
      lastCommit: '3 months ago',
      commitMessage: 'refactor: migrate to TypeScript strict mode',
      commitHash: 'e9c2a18',
      footprint: '1.4 MB',
      stars: 8,
      tags: ['#DISCORD.JS', '#TYPESCRIPT', '#EXPRESS', '#MONGODB'],
      uptime: '97.8%',
      cpu: '2.8%',
      latency: '45ms',
      mem: '256 MB',
      threadPool: '2 ACTIVE',
      kernelSync: 'STABLE',
      archNote:
        'Command handler uses a decorator pattern for slash command registration. Cron jobs handle scheduled moderation tasks. Dashboard reads bot state from Redis for low-latency queries.',
      branch: 'main',
      color: '#00ffc2',
    },
    {
      id: 'axum-rest',
      name: 'Axum-REST',
      status: 'BETA',
      language: 'Rust',
      langColor: '#ce422b',
      description:
        'REST API scaffold built with Axum in Rust. A learning project — includes Tower middleware, JWT auth, and SQLx with Postgres. Exploring Rust for web services.',
      lastCommit: '4 months ago',
      commitMessage: 'feat: initial Axum REST API scaffold with SQLx',
      commitHash: 'g0b7c91',
      footprint: '3.2 MB',
      stars: 5,
      tags: ['#RUST', '#AXUM', '#SQLX', '#POSTGRES'],
      uptime: '99.9%',
      cpu: '0.8%',
      latency: '0.6ms',
      mem: '32 MB',
      threadPool: '8 ACTIVE',
      kernelSync: 'SYNCING',
      archNote:
        'Tower middleware for rate limiting and auth. SQLx compile-time query checking catches SQL errors at build time. Learning project for Rust web dev.',
      branch: 'feature/rust-backend',
      color: '#fe9d00',
    },
    {
      id: 'express-legacy',
      name: 'Express-Legacy-API',
      status: 'DEPRECATED',
      language: 'JavaScript',
      langColor: '#f7df1e',
      description:
        'Old REST API from before I switched to TypeScript. Was the backend for my early MERN projects. Replaced by newer tooling using Hono + Bun.',
      lastCommit: '1 year ago',
      commitMessage: 'docs: archival note — see create-adorex for modern scaffold',
      commitHash: '0a1b2c3',
      footprint: '8.4 MB',
      stars: 3,
      tags: ['#NODE', '#EXPRESS', '#MONGO', '#LEGACY'],
      uptime: '—',
      cpu: '—',
      latency: '—',
      mem: '—',
      threadPool: '—',
      kernelSync: 'OFFLINE',
      archNote: 'Pre-TypeScript. Replaced by Hono + Bun rewrites. No active maintenance.',
      branch: 'archive/stable',
      color: '#ff9195',
    },
  ] as Project[],

  liveProjects: [
    {
      name: 'create-adorex',
      status: 'ONLINE',
      uptime: '99.9%',
      cpu: '0.1%',
      latency: '0.3ms',
      mem: '64MB',
    },
    {
      name: 'portfolio-ide',
      status: 'ONLINE',
      uptime: '99.5%',
      cpu: '2.1%',
      latency: '18ms',
      mem: '512MB',
    },
    {
      name: 'discord-forge',
      status: 'DEGRADED',
      uptime: '97.8%',
      cpu: '6.4%',
      latency: '45ms',
      mem: '256MB',
    },
  ],

  skills: [
    { name: 'typescript', version: '5.4.0', category: 'Language', active: true },
    { name: 'javascript', version: 'ES2024', category: 'Language', active: true },
    { name: 'go', version: '1.22.0', category: 'Language', active: true },
    { name: 'python', version: '3.12.0', category: 'Language', active: true },
    { name: 'rust', version: '1.77.0', category: 'Language', active: false },
    { name: 'c++', version: 'C++20', category: 'Language', active: true },
    { name: 'c#', version: '.NET 8', category: 'Language', active: false },
    { name: 'java', version: '21 LTS', category: 'Language', active: false },
    { name: 'sql', version: 'Standard', category: 'Language', active: true },
    { name: 'react', version: '18.3.0', category: 'Framework', active: true },
    { name: 'next.js', version: '16.2.0', category: 'Framework', active: true },
    { name: 'hono', version: '4.3.0', category: 'Framework', active: true },
    { name: 'elysia (bun)', version: '1.0.7', category: 'Framework', active: true },
    { name: 'express', version: '4.18.0', category: 'Framework', active: true },
    { name: 'astro', version: '4.8.0', category: 'Framework', active: true },
    { name: 'tailwind css', version: '3.4.3', category: 'Framework', active: true },
    { name: 'node.js', version: '20 LTS', category: 'Runtime', active: true },
    { name: 'bun', version: '1.1.x', category: 'Runtime', active: true },
    { name: 'git', version: '2.44.0', category: 'Tool', active: true },
    { name: 'docker', version: '25.x', category: 'Tool', active: true },
    { name: 'prisma', version: '7.x', category: 'Tool', active: true },
    { name: 'cli development', version: '—', category: 'Tool', active: true },
    { name: 'figma', version: 'latest', category: 'Tool', active: false },
  ],

  stack: [
    {
      category: 'Languages',
      items: ['TypeScript', 'JavaScript', 'Go', 'Python', 'C++', 'Java', 'SQL'],
      color: 'var(--ide-accent)',
    },
    {
      category: 'Frontend',
      items: ['React', 'Next.js', 'Astro', 'Tailwind CSS 4.0'],
      color: 'var(--ide-orange)',
    },
    {
      category: 'Backend',
      items: ['Hono', 'Bun (Elysia)', 'Express', 'Node.js'],
      color: 'var(--ide-purple)',
    },
    {
      category: 'Tools & Infra',
      items: ['Docker', 'Prisma', 'Git', 'Nginx', 'CLI Development'],
      color: 'var(--ide-blue)',
    },
  ] as StackGroup[],

  timeline: [
    {
      year: '2026',
      hash: 'a4d2c19',
      event:
        'Microsoft Student Ambassador. 2nd place KMUTT IOT Hackathon (NFC attendance system). Building create-adorex v1.4.0.',
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
      content: '"name": "create-adorex" // NPM CLI v1.4.0',
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

  aiResponses: {
    stack:
      '// Querying stack.config...\n\n  Languages:  TypeScript, JavaScript, Go, Python\n               + C++, Java, SQL\n  Frontend:   React, Next.js, Astro, Tailwind CSS 4.0\n  Backend:    Hono, Bun (Elysia), Express\n  Tools:      Docker, Prisma, Git, CLI Development\n\n// 23 packages installed.',
    projects:
      '// Indexing project registry...\n\n  create-adorex    — TypeScript  STABLE  (NPM v1.4.0)\n  ChromaBoard      — TypeScript  STABLE  (MERN fullstack)\n  Vexta            — C++        STABLE  (virtual webcam)\n  DiscordForge     — TypeScript  STABLE  (Discord bot)\n  Axum-REST        — Rust        BETA    (learning project)\n\n// Open projects.json to browse.\n// $ npx create-adorex to try the CLI.',
    available:
      '// Checking calendar.json...\n\n  Status:        OPEN_TO_OPPORTUNITIES\n  Type:          Internship, part-time, or collab\n  University:    KMUTT — CS Year 2 (Bangkok)\n  Timezone:      UTC+7\n  Response time: < 24h\n\n// Open contact.sh to send a message.',
    community:
      '// Reading community.log...\n\n  [ACTIVE] Microsoft Student Ambassadors\n           → AI tools & cloud-based academic projects\n  [ACTIVE] Google Developer Group (GDG)\n           → Modern web & backend tech talks\n  [ATTENDED] FOSSASIA Summit Bangkok — March 2025\n           → Open-source tech, ThaiLLMs, cloud-native',
    philosophy:
      '// Reading notes.txt...\n\n  I like using the right tool for the job.\n  Go when I need speed, Bun for quick dev,\n  Rust when I want to learn low-level stuff.\n\n  create-adorex came from being annoyed\n  at setting up the same project structure\n  over and over.',
    background:
      "// git log --author='Oakar Oo' --reverse...\n\n  2021  — Started coding. TypeScript, React, MERN.\n  2023  — Built first Discord bots & web apps.\n  2025  — Started CS at KMUTT (GPA 3.38).\n           Published create-adorex on NPM.\n           Joined GDG. Attended FOSSASIA Summit.\n  2026  — [CURRENT] MSA member. IOT Hackathon 2nd.\n           Building v1.4.0.",
    contact:
      '// Available channels:\n\n  email:    oakar@adorio.space\n  github:   github.com/Mykal-Steele\n  linkedin: linkedin.com/in/oakaroo\n\n// Open contact.sh tab to send a message.',
    default:
      "// ASK_OO — Oakar's info\n// Topics:\n\n  → 'stack'         tech stack & tools\n  → 'projects'      repos & work\n  → 'available'     work together\n  → 'community'     memberships\n  → 'background'    timeline\n  → 'contact'       how to reach me\n\n// Type a question or click a chip below.",
  },
};
