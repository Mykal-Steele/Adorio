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
  aiAssisted?: boolean;
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
  role: 'Backend & Full-Stack Developer',
  tagline: 'Full-stack developer, Bangkok.',
  branch: 'main/production',
  version: 'v2.0.0-stable',
  email: 'oakar@adorio.space',
  github: 'github.com/Mykal-Steele',
  linkedin: 'linkedin.com/in/oakaroo',
  googleDev: 'g.dev/oakaroo',
  facebook: 'facebook.com/oakarooprofile',
  instagram: 'instagram.com/kruskal.oakar',
  gist: 'gist.github.com/Mykal-Steele',
  buymeacoffee: 'buymeacoffee.com/mykalstele4',
  location: 'Bangkok, Thailand',
  timezone: 'UTC+7',
  university: 'KMUTT — CS Year 3 · GPA 3.28',

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
      role: 'Java Programming Mentor',
      org: 'SIT-KMUTT · Programming in Java',
      period: 'Aug 2026 – Present',
      highlights: [
        'Mentor 18 first-year CS students with weekly sessions on programming logic, syntax, and OOP',
        '1:1 code review, debugging help, and exam/quiz prep — hybrid class (in person + Microsoft Teams), sharing code and tips in Teams',
        'Built Java practice problems for the class on this site, with a Java compiler hosted on Azure',
      ],
    },
    {
      role: 'Capstone Project · Huddle',
      org: 'KMUTT — 3-person team',
      period: 'Starting 2026/1 · one year',
      highlights: [
        'Planning a project-management website that helps students manage assignments — not built yet',
        'Advised by the Associate Dean for Internationalization and Chair in Computer Science at KMUTT',
      ],
    },
    {
      role: 'Research Intern',
      org: 'IC2 (Innovative Cognitive Computing) Lab, KMUTT · CogniMax Chess Research',
      period: 'Jun 2026 – Jul 2026',
      highlights: [
        'Built CogniMax, a chess engine picking moves by expected value against a given Elo (maia3 human-move model + Stockfish eval)',
        'Across 4,120 games at 11 skill levels (Elo 600–2600) it won faster than a same-depth Stockfish baseline at every level — games ~20% shorter on average (up to 31%), gap bigger vs stronger opponents',
      ],
    },
    {
      role: 'Web Development Mentor',
      org: 'SIT-KMUTT · Intro to Database (SQLite)',
      period: 'Jan 2026 – Jun 2026',
      highlights: [
        'Taught relational modeling and SQLite + Express (TypeScript) + Prisma integration through in-class workshops',
        'Mentored a 3-student team through coursework and a 3-day hackathon (schema design, API, deployment)',
        'Graded all ~60 students at the final hackathon: team presentations with the mentor panel plus 1:1 grading sessions on the code each student wrote',
      ],
    },
    {
      role: 'Financial Team Lead · Full-Stack Developer',
      org: 'KMUTT Integrated Project (Smart City)',
      period: 'Aug – Dec 2025',
      highlights: [
        'Led the financial team in a 50+ developer smart-city build: wallets, balances, transfers, top-ups',
        'Read SCB developer docs and integrated sandbox APIs for PromptPay QR payments (Thai QR Code Payment API) and direct debit',
        'Built the transaction UI in React with WebSocket status updates, server-side validation, failover mechanisms, and automated deploys',
        'Wrote up SCB API guides and shared them with the team — hosted on this site as SmartCity',
      ],
    },
    {
      role: 'Hardware & Backend Engineer',
      org: 'KMUTT IoT Hackathon — 2nd Place',
      period: 'Jan 2026',
      highlights: [
        'Built NFC attendance system: ESP32 firmware with PN532 NFC/RFID reader and TFT-240 touch UI (<1s per scan)',
        'Real-time device-to-dashboard sync via RabbitMQ',
      ],
    },
  ] as ExperienceItem[],

  projects: [
    {
      id: 'adorio',
      aiAssisted: true,
      name: 'Adorio',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        "The site you're on right now — my portfolio and a home for tools I build for myself and my classmates. A Next.js 16 App Router frontend paired with a separate Express REST API, both in TypeScript. JWT auth, social feed with Cloudinary image uploads, coding challenges on a self-hosted sandbox, exam notes, and more. The resume page updates itself from Google Drive.",
      archNote:
        'Backend follows a strict Controller to Service to Model to Schema layering with Zod validation and MongoDB Atlas via Mongoose. Nginx, Next.js and backend ship as one Docker image to Azure Container Apps behind Cloudflare (plus a failover worker), Azure infra in Bicep templates. Every push to main runs format, lint, typecheck, build, and real Puppeteer integration tests against Docker containers before GitHub Actions authenticates via OIDC and deploys, gated on the new revision actually coming up healthy.',
      tags: ['#NEXTJS', '#EXPRESS', '#MONGODB', '#AZURE'],
      stats: [
        { label: 'Last Push', value: 'Oct 2026' },
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
      aiAssisted: true,
      name: 'create-adorex',
      status: 'STABLE',
      language: 'JavaScript',
      langColor: '#f7df1e',
      description:
        'A CLI published on NPM that scaffolds a backend project in one command: Express 5, TypeScript, Prisma 7 with SQLite (via libsql), one Prisma model, two starter routes. Built on cac for argument parsing and @clack/prompts for the interactive setup, with a plain string-replace templating step, no config file. Made so web dev students skip repeated server setup and start on database work — used as the 2026 Web Dev class template, still in use after the class.',
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
      aiAssisted: true,
      name: 'Vexta',
      status: 'STABLE',
      language: 'Dart',
      langColor: '#0175C2',
      description:
        'Turns a phone into a virtual webcam on Windows over the local network. A Flutter/Dart mobile app captures and JPEG-compresses camera frames and streams them over a raw TCP socket; a second Flutter/Dart app on the Windows side decodes the JPEGs and pipes the raw frames through Dart FFI into a virtual-camera driver so any video call app can see it as a webcam.',
      archNote:
        'The frame capture, TCP streaming, JPEG decode, and FFI bridge are all authored Dart. The softcam driver was compiled in Visual Studio to get the DLL and the camera working; a Windows installer was built with Inno Setup (Feb 2026) and shared with friends, who used it for calls with their phone as the camera. Works but not polished, and not touched since.',
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
      aiAssisted: true,
      name: 'CogniMax',
      status: 'BETA',
      language: 'Python',
      langColor: '#3572A5',
      description:
        "A chess research project from my IC2 internship, modeling how a player of a given skill level actually plays, not just the strongest move. An expectimax search takes Stockfish's top candidate replies and weights them by maia3's predicted human-reply probabilities (with a risk-sensitivity parameter), so the engine can flag moves that are statistically likely to induce a blunder at a target Elo. Experiments ran in several runs on Google Colab with a full research report in the repo.",
      archNote:
        'Runs as a notebook on Google Colab with a GPU for the maia3 policy net, paired with a local Stockfish 18 binary and python-chess. A real statistics layer backs the results: bootstrap A/B tests, Holm-corrected paired tests, power analysis — plus scripts that recompute every number from the raw data. Documented caveat: maia3 both predicts and plays the opponent, so results against real humans are still untested.',
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
      id: 'cozytalk',
      aiAssisted: true,
      name: 'CozyTalk',
      status: 'STABLE',
      language: 'Dart',
      langColor: '#0175C2',
      description:
        'Team project for the Agile Development and Mobile Development class (Apr–Jun 2026): anonymous 1-on-1 and group stranger chat for Android and web, built with Flutter, Riverpod and Firebase — interest matching, friends, admin and ban tools. Designed with the team and run as a simulated agile team with weekly sprints; I made the most commits on the team.',
      archNote:
        'My parts: the jukebox (shared music in chat, moved from Audiomack to YouTube), room themes in matchmaking, offline mode, accessibility labels, Firebase Hosting with a deploy workflow, and tests.',
      tags: ['#FLUTTER', '#DART', '#FIREBASE', '#AGILE'],
      stats: [
        { label: 'When', value: 'Apr–Jun 2026' },
        { label: 'Commits', value: 'most on team' },
        { label: 'License', value: 'team project' },
      ],
      branch: 'main',
      color: '#0175C2',
      repoUrl: 'github.com/CozyTalk/CozyTalk',
    },
    {
      id: 'archmaster',
      name: 'ArchMaster',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        "AI-generated study notes for a Computer Architecture exam, built into this site at /cao/ for me and my classmates. A real bank of problems (ISA encoding, cache mapping, virtual memory translation, pipeline hazards, Amdahl's law, and more) each ship with a fully worked solution, and a chat panel answers follow-up questions grounded in a retrieval layer over the course notes rather than the model's memory alone.",
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
      aiAssisted: true,
      name: 'Rhythm Dots',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        "A canvas rhythm game built into this site at /rygame — a React port of ostracod's pure-JavaScript rhythm game, credited in-app (music by Soleviio). Dots fall down 8 lanes in time with a synced audio track; hit the matching key when a dot lands and keep the streak alive. Difficulty levels, achievements, a daily quest, and a real backend leaderboard for logged-in players, with a localStorage fallback for anonymous play.",
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
        'A solo Unity 2D action-platformer, about 16 months of work (March 2024 to July 2025) focused on satisfying movement: double-jump and wall-slide with a fix so wall jumps cannot generate infinite double jumps, platforms, and background fog. Also mouse-aimed shooting, two enemy types (including a timing-based QTE enemy that freezes game time), a kill-count quest tracker, and a health/damage system with UI. No game-over flow yet, and not worked on since.',
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
      repoUrl: 'github.com/Mykal-Steele/MistboundMain',
    },
    {
      id: 'chronochunk',
      aiAssisted: true,
      name: 'ChronoChunk',
      status: 'BETA',
      language: 'Python',
      langColor: '#3572A5',
      description:
        'A course-aware Discord chatbot hosted on Azure. Started as a simple number-guessing game and grew up: RAG search over KMUTT classes (scrapes Teams assignment posts and SharePoint lecture transcripts so classmates can ask about courses), music playback in voice from search/YouTube/Spotify links, memory of facts about people it talks to, image/file reading, channel summaries, web search, and PDF/Word/Mermaid generation — with a hand-tuned casual personality.',
      archNote:
        'Runs on Azure OpenAI (chat model plus a smaller background model) with a spending cap and per-user limits. Deployed with Docker Compose on one small Azure VM (1 GiB RAM), SQLite for data, daily backups, health-check endpoint. Handles accuracy checks, images, PDFs with images, and long text.',
      tags: ['#PYTHON', '#DISCORD', '#RAG', '#AZURE'],
      stats: [
        { label: 'Started', value: 'Feb 2025' },
        { label: 'Last Push', value: 'Oct 2026' },
        { label: 'License', value: 'MIT' },
      ],
      branch: 'main',
      color: '#fe9d00',
      repoUrl: 'github.com/Mykal-Steele/ChronoChunk',
    },
    {
      id: 'coding-challenges',
      aiAssisted: true,
      name: 'Coding Challenges',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        'Java practice problems made for my Java class, plus JavaScript problems from my algorithms class for practicing with a friend. A CodeMirror editor, per-problem test cases, and progress saved to localStorage. Java and Python run on a self-hosted Piston sandbox on a separate Azure VM; JavaScript runs in the browser.',
      archNote:
        'The backend starts the Piston VM when a logged-in user opens a Java/Python problem, keeps it warm briefly after each run, and deallocates it when idle (with daily usage caps). JavaScript problems run directly on the main thread via the Function constructor against each test case with a deep-equal checker.',
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
        "This site's own monitoring dashboard, built at /data-lookup for logged-in accounts. Audit-log style view of visits plus charts (Recharts) and tables on the same first-party visitor-fingerprinting data Adorio collects: top pages, recent visits, a per-visitor drilldown with browser, screen, and visit history.",
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
      aiAssisted: true,
      name: 'Social Feed',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      description:
        "This site's actual social feed, at /social — posts by me and my classmates from 2 years ago to now, with images, subjects, nested replies, and reactions. JWT-authenticated posting, likes and comments, and an infinite feed that streams in over React Suspense: the first page renders server-side, then infinite scroll takes over client-side.",
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
        "My HTML guides on integrating Siam Commercial Bank's DeepLink Mobile and Direct Debit APIs, written for the smart-city fintech project and hosted at /smartcity. This is a document reader, not a live API integration — no request/response demo runs on this page.",
      archNote: 'Static HTML guides served from the app, opened through a simple link list.',
      tags: ['#DOCS', '#FINTECH'],
      stats: [{ label: 'Served at', value: '/smartcity' }],
      branch: 'main',
      color: '#e34c26',
      liveUrl: '/smartcity',
    },
    {
      id: 'titanic',
      name: 'Spaceship Titanic',
      status: 'STABLE',
      language: 'Orange',
      langColor: '#f97316',
      description:
        'Group Kaggle project for my KMUTT data science class (Sep 2026). Analyzed the Spaceship Titanic dataset with the Orange data mining app and presented it with exploratory analysis and scatter plots.',
      archNote:
        'Orange data workflows for exploration; presented findings with scatter plots and summary analysis.',
      tags: ['#PYTHON', '#KAGGLE', '#DATA'],
      stats: [
        { label: 'When', value: 'Sep 2026' },
        { label: 'Type', value: 'class project' },
        { label: 'Analyzed with', value: 'Orange' },
      ],
      branch: 'main',
      color: '#3572A5',
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
    { name: 'java', version: '21 LTS', category: 'Language', active: true },
    { name: 'sql', version: 'Standard', category: 'Language', active: true },
    { name: 'react', version: '18.3.0', category: 'Framework', active: true },
    { name: 'next.js', version: '16.2.0', category: 'Framework', active: true },
    { name: 'flutter', version: '3.x', category: 'Framework', active: true },
    { name: 'express', version: '4.18.0', category: 'Framework', active: true },
    { name: 'hono', version: '—', category: 'Framework', active: true },
    { name: 'nestjs', version: '—', category: 'Framework', active: true },
    { name: 'riverpod', version: '—', category: 'Framework', active: true },
    { name: 'tailwind css', version: '3.4.3', category: 'Framework', active: true },
    { name: 'node.js', version: '20 LTS', category: 'Runtime', active: true },
    { name: 'bun', version: '1.1.x', category: 'Runtime', active: true },
    { name: 'git', version: '2.44.0', category: 'Tool', active: true },
    { name: 'bash', version: '—', category: 'Tool', active: true },
    { name: 'vim', version: '—', category: 'Tool', active: true },
    { name: 'pnpm', version: '—', category: 'Tool', active: true },
    { name: 'mise', version: '—', category: 'Tool', active: true },
    { name: 'sqlite', version: '—', category: 'Tool', active: true },
    { name: 'postgresql', version: '—', category: 'Tool', active: true },
    { name: 'mongodb', version: '—', category: 'Tool', active: true },
    { name: 'rabbitmq', version: '—', category: 'Tool', active: true },
    { name: 'nginx', version: '—', category: 'Tool', active: true },
    { name: 'azure', version: '—', category: 'Tool', active: true },
    { name: 'cloudflare', version: '—', category: 'Tool', active: true },
    { name: 'firebase', version: '—', category: 'Tool', active: true },
    { name: 'orval', version: '—', category: 'Tool', active: true },
    { name: 'swagger', version: '—', category: 'Tool', active: true },
    { name: 'puppeteer', version: '—', category: 'Tool', active: true },
    { name: 'pytest', version: '—', category: 'Tool', active: true },
    { name: 'docker', version: '25.x', category: 'Tool', active: true },
    { name: 'prisma', version: '7.x', category: 'Tool', active: true },
    { name: 'unity', version: '2022 LTS', category: 'Tool', active: true },
    { name: 'cli development', version: '—', category: 'Tool', active: true },
    { name: 'figma', version: 'latest', category: 'Tool', active: true },
  ],

  stack: [
    {
      category: 'Languages',
      items: ['TypeScript', 'JavaScript', 'Java', 'SQL', 'Go', 'Python', 'Dart', 'C#', 'C++'],
      color: 'var(--ide-accent)',
    },
    {
      category: 'Frontend',
      items: ['React', 'Next.js', 'Tailwind CSS', 'Flutter'],
      color: 'var(--ide-orange)',
    },
    {
      category: 'Backend',
      items: ['Node.js', 'Bun', 'Express', 'Hono', 'Prisma', 'NestJS'],
      color: 'var(--ide-purple)',
    },
    {
      category: 'Data & Infra',
      items: ['SQLite', 'PostgreSQL', 'MongoDB', 'Docker', 'Nginx', 'Azure', 'Cloudflare', 'Git'],
      color: 'var(--ide-blue)',
    },
    {
      category: 'Hardware & More',
      items: ['ESP32', 'RabbitMQ', 'Unity', 'Figma', 'CLI Development'],
      color: 'var(--ide-green)',
    },
  ] as StackGroup[],

  setup: [
    {
      category: 'Laptop',
      items: [
        'ASUS Zenbook 14X OLED (UX5401ZAS)',
        'i7-12700H · 14c/20t · 16 GB RAM · 1 TB NVMe',
        '3840x2400 OLED · HyperX SoloCast mic',
      ],
      color: 'var(--ide-accent)',
    },
    {
      category: 'OS',
      items: [
        'Omarchy (Arch-based) + Hyprland on Wayland',
        'Dual-boot Windows 11 · Limine bootloader',
        'Btrfs + Snapper snapshots · monthly scrub · arch-audit',
      ],
      color: 'var(--ide-orange)',
    },
    {
      category: 'Terminal & Tools',
      items: ['Bash · Vim · pnpm · mise', 'Docker for local databases'],
      color: 'var(--ide-purple)',
    },
    {
      category: 'Own Fixes (with Claude Code)',
      items: [
        'Camera shutter: Fn+F10 DKMS module + service moves the cover',
        'MT7922 WiFi: patched driver + power tweaks + watchdog service',
      ],
      color: 'var(--ide-blue)',
    },
    {
      category: 'AI Tools',
      items: ['Claude Code · Gemini API · Google AI Pro'],
      color: 'var(--ide-green)',
    },
  ] as StackGroup[],

  timeline: [
    {
      year: '2026',
      hash: 'a4d2c19',
      event:
        '2nd place KMUTT IoT Hackathon (Jan). Web dev mentor (Jan–Jun). Build with AI Bangkok + Vim workshop (Mar). create-adorex on npm + Microsoft Student Ambassador (Apr, $150/mo Azure credit hosts my projects). CozyTalk with an agile team (Apr–Jun). IBM Bob hackathon (May). IC2 research internship + CogniMax (Jun–Jul). Google Cloud Next Extended Bangkok (Jul). Java mentor (Aug). Business degree at UoPeople, Spaceship Titanic, UniGym (Sep). Uniloom with UniCorp (Oct). Capstone Huddle begins. GDG: on Campus KMUTT + Cloud Bangkok.',
      branch: 'main',
      status: 'IN_PROGRESS',
    },
    {
      year: '2025',
      hash: 'b7e9f31',
      event:
        'Learned TypeScript, React, Express, Hono, and Bun at KMUTT, then Next.js, NestJS, and Orval. Created Adorio (Jan). Started ChronoChunk (Feb). FOSSASIA Summit Bangkok (Mar). Google Cloud Next Extended Bangkok (Jul). Team Lead on the 50+ dev smart-city project (Aug–Dec). Joined GDG (Oct).',
      branch: 'main',
      status: 'SHIPPED',
    },
    {
      year: '2024',
      hash: 'c1f7a22',
      event:
        'Started Mistbound in Unity (Mar). First Discord bot, in Python (Apr). Started BSc Computer Science at KMUTT (Aug).',
      branch: 'main',
      status: 'SHIPPED',
    },
    {
      year: '2023',
      hash: 'e9c2a18',
      event:
        'Started learning programming basics properly with Python and LeetCode-style problems.',
      branch: 'main',
      status: 'SHIPPED',
    },
    {
      year: '2021',
      hash: 'd3b5f07',
      event: 'Started making simple games in Unity. Also played around in Roblox Studio.',
      branch: 'main',
      status: 'SHIPPED',
    },
    {
      year: '2020',
      hash: 'f6d1e34',
      event: 'Got into programming at 15 through online HTML classes and Scratch.',
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
    {
      file: 'dashboard.tsx',
      line: 1,
      content: '// Backend & Full-Stack Developer — Oakar Oo',
      path: '/',
    },
    {
      file: 'dashboard.tsx',
      line: 12,
      content: "const developer = { name: 'Oakar Oo' }",
      path: '/',
    },
    {
      file: 'about_me.md',
      line: 7,
      content: '# Backend & Full-Stack Dev at KMUTT Bangkok',
      path: '/about',
    },
    { file: 'about_me.md', line: 14, content: 'MSA · GDG · FOSSASIA Summit', path: '/about' },
    { file: 'about_me.md', line: 20, content: 'Capstone Huddle — KMUTT 2026/1', path: '/about' },
    {
      file: 'projects.json',
      line: 1,
      content: '"name": "create-adorex" // NPM CLI',
      path: '/projects',
    },
    {
      file: 'projects.json',
      line: 4,
      content: '"name": "cozytalk" // Flutter chat',
      path: '/projects',
    },
    {
      file: 'projects.json',
      line: 5,
      content: '"name": "titanic" // Kaggle x Orange',
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
