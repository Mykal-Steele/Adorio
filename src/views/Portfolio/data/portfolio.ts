// Portfolio data is the single source of truth for all portfolio UI.

export interface ProjectDecision {
  title: string;
  reason: string;
}

export interface ProjectShot {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export type ProjectStatus = 'STABLE' | 'BETA' | 'IN_PROGRESS' | 'DEPRECATED';

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  language?: string;
  langColor?: string;
  summary: string;
  problem?: string;
  role?: string;
  decisions?: ProjectDecision[];
  changes?: string[];
  numbers?: string[];
  note?: string;
  tags: string[];
  color: string;
  npm?: string;
  repoUrl?: string;
  liveUrl?: string;
  links?: ProjectLink[];
  requiresAccount?: boolean;
  image?: ProjectImage;
  screenshots?: ProjectShot[];
}

export interface OtherProject {
  name: string;
  href: string;
}

export interface TimelineItem {
  year: string;
  events: string[];
}

export interface ExperienceItem {
  role: string;
  org: string;
  period: string;
  highlights: string[];
  // The project page holds the build details, so the role doesn't repeat them
  projectId?: string;
}

export interface NowItem {
  label: string;
  detail: string;
}

export type SkillGroup = 'Languages' | 'Web' | 'Backend' | 'Data' | 'Tools';

export interface Skill {
  id: string;
  name: string;
  group: SkillGroup;
  // Your own words on how you learned it and what you built with it. Shown on /skills/<id>.
  story: string;
}

export interface SetupItem {
  id: string;
  name: string;
}

export const portfolioData = {
  name: 'Oakar Oo',
  handle: 'OAKAR_OO',
  role: 'Backend Developer',
  headline:
    'CS student at KMUTT, Bangkok. I build backends and the setup that keeps them running: APIs, databases, deployment, and developer experience. Mostly TypeScript, Express/Hono, Prisma, and PostgreSQL.',
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
        'Run code review, debugging help, and exam prep as a hybrid class, with code and notes shared in Microsoft Teams',
      ],
      projectId: 'coding-challenges',
    },
    {
      role: 'Research Intern',
      org: 'IC2 (Innovative Cognitive Computing) Lab, KMUTT · CogniMax Chess Research',
      period: 'Jun 2026 to Jul 2026',
      highlights: [],
      projectId: 'cognimax',
    },
    {
      role: 'Web Development Mentor',
      org: 'SIT-KMUTT · Intro to Database (SQLite)',
      period: 'Jan 2026 to Jun 2026',
      highlights: [
        'Taught relational modeling and SQLite, Express with TypeScript, and Prisma through in-class workshops',
        'Mentored a 3-student team through coursework and a 3-day hackathon: schema design, API, and deployment',
        'Graded all ~60 students at the final hackathon: team presentations plus 1:1 grading on the code each student wrote',
      ],
      projectId: 'create-adorex',
    },
    {
      role: 'Financial Team Lead',
      org: 'KMUTT Integrated Project (Smart City)',
      period: 'Aug to Dec 2025',
      highlights: [],
      projectId: 'smartcity-financial',
    },
    {
      role: 'Hardware and Backend Engineer',
      org: 'KMUTT IoT Hackathon (2nd Place)',
      period: 'Jan 2026',
      highlights: [],
      projectId: 'nfc-attendance',
    },
  ] as ExperienceItem[],

  projects: [
    {
      id: 'chronochunk',
      name: 'ChronoChunk',
      status: 'BETA',
      language: 'Python',
      langColor: '#3572A5',
      summary:
        'A Discord bot for my KMUTT classes that answers course questions from scraped class material and cites the source.',
      problem:
        'Answering one course question meant digging through Teams posts, SharePoint lecture transcripts, the textbook, and the syllabus. I wanted one place to ask, with a citation so the answer can be checked.',
      role: 'Solo developer. I built the scraping and retrieval, citation handling, PDF study guides with practice questions, diagrams, music playback, and channel summaries.',
      decisions: [
        {
          title: 'SQLite for storage and cache',
          reason:
            'I needed something lightweight that keeps data when the bot restarts and works as a cache for scraped material.',
        },
        {
          title: 'Docker Compose on one small Azure VM',
          reason:
            'One deployment target keeps the bot and its dependencies together. Daily backups and a health-check endpoint cover restarts.',
        },
      ],
      changes: [
        'Course answers cite the source: a textbook page, a lecture timestamp, or a syllabus page.',
        'PDF study guides can include practice questions, and the bot can draw system diagrams.',
      ],
      numbers: [
        'About 3 to 5 classmates use it regularly, with a few more using it privately.',
        'The bot runs on one small Azure VM.',
      ],
      tags: ['#PYTHON', '#DISCORD', '#SQLITE', '#AZURE'],
      color: '#fe9d00',
      repoUrl: 'github.com/Mykal-Steele/ChronoChunk',
      image: {
        src: '/projects/chronochunk/study-guide.webp',
        alt: 'Discord conversation asking for an HDFS study guide and system diagram, with the generated PDF attached.',
      },
      screenshots: [
        {
          src: '/projects/chronochunk/study-guide.webp',
          alt: 'Discord conversation asking for an HDFS study guide and system diagram, with the generated PDF attached.',
          caption:
            'A request for an HDFS study guide turns into a PDF with 30 practice questions, followed by an HDFS diagram.',
          width: 2000,
          height: 1310,
        },
        {
          src: '/projects/chronochunk/write-explanation.webp',
          alt: 'Discord answer explaining how an HDFS client writes a file, with textbook page citations.',
          caption:
            'An explanation of the HDFS client write path, citing the textbook pages it came from.',
          width: 2000,
          height: 795,
        },
        {
          src: '/projects/chronochunk/simulation.webp',
          alt: 'Discord walkthrough of HDFS block splitting and replication, citing textbook pages and lecture timestamps.',
          caption:
            'A walkthrough of how a dataset is split into blocks and replicated, with page and lecture timestamp citations.',
          width: 2000,
          height: 934,
        },
        {
          src: '/projects/chronochunk/final-topics.webp',
          alt: 'Discord answer listing AI final topics, citing the course syllabus.',
          caption: 'A list of what is on the AI final, taken from the syllabus.',
          width: 1820,
          height: 688,
        },
        {
          src: '/projects/chronochunk/exam-weights.webp',
          alt: 'Discord answer showing exam 2 weights for two courses, citing lecture timestamps and the course plan.',
          caption:
            'How much exam 2 is worth in two courses, with lecture timestamps and the course plan as sources.',
          width: 2000,
          height: 559,
        },
      ],
    },
    {
      id: 'smartcity-financial',
      name: 'Smart City Financial Module',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'Wallets, top-ups, transfers, and SCB payments for a 50+ student class building one smart city platform.',
      problem:
        'The class platform needed one financial module for wallets, top-ups, user-to-user transfers, and SCB payments. Two transfers at the same time must not corrupt a balance, and a user must never exist without a wallet.',
      role: 'Led the 3-person financial team. My work is in src/modules/Financial of the CSC290 backend.',
      decisions: [
        {
          title: 'Atomic balance changes',
          reason:
            'Prisma increment and decrement instead of read then write, so two transfers at the same time cannot overwrite each other.',
        },
        {
          title: 'User and wallet in one transaction',
          reason:
            'Creating a user and their wallet runs in one Prisma transaction, so there is never a user without a wallet.',
        },
        {
          title: 'One active wallet per user',
          reason:
            'A constraint enforces one wallet per user, and a transfer checks that the wallet is active first.',
        },
      ],
      changes: [
        'SCB integration: OAuth token generation with caching, data encryption with the SCB public key, and PromptPay QR creation. We used QR v1 because v2 was under maintenance.',
        'Metro card top-ups automatically charge the card owner. Donations take a 3% fee.',
        'Moved live updates to Pusher Channels.',
      ],
      note: 'My commits are under OakarOo / Mykal-Steele.',
      tags: ['#HONO', '#PRISMA', '#ZOD', '#TYPESCRIPT'],
      color: '#00ffc2',
      repoUrl: 'github.com/CSC290-2025/backend',
      image: {
        src: '/projects/smartcity-financial/dashboard.webp',
        alt: 'The wallet dashboard with the available balance, connected services, and recent transactions.',
      },
      screenshots: [
        {
          src: '/projects/smartcity-financial/top-up.webp',
          alt: 'The Top Up Wallet page with the balance, destination choices, a metro card ID, and preset amounts.',
          caption:
            'Top-up: pick a destination (wallet, insurance card, or metro card) and an amount.',
          width: 1425,
          height: 1600,
        },
      ],
    },
    {
      id: 'coding-challenges',
      name: 'Coding Challenges',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'Java and JavaScript practice problems with a CodeMirror editor and per-problem tests.',
      problem:
        'I wanted the Java class I mentor to practice problems that match the course, and a place to work through JavaScript algorithms with a friend.',
      role: 'Made the Java problems and the JavaScript set. Built the editor, test runner, and progress storage.',
      decisions: [
        {
          title: 'Self-hosted Piston',
          reason:
            'Paid code-runner APIs charge per run, so Java and Python run on a Piston instance I host on an Azure VM.',
        },
        {
          title: 'JavaScript in the browser',
          reason: 'JavaScript problems run locally, so only Java and Python need the sandbox.',
        },
      ],
      tags: ['#JAVA', '#JAVASCRIPT', '#CODEMIRROR', '#PISTON'],
      color: '#00ffc2',
      liveUrl: '/coding',
      image: {
        src: '/projects/coding-challenges/cover.webp',
        alt: 'The Algorithms class on /coding with the problem list and the Generate Odd Numbers problem open.',
      },
    },
    {
      id: 'nfc-attendance',
      name: 'NFC Attendance',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'NFC attendance for a KMUTT IoT hackathon. Students tap a phone or card instead of scanning a QR code.',
      problem:
        'Every student had to scan a QR code to check in. A tap is faster and removes that step.',
      role: 'Team of three. I wrote the ESP32 firmware (state machine, touch screen UI, audio feedback, PN532 reader, under 1 second per scan) and much of the backend and frontend.',
      decisions: [
        {
          title: 'HTTPS polling from the ESP32',
          reason:
            'Each scan goes to the backend over HTTPS, and the device polls for the card status.',
        },
        {
          title: 'Socket.io for the dashboard',
          reason:
            'The backend pushes live updates to the web app, so the attendance list updates without a refresh.',
        },
      ],
      changes: ['The professor liked removing the QR step.'],
      numbers: ['2nd place, KMUTT SIT IoT Hackathon, January 2026.'],
      tags: ['#ESP32', '#EXPRESS', '#POSTGRES', '#SOCKETIO'],
      color: '#fe9d00',
      links: [
        {
          label: 'Backend repository',
          href: 'https://github.com/kmutt-iot-hackathon-group-8/backend',
        },
        {
          label: 'Frontend repository',
          href: 'https://github.com/kmutt-iot-hackathon-group-8/frontend',
        },
      ],
      image: {
        src: '/projects/nfc-attendance/team-presenting.webp',
        alt: 'Oakar and two teammates presenting the NFC attendance box on stage at the SIT IoT Hackathon 2026.',
      },
      screenshots: [
        {
          src: '/projects/nfc-attendance/finished-box.webp',
          alt: 'The finished attendance box with a touch screen and a buzzer set into its slanted lid.',
          caption: 'The finished box. The touch screen and buzzer sit in the slanted lid.',
          width: 800,
          height: 1067,
        },
        {
          src: '/projects/nfc-attendance/inside-case.webp',
          alt: 'Inside the box: an ESP32 on a breadboard with jumper wires running up to the lid.',
          caption: 'Inside the case, the ESP32 on a breadboard wired up to the lid.',
          width: 800,
          height: 1062,
        },
        {
          src: '/projects/nfc-attendance/breadboard-build.webp',
          alt: 'Wiring the screen and reader to the ESP32 on a breadboard, powered from a power bank.',
          caption: 'The first build on a breadboard, running off a power bank.',
          width: 800,
          height: 1062,
        },
        {
          src: '/projects/nfc-attendance/runner-up.webp',
          alt: 'The team receiving the 1st runner-up prize at the SIT IoT Hackathon 2026.',
          caption: 'Taking 1st runner-up (2nd place) at the SIT IoT Hackathon 2026.',
          width: 1080,
          height: 720,
        },
      ],
    },
    {
      id: 'create-adorex',
      name: 'create-adorex',
      status: 'STABLE',
      language: 'JavaScript',
      langColor: '#f7df1e',
      summary:
        'An npm CLI that scaffolds an Express + TypeScript + Prisma + SQLite backend in one command.',
      problem:
        'Setting up the same stack for every class project was repeated work, and students lost time before they reached the database part.',
      role: 'Built and published the CLI.',
      decisions: [
        {
          title: 'Defaults match the class stack',
          reason:
            'Students start with Express, TypeScript, Prisma, and SQLite, a stack they already know from class.',
        },
      ],
      changes: [
        'It became the Web Dev class template.',
        'I still use it to start my own projects.',
      ],
      numbers: ['30 to 40 students used it as the class template.'],
      tags: ['#NPM', '#CLI', '#EXPRESS', '#PRISMA'],
      color: '#00ffc2',
      npm: 'npmjs.com/package/create-adorex',
      image: {
        src: '/projects/create-adorex/cover.webp',
        alt: 'The create-adorex page on npm with the install command and usage for npm, pnpm, yarn, and bun.',
      },
      repoUrl: 'github.com/Mykal-Steele/adorex-cli',
    },
    {
      id: 'social',
      name: 'Social Feed',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'Where Adorio started: posts, likes, threaded comments, image uploads, and JWT auth.',
      problem:
        'I wanted a place for me and my classmates to post updates and images without another platform.',
      role: 'Built the feed, auth, uploads, comments, and the streaming first page.',
      decisions: [
        {
          title: 'Stream the first page',
          reason: 'PostsLoader fetches page one on the server, then infinite scroll takes over.',
        },
        {
          title: 'Debounce likes',
          reason: 'Rapid clicks wait 100 ms and only the final state is sent.',
        },
      ],
      tags: ['#NEXTJS', '#SUSPENSE', '#MONGODB'],
      color: '#00ffc2',
      liveUrl: '/social',
      image: {
        src: '/projects/social/cover.webp',
        alt: 'The /social feed with the post composer and recent posts pinned to the wall.',
      },
      requiresAccount: true,
    },
    {
      id: 'cognimax',
      name: 'CogniMax',
      status: 'BETA',
      language: 'Python',
      langColor: '#3572A5',
      summary:
        'A chess engine that models how a player at a given skill level plays, not just the strongest move.',
      problem:
        'A normal chess engine assumes perfect play. I wanted one that models how a player at a target Elo actually plays.',
      role: 'Research intern at IC2, KMUTT. Built the engine and ran the experiments.',
      decisions: [
        {
          title: 'Weight replies by maia3',
          reason:
            'The search takes Stockfish top replies and weights them by maia3 predicted human-reply probabilities, with a risk-sensitivity parameter.',
        },
        {
          title: 'Tests on the numbers',
          reason:
            'Bootstrap A/B tests, Holm-corrected paired tests, power analysis, and scripts that recompute every number from the raw data.',
        },
      ],
      numbers: [
        '4,120 games at 11 skill levels (Elo 600 to 2600).',
        'Games about 20% shorter on average, up to 31%.',
        'Won faster than a same-depth Stockfish baseline at every level.',
      ],
      tags: ['#PYTHON', '#CHESS', '#PYTORCH', '#RESEARCH'],
      color: '#fe9d00',
      repoUrl: 'github.com/Mykal-Steele/CogniMax',
    },
    {
      id: 'uniloom',
      name: 'Uniloom',
      status: 'IN_PROGRESS',
      summary: 'A project with UniCorp, a student developer group.',
      role: 'Building it with UniCorp.',
      tags: [],
      color: '#8b5cf6',
      liveUrl: 'https://loom.psstee.me/',
      image: {
        src: '/projects/uniloom/cover.webp',
        alt: 'The Uniloom landing page with a board showing slices in aligning, in progress, and in review.',
      },
    },
  ] as Project[],

  otherProjects: [
    { name: 'Adorio', href: 'https://github.com/Mykal-Steele/Adorio' },
    { name: 'CozyTalk', href: 'https://github.com/CozyTalk/CozyTalk' },
    { name: 'Vexta', href: 'https://github.com/Mykal-Steele/Vexta' },
    { name: 'Mistbound', href: 'https://github.com/Mykal-Steele/MistboundMain' },
    { name: 'Rhythm Dots', href: '/rygame' },
    { name: 'ArchMaster', href: '/cao/' },
    { name: 'Runway', href: '/finance' },
    { name: 'SCB API guides', href: '/smartcity' },
  ] as OtherProject[],

  skills: [
    { id: 'typescript', name: 'TypeScript', group: 'Languages', story: '' },
    { id: 'javascript', name: 'JavaScript', group: 'Languages', story: '' },
    { id: 'java', name: 'Java', group: 'Languages', story: '' },
    { id: 'sql', name: 'SQL', group: 'Languages', story: '' },
    { id: 'python', name: 'Python', group: 'Languages', story: '' },
    { id: 'react', name: 'React', group: 'Web', story: '' },
    { id: 'nextjs', name: 'Next.js', group: 'Web', story: '' },
    { id: 'tailwindcss', name: 'Tailwind CSS', group: 'Web', story: '' },
    { id: 'nodejs', name: 'Node.js', group: 'Backend', story: '' },
    { id: 'bun', name: 'Bun', group: 'Backend', story: '' },
    { id: 'express', name: 'Express', group: 'Backend', story: '' },
    { id: 'hono', name: 'Hono', group: 'Backend', story: '' },
    { id: 'postgresql', name: 'PostgreSQL', group: 'Data', story: '' },
    { id: 'sqlite', name: 'SQLite', group: 'Data', story: '' },
    { id: 'mongodb', name: 'MongoDB', group: 'Data', story: '' },
    { id: 'prisma', name: 'Prisma', group: 'Data', story: '' },
    { id: 'git', name: 'Git', group: 'Tools', story: '' },
    { id: 'linux', name: 'Linux', group: 'Tools', story: '' },
    { id: 'docker', name: 'Docker', group: 'Tools', story: '' },
    { id: 'azure', name: 'Azure', group: 'Tools', story: '' },
  ] as Skill[],

  setup: [
    { id: 'archlinux', name: 'Arch Linux' },
    { id: 'hyprland', name: 'Omarchy / Hyprland' },
    { id: 'vim', name: 'Vim' },
    { id: 'bash', name: 'Bash' },
    { id: 'pnpm', name: 'pnpm' },
    { id: 'mise', name: 'mise' },
  ] as SetupItem[],

  timeline: [
    {
      year: '2026',
      events: [
        'Published create-adorex on npm and became a Microsoft Student Ambassador.',
        'Built CozyTalk with a team.',
        'Started a business administration degree at University of the People.',
      ],
    },
    {
      year: '2025',
      events: [
        'Learned TypeScript, React, Express, Hono, and Bun at KMUTT, then Next.js.',
        'Created Adorio and started ChronoChunk.',
      ],
    },
    {
      year: '2024',
      events: [
        'Started Mistbound in Unity (Mar).',
        'First Discord bot, in Python (Apr).',
        'Started BSc Computer Science at KMUTT (Aug).',
      ],
    },
  ] as TimelineItem[],
};
