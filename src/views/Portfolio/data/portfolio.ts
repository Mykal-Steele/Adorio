// Portfolio data is the single source of truth for all portfolio UI.

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
  summary: string;
  description: string;
  archNote: string;
  tags: string[];
  stats: ProjectStat[];
  color: string;
  npm?: string;
  repoUrl?: string;
  liveUrl?: string;
  requiresAccount?: boolean;
}

export interface TimelineItem {
  year: string;
  event: string;
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

export interface NowItem {
  label: string;
  detail: string;
}

export interface Skill {
  name: string;
  category: 'Language' | 'Framework' | 'Runtime' | 'Tool';
}

export const portfolioData = {
  name: 'Oakar Oo',
  handle: 'OAKAR_OO',
  role: 'Backend & Full-Stack Developer',
  headline: 'Computer Science student at KMUTT, backend and full-stack developer',
  branch: 'main/production',
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
  university: 'KMUTT · CS Year 3 · GPA 3.28',

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

  now: [
    {
      label: 'Java Programming Mentor',
      detail: 'SIT-KMUTT · Programming in Java',
    },
    {
      label: 'Building Uniloom',
      detail: 'with UniCorp, a student developer group',
    },
  ] as NowItem[],

  experience: [
    {
      role: 'Java Programming Mentor',
      org: 'SIT-KMUTT · Programming in Java',
      period: 'Aug 2026 to Present',
      highlights: [
        'Mentor 18 first-year CS students with weekly sessions on programming logic, syntax, and OOP',
        '1:1 code review, debugging help, and exam/quiz prep, run as a hybrid class (in person and Microsoft Teams) with code and tips shared in Teams',
        'Built Java practice problems for the class on this site, with a Java compiler hosted on Azure',
      ],
    },
    {
      role: 'Research Intern',
      org: 'IC2 (Innovative Cognitive Computing) Lab, KMUTT · CogniMax Chess Research',
      period: 'Jun 2026 to Jul 2026',
      highlights: [
        'Built CogniMax, a chess engine picking moves by expected value against a given Elo (maia3 human-move model + Stockfish eval)',
        'Across 4,120 games at 11 skill levels (Elo 600 to 2600) it won faster than a same-depth Stockfish baseline at every level. Games were about 20% shorter on average (up to 31%), and the gap was bigger against stronger opponents',
      ],
    },
    {
      role: 'Web Development Mentor',
      org: 'SIT-KMUTT · Intro to Database (SQLite)',
      period: 'Jan 2026 to Jun 2026',
      highlights: [
        'Taught relational modeling and SQLite + Express (TypeScript) + Prisma integration through in-class workshops',
        'Mentored a 3-student team through coursework and a 3-day hackathon (schema design, API, deployment)',
        'Graded all ~60 students at the final hackathon: team presentations with the mentor panel plus 1:1 grading sessions on the code each student wrote',
      ],
    },
    {
      role: 'Financial Team Lead · Full-Stack Developer',
      org: 'KMUTT Integrated Project (Smart City)',
      period: 'Aug to Dec 2025',
      highlights: [
        'Led the financial team in a 50+ developer smart-city build: wallets, balances, transfers, top-ups',
        'Read SCB developer docs and integrated sandbox APIs for PromptPay QR payments (Thai QR Code Payment API) and direct debit',
        'Built the transaction UI in React with WebSocket status updates, server-side validation, failover mechanisms, and automated deploys',
        'Wrote up SCB API guides and shared them with the team, hosted on this site as SmartCity',
      ],
    },
    {
      role: 'Hardware & Backend Engineer',
      org: 'KMUTT IoT Hackathon (2nd Place)',
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
      name: 'Adorio',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'This site: a Next.js portfolio with an Express REST API, JWT auth, a social feed, coding challenges, and exam notes.',
      description:
        "The site you're on right now is my portfolio and a home for tools I build for myself and my classmates. A Next.js 16 App Router frontend paired with a separate Express REST API, both in TypeScript. JWT auth, social feed with Cloudinary image uploads, coding challenges on a self-hosted sandbox, exam notes, and more. The resume page updates itself from Google Drive.",
      archNote:
        'Backend follows a strict Controller to Service to Model to Schema layering with Zod validation and MongoDB Atlas via Mongoose. Nginx, Next.js and backend ship as one Docker image to Azure Container Apps behind Cloudflare (plus a failover worker), Azure infra in Bicep templates. Every push to main runs format, lint, typecheck, build, and real Puppeteer integration tests against Docker containers before GitHub Actions authenticates via OIDC and deploys, gated on the new revision actually coming up healthy.',
      tags: ['#NEXTJS', '#EXPRESS', '#MONGODB', '#AZURE'],
      stats: [
        { label: 'Last Push', value: 'Oct 2026' },
        { label: 'Created', value: 'Jan 2025' },
        { label: 'License', value: 'AGPL-3.0' },
      ],
      color: '#00ffc2',
      repoUrl: 'github.com/Mykal-Steele/Adorio',
    },
    {
      id: 'chronochunk',
      name: 'ChronoChunk',
      status: 'BETA',
      language: 'Python',
      langColor: '#3572A5',
      summary:
        'A course-aware Discord bot for KMUTT classes: search over scraped class material, music playback, and channel summaries.',
      description:
        'A course-aware Discord chatbot hosted on Azure. Started as a simple number-guessing game and grew up: RAG search over KMUTT classes (scrapes Teams assignment posts and SharePoint lecture transcripts so classmates can ask about courses), music playback in voice from search/YouTube/Spotify links, memory of facts about people it talks to, image/file reading, channel summaries, web search, and PDF/Word/Mermaid generation. It has a hand-tuned casual personality.',
      archNote:
        'Runs on Azure OpenAI (chat model plus a smaller background model) with per-user limits. Deployed with Docker Compose on one small Azure VM (1 GiB RAM), SQLite for data, daily backups, health-check endpoint. Handles accuracy checks, images, PDFs with images, and long text.',
      tags: ['#PYTHON', '#DISCORD', '#RAG', '#AZURE'],
      stats: [
        { label: 'Started', value: 'Feb 2025' },
        { label: 'Last Push', value: 'Oct 2026' },
        { label: 'License', value: 'MIT' },
      ],
      color: '#fe9d00',
      repoUrl: 'github.com/Mykal-Steele/ChronoChunk',
    },
    {
      id: 'coding-challenges',
      name: 'Coding Challenges',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'Java and JavaScript practice problems with a CodeMirror editor, per-problem tests, and a self-hosted Piston sandbox.',
      description:
        'Java practice problems made for my Java class, plus JavaScript problems from my algorithms class for practicing with a friend. A CodeMirror editor, per-problem test cases, and progress saved to localStorage. Java and Python run on a self-hosted Piston sandbox on a separate Azure VM; JavaScript runs in the browser.',
      archNote:
        'The backend starts the Piston VM when a logged-in user opens a Java/Python problem, keeps it warm briefly after each run, and deallocates it when idle (with daily usage caps). JavaScript problems run directly on the main thread via the Function constructor against each test case with a deep-equal checker.',
      tags: ['#REACT', '#CODEMIRROR', '#DSA'],
      stats: [
        { label: 'Problems', value: '9' },
        { label: 'Served at', value: '/coding' },
      ],
      color: '#00ffc2',
      liveUrl: '/coding',
    },
    {
      id: 'create-adorex',
      name: 'create-adorex',
      status: 'STABLE',
      language: 'JavaScript',
      langColor: '#f7df1e',
      summary:
        'An npm CLI that scaffolds an Express + TypeScript + Prisma + SQLite backend in one command.',
      description:
        'A CLI published on NPM that scaffolds a backend project in one command: Express 5, TypeScript, Prisma 7 with SQLite (via libsql), one Prisma model, two starter routes. Built on cac for argument parsing and @clack/prompts for the interactive setup, with a plain string-replace templating step, no config file. Made so web dev students skip repeated server setup and start on database work. It became the 2026 Web Dev class template and is still in use after the class.',
      archNote:
        'One template exists (express-sqlite). There is no Bun/Elysia or Astro template despite what earlier commit messages implied. The CLI itself has three runtime dependencies (cac, @clack/prompts, picocolors), a real node --test suite, and currently no auth scaffolding in the generated project.',
      tags: ['#NPM', '#CLI', '#JAVASCRIPT', '#SCAFFOLDING'],
      stats: [
        { label: 'Version', value: 'v1.4.14' },
        { label: 'Last Push', value: 'Apr 2026' },
        { label: 'License', value: 'MIT' },
      ],
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
      summary:
        'Turns a phone into a virtual webcam on Windows over the local network, using Flutter and Dart FFI.',
      description:
        'Turns a phone into a virtual webcam on Windows over the local network. A Flutter/Dart mobile app captures and JPEG-compresses camera frames and streams them over a raw TCP socket; a second Flutter/Dart app on the Windows side decodes the JPEGs and pipes the raw frames through Dart FFI into a virtual-camera driver so any video call app can see it as a webcam.',
      archNote:
        'The frame capture, TCP streaming, JPEG decode, and FFI bridge are all authored Dart. The softcam driver was compiled in Visual Studio to get the DLL and the camera working; a Windows installer was built with Inno Setup (Feb 2026). Works but not polished, and not touched since.',
      tags: ['#FLUTTER', '#DART', '#TCP', '#FFI'],
      stats: [{ label: 'Last Push', value: 'Feb 2026' }],
      color: '#0175C2',
      repoUrl: 'github.com/Mykal-Steele/Vexta',
    },
    {
      id: 'cognimax',
      name: 'CogniMax',
      status: 'BETA',
      language: 'Python',
      langColor: '#3572A5',
      summary:
        'A chess engine that models how a player at a given skill level plays, not just the strongest move.',
      description:
        "A chess research project from my IC2 internship, modeling how a player of a given skill level actually plays, not just the strongest move. An expectimax search takes Stockfish's top candidate replies and weights them by maia3's predicted human-reply probabilities (with a risk-sensitivity parameter), so the engine can flag moves that are statistically likely to induce a blunder at a target Elo. Experiments ran in several runs on Google Colab with a full research report in the repo.",
      archNote:
        'Runs as a notebook on Google Colab with a GPU for the maia3 policy net, paired with a local Stockfish 18 binary and python-chess. A real statistics layer backs the results: bootstrap A/B tests, Holm-corrected paired tests, power analysis. Scripts recompute every number from the raw data.',
      tags: ['#PYTHON', '#CHESS', '#PYTORCH', '#RESEARCH'],
      stats: [{ label: 'Last Push', value: 'Jul 2026' }],
      color: '#fe9d00',
      repoUrl: 'github.com/Mykal-Steele/CogniMax',
    },
    {
      id: 'cozytalk',
      name: 'CozyTalk',
      status: 'STABLE',
      language: 'Dart',
      langColor: '#0175C2',
      summary:
        'A Flutter team project: anonymous one-on-one and group chat with interest matching, friends, and moderation tools.',
      description:
        'Team project for the Agile Development and Mobile Development class (Apr to Jun 2026): anonymous 1-on-1 and group stranger chat for Android and web, built with Flutter, Riverpod and Firebase. It has interest matching, friends, and admin and ban tools. Designed with the team and run as a simulated agile team with weekly sprints.',
      archNote:
        'My parts: the jukebox (shared music in chat, moved from Audiomack to YouTube), room themes in matchmaking, offline mode, accessibility labels, Firebase Hosting with a deploy workflow, and tests.',
      tags: ['#FLUTTER', '#DART', '#FIREBASE', '#AGILE'],
      stats: [{ label: 'When', value: 'Apr to Jun 2026' }],
      color: '#0175C2',
      repoUrl: 'github.com/CozyTalk/CozyTalk',
    },
    {
      id: 'archmaster',
      name: 'ArchMaster',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'Computer Architecture study notes and worked practice problems at /cao/, with a chat panel grounded in the notes.',
      description:
        "Study notes for a Computer Architecture exam, built into this site at /cao/ for me and my classmates. A real bank of problems (ISA encoding, cache mapping, virtual memory translation, pipeline hazards, Amdahl's law, and more) each ship with a fully worked solution, and a chat panel answers follow-up questions grounded in a retrieval layer over the course notes rather than the model's memory alone.",
      archNote:
        'The retrieval step chunks a bundled study-notes file and scores chunks against the question with Fuse.js fuzzy search plus a hand-written keyword-overlap score, then feeds the best matches into the prompt before streaming the answer back. A "Reasoning On" toggle swaps in a slower model with a larger thinking budget for harder questions.',
      tags: ['#REACT', '#GEMINI', '#RAG', '#VITE'],
      stats: [
        { label: 'Type', value: 'Vite + React app' },
        { label: 'Served at', value: '/cao/' },
      ],
      color: '#00ffc2',
      liveUrl: '/cao/',
    },
    {
      id: 'rhythm-dots',
      name: 'Rhythm Dots',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'A canvas rhythm game at /rygame with difficulty levels, achievements, and a backend leaderboard.',
      description:
        "A canvas rhythm game built into this site at /rygame, a React port of ostracod's pure-JavaScript rhythm game, credited in-app (music by Soleviio). Dots fall down 8 lanes in time with a synced audio track; hit the matching key when a dot lands and keep the streak alive. Difficulty levels, achievements, a daily quest, and a real backend leaderboard for logged-in players, with a localStorage fallback for anonymous play.",
      archNote:
        "Hand-rolled game loop on a canvas, driven by requestAnimationFrame synced to the audio element's currentTime, no game engine. Adapted from an existing rhythm-game concept (credited in-app to Jack Eisenmann / ostracod, music by Soleviio) rather than an original design from scratch.",
      tags: ['#CANVAS', '#GAME', '#REACT'],
      stats: [
        { label: 'Type', value: 'Canvas game' },
        { label: 'Served at', value: '/rygame' },
      ],
      color: '#ff9195',
      liveUrl: '/rygame',
    },
    {
      id: 'mistbound',
      name: 'Mistbound',
      status: 'BETA',
      language: 'C#',
      langColor: '#178600',
      summary: 'A solo Unity 2D action-platformer focused on movement, shooting, and enemy design.',
      description:
        'A solo Unity 2D action-platformer, about 16 months of work (March 2024 to July 2025) focused on satisfying movement: double-jump and wall-slide with a fix so wall jumps cannot generate infinite double jumps, platforms, and background fog. Also mouse-aimed shooting, two enemy types (including a timing-based QTE enemy that freezes game time), a kill-count quest tracker, and a health/damage system with UI. No game-over flow yet, and not worked on since.',
      archNote:
        "Built solo over about 16 months (79 commits). Still missing a finished death/game-over flow (there's a literal TODO for it in the player controller), and one enemy's damage handler is an empty stub. A genuine work in progress, not a finished game.",
      tags: ['#UNITY', '#CSHARP', '#GAMEDEV'],
      stats: [
        { label: 'Last Push', value: 'Jul 2025' },
        { label: 'Commits', value: '79' },
        { label: 'License', value: 'MIT' },
      ],
      color: '#178600',
      repoUrl: 'github.com/Mykal-Steele/MistboundMain',
    },
    {
      id: 'finance',
      name: 'Runway',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'A personal finance tracker at /finance: balances, budgets, categorized transactions, and a daily allowance.',
      description:
        'A personal finance tracker at /finance for logged-in accounts. Ported from a standalone localStorage-only artifact into a full-stack, per-user MongoDB-backed feature: balance and monthly budget tracking, categorized income/expense transactions, and a daily spending allowance that excludes fixed costs like rent from the day-to-day budget math.',
      archNote:
        'Three Mongoose collections (settings, categories, transactions) scoped per-user via JWT. Budget math (daily allowance, month-to-date spend, category breakdown) is computed in the service layer, not the client.',
      tags: ['#REACT', '#MONGODB', '#FINANCE'],
      stats: [
        { label: 'Access', value: 'requires login' },
        { label: 'Served at', value: '/finance' },
      ],
      color: '#22c55e',
      liveUrl: '/finance',
      requiresAccount: true,
    },
    {
      id: 'social',
      name: 'Social Feed',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'The social feed at /social: posts, images, subjects, nested replies, and reactions, streamed with React Suspense.',
      description:
        "This site's actual social feed at /social. It has posts by me and my classmates from 2 years ago to now, with images, subjects, nested replies, and reactions. JWT-authenticated posting, likes and comments, and an infinite feed that streams in over React Suspense: the first page renders server-side, then infinite scroll takes over client-side.",
      archNote:
        'PostsLoader is an async Server Component that SSR-fetches the first page and hands it to Home, which continues with an IntersectionObserver-driven infinite scroll. Likes are debounced 100ms client-side so rapid clicks only send the final state to the server.',
      tags: ['#NEXTJS', '#SUSPENSE', '#MONGODB'],
      stats: [
        { label: 'Access', value: 'requires login' },
        { label: 'Served at', value: '/social' },
      ],
      color: '#00ffc2',
      liveUrl: '/social',
      requiresAccount: true,
    },
    {
      id: 'smartcity',
      name: 'SmartCity',
      status: 'STABLE',
      language: 'HTML',
      langColor: '#e34c26',
      summary:
        "HTML guides on integrating Siam Commercial Bank's DeepLink Mobile and Direct Debit APIs.",
      description:
        "My HTML guides on integrating Siam Commercial Bank's DeepLink Mobile and Direct Debit APIs, written for the smart-city fintech project and hosted at /smartcity. This is a document reader, not a live API integration. No request/response demo runs on this page.",
      archNote: 'Static HTML guides served from the app, opened through a simple link list.',
      tags: ['#DOCS', '#FINTECH'],
      stats: [{ label: 'Served at', value: '/smartcity' }],
      color: '#e34c26',
      liveUrl: '/smartcity',
    },
    {
      id: 'titanic',
      name: 'Spaceship Titanic',
      status: 'STABLE',
      language: 'Orange',
      langColor: '#f97316',
      summary:
        'A group Kaggle data-science class project explored and presented with the Orange data mining app.',
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
      color: '#3572A5',
    },
  ] as Project[],

  skills: [
    { name: 'typescript', category: 'Language' },
    { name: 'javascript', category: 'Language' },
    { name: 'go', category: 'Language' },
    { name: 'python', category: 'Language' },
    { name: 'dart', category: 'Language' },
    { name: 'c++', category: 'Language' },
    { name: 'c#', category: 'Language' },
    { name: 'java', category: 'Language' },
    { name: 'sql', category: 'Language' },
    { name: 'react', category: 'Framework' },
    { name: 'next.js', category: 'Framework' },
    { name: 'flutter', category: 'Framework' },
    { name: 'express', category: 'Framework' },
    { name: 'hono', category: 'Framework' },
    { name: 'nestjs', category: 'Framework' },
    { name: 'riverpod', category: 'Framework' },
    { name: 'tailwind css', category: 'Framework' },
    { name: 'node.js', category: 'Runtime' },
    { name: 'bun', category: 'Runtime' },
    { name: 'git', category: 'Tool' },
    { name: 'bash', category: 'Tool' },
    { name: 'vim', category: 'Tool' },
    { name: 'pnpm', category: 'Tool' },
    { name: 'mise', category: 'Tool' },
    { name: 'sqlite', category: 'Tool' },
    { name: 'postgresql', category: 'Tool' },
    { name: 'mongodb', category: 'Tool' },
    { name: 'rabbitmq', category: 'Tool' },
    { name: 'nginx', category: 'Tool' },
    { name: 'azure', category: 'Tool' },
    { name: 'cloudflare', category: 'Tool' },
    { name: 'firebase', category: 'Tool' },
    { name: 'orval', category: 'Tool' },
    { name: 'swagger', category: 'Tool' },
    { name: 'puppeteer', category: 'Tool' },
    { name: 'pytest', category: 'Tool' },
    { name: 'docker', category: 'Tool' },
    { name: 'prisma', category: 'Tool' },
    { name: 'unity', category: 'Tool' },
    { name: 'cli development', category: 'Tool' },
    { name: 'figma', category: 'Tool' },
  ] as Skill[],

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
        'Btrfs + Snapper snapshots',
      ],
      color: 'var(--ide-orange)',
    },
    {
      category: 'Terminal & Tools',
      items: ['Bash · Vim · pnpm · mise', 'Docker for local databases'],
      color: 'var(--ide-purple)',
    },
  ] as StackGroup[],

  timeline: [
    {
      year: '2026',
      event:
        'Placed 2nd at the KMUTT IoT Hackathon and mentored first-year students in web development. Published create-adorex on npm and became a Microsoft Student Ambassador. Built CozyTalk with a team, then did an IC2 research internship and built CogniMax. Started a business administration degree at University of the People, and now mentor in Java and build Uniloom with UniCorp.',
    },
    {
      year: '2025',
      event:
        'Learned TypeScript, React, Express, Hono, and Bun at KMUTT, then Next.js, NestJS, and Orval. Created Adorio and started ChronoChunk. Led the financial team on a 50+ developer smart-city project.',
    },
    {
      year: '2024',
      event:
        'Started Mistbound in Unity (Mar). First Discord bot, in Python (Apr). Started BSc Computer Science at KMUTT (Aug).',
    },
    {
      year: '2023',
      event:
        'Started learning programming basics properly with Python and LeetCode-style problems.',
    },
    {
      year: '2021',
      event: 'Started making simple games in Unity. Also played around in Roblox Studio.',
    },
    {
      year: '2020',
      event: 'Got into programming at 15 through online HTML classes and Scratch.',
    },
  ] as TimelineItem[],
};
