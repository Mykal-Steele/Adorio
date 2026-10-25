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

export type ProjectImage = {
  src: string;
  alt: string;
  // Charts are shown whole instead of cropped like screenshots
  fit?: 'contain';
};

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  language?: string;
  langColor?: string;
  // What it is, in one or two sentences
  summary: string;
  problem: string;
  // What I built, as opposed to the team
  role: string;
  // The outcome a recruiter should remember
  result: string;
  // Skill names here link the project to /skills/<id>
  stack: string[];
  features?: string[];
  decisions?: ProjectDecision[];
  numbers?: string[];
  limits?: string;
  note?: string;
  color: string;
  npm?: string;
  repoUrl?: string;
  liveUrl?: string;
  links?: ProjectLink[];
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

// Same groups as the Skills section of the resume, so the two lists stay in sync
export type SkillGroup = 'Languages' | 'Web & Backend' | 'Databases' | 'Tools & Infra';

export interface Skill {
  id: string;
  name: string;
  group: SkillGroup;
  // Your own words on how you learned it and what you built with it. Shown on /skills/<id>.
  story: string;
}

export type SetupItem = {
  id: string;
  name: string;
};

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
  university: 'KMUTT · CS Year 3 · Graduating 2028',

  community: [
    {
      name: 'Microsoft Student Ambassadors',
      short: 'MSA',
      color: '#00a4ef',
      since: 'Apr 2026',
      detail:
        'I share Microsoft learning resources and events, and help build the student tech community.',
    },
    {
      name: 'Google Developer Group (GDG)',
      short: 'GDG',
      color: '#4285f4',
      since: 'Oct 2025',
      detail: 'Member of GDG on Campus KMUTT and GDG Cloud Bangkok.',
    },
  ],

  certificates: [
    {
      name: 'Google IT Support Professional Certificate',
      detail: 'Plus other Coursera and Microsoft Learn certificates, all listed on LinkedIn.',
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
      role: 'Computer Science Programming Mentor in Java',
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
      role: 'Hardware and Backend Engineer',
      org: 'KMUTT IoT Hackathon (2nd Place)',
      period: 'Jan 2026',
      highlights: [],
      projectId: 'nfc-attendance',
    },
    {
      role: 'Financial Team Lead',
      org: 'KMUTT Integrated Project (Smart City)',
      period: 'Aug to Dec 2025',
      highlights: [],
      projectId: 'smartcity-financial',
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
        'My own platform. It started as a social feed for me and my classmates and grew to run this portfolio, coding practice, and my other apps. I build, host, and deploy all of it.',
      problem:
        'I wanted a place for me and my classmates to post updates and photos without using another platform. As I added more apps, I needed them under one domain, deployed automatically, and still up when the main server has a problem.',
      role: 'Solo project. I built the social feed (posts, likes, threaded comments with @mentions, image uploads, and login with refresh tokens), the Express backend, the Next.js frontend, and all of the infrastructure.',
      result:
        'Running since February 2025. Every push to main is tested against production containers and deployed with no manual steps, and if Azure goes down, Cloudflare switches traffic to a backup copy on Northflank on its own.',
      stack: [
        'TypeScript',
        'Next.js',
        'React',
        'Tailwind CSS',
        'Node.js',
        'Express',
        'MongoDB',
        'Docker',
        'Nginx',
        'Azure',
        'Cloudflare',
        'GitHub Actions',
        'Zod',
        'Cloudinary',
      ],
      features: [
        'The feed renders its first 12 posts on the server and streams them in, then infinite scroll takes over. Likes wait 100 ms, so fast clicks send one request.',
        'The backend is split into controllers, services, models, and schemas. Zod checks every request, and login, posting, likes, and code runs each have a rate limit.',
        'One container runs Nginx, the Express API, and the Next.js server on Azure Container Apps, with health checks and scaling from 1 to 3 copies.',
        'GitHub Actions checks format and lint, builds, runs integration tests against production containers, deploys to Azure without a stored password (OIDC), waits for the health check, and clears the Cloudflare cache.',
        'A Cloudflare Worker sends traffic to Azure. Two failed requests in a row switch it to the Northflank copy, and a check every 5 minutes switches it back once Azure is healthy.',
        'The Azure setup is written in Bicep, with a $150 monthly budget and spending alerts.',
      ],
      decisions: [
        {
          title: 'One container for the whole site',
          reason:
            'Nginx, the API, and the Next.js server ship as one image and talk over localhost, so a deploy is one image and one health check.',
        },
        {
          title: 'Failover instead of a second region',
          reason:
            'A Worker and a backup copy on Northflank keep the site up during an Azure outage without paying for two Azure regions.',
        },
        {
          title: 'Moved hosts as it grew',
          reason:
            'Render in February 2025, a DigitalOcean server in May 2026, and Azure Container Apps in August 2026, once the site needed scaling, managed TLS, and deploys without SSH.',
        },
      ],
      numbers: [
        'Over 1,200 commits since January 2025, all mine.',
        '195 unit tests and 76 integration tests.',
      ],
      color: '#00ffc2',
      repoUrl: 'github.com/Mykal-Steele/Adorio',
      liveUrl: 'https://adorio.space',
      image: {
        src: '/projects/social/cover.webp',
        alt: 'The /social feed on adorio.space with the post composer and recent posts pinned to the wall.',
      },
    },
    {
      id: 'chronochunk',
      name: 'ChronoChunk',
      status: 'BETA',
      language: 'Python',
      langColor: '#3572A5',
      summary:
        'A Discord bot for my KMUTT classes. It answers course questions from the real class material (lecture recordings, slides, assignments, and files the professors upload) and says where each answer came from.',
      problem:
        'Finding the answer to one course question meant scrolling through hours of lecture recordings and slide decks spread across Teams and SharePoint. A general chatbot answers from memory and can make things up. I wanted one place to ask that answers from our own material and cites it, so anyone can check the answer.',
      role: 'Solo project. I built the sync that pulls class material into a searchable database, the search itself, the step that decides when a question needs course material, study mode, and the deployment on Azure.',
      result:
        'Classmates use it to study for 9 courses. Its answers come from about 183 hours of lecture transcripts plus the slides and assignments, and each one cites the textbook page, slide, or lecture timestamp it used.',
      stack: [
        'Python',
        'SQLite',
        'Docker',
        'Azure',
        'GitHub Actions',
        'discord.py',
        'Azure OpenAI',
        'sqlite-vec',
      ],
      features: [
        'A sync on my PC pulls lecture transcripts, slides, and assignments from Teams and SharePoint. Transcripts are cut into chunks of about 75 seconds and slides into one chunk per page.',
        'Search combines meaning-based search (embeddings in sqlite-vec) with keyword search (SQLite FTS5) and merges the two rankings. Adding keyword search is what got the English test set to 9 out of 10.',
        'Slide pages are also read as images so tables and charts can be found, and Thai slides are translated to English.',
        'Study mode writes quizzes of up to 100 questions with an answer key, PDF study guides, and system diagrams.',
        'It also plays music, sums up a channel with /tldr, and can search the web.',
      ],
      decisions: [
        {
          title: 'SQLite for everything',
          reason:
            'Vectors, keyword search, and bot data all live in SQLite, so there is no separate database server to run on a small VM.',
        },
        {
          title: 'Spending caps',
          reason:
            'AI calls stop at $2.50 a day, $20 a month, and a limit per user, so one heavy user cannot run up the bill.',
        },
        {
          title: 'Docker Compose on one small Azure VM',
          reason:
            'The bot runs on a VM with 1 GiB of RAM. A health check runs every minute and the database is backed up daily, keeping the newest 7.',
        },
      ],
      numbers: [
        'About 3 to 5 classmates use it regularly.',
        'Two courses alone came to 3,944 chunks, embedded for about $0.015.',
        'Search takes about 51 ms over 50,000 chunks.',
        '995 tests, run with ruff and pyright on every push.',
      ],
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
        'The wallet and payment part of a smart city platform built by a 50+ student class at KMUTT. City services like the metro and insurance cards are paid from it.',
      problem:
        'Every service in the class platform needed one way to hold and move money: wallets, top-ups, transfers between users, and real bank payments. Two transfers at the same time must not corrupt a balance, and a user must never exist without a wallet.',
      role: 'Led the 3-person financial team. I built the wallet and top-up flow, user-to-user transfers, and the SCB bank integration on the backend, and the financial page, top-up page with QR payment, transaction history, and transfer screen on the frontend. Teammates built the metro and insurance card parts.',
      result:
        'Students could top up a wallet with a real PromptPay QR code from SCB and pay city services from it. The module has 32 API endpoints, and I wrote most of the wallet and SCB code (24 of 27 wallet commits and 22 of 23 SCB commits).',
      stack: [
        'TypeScript',
        'Hono',
        'Prisma',
        'PostgreSQL',
        'React',
        'Swagger / OpenAPI',
        'Zod',
        'Pusher Channels',
        'SCB API',
      ],
      features: [
        'SCB integration: OAuth tokens are cached until they expire, payment data is encrypted with the SCB public key, and top-ups create a PromptPay QR code (QR v1, because v2 was under maintenance).',
        "Metro card top-ups charge the card owner's wallet. Donations take a 3% fee.",
        'Payment status first reached the browser through Server-Sent Events. I later moved it to Pusher Channels.',
        "Every endpoint is described with zod-openapi, so the Swagger docs and the frontend's generated API client come from the same schema.",
      ],
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
          title: 'One wallet per user',
          reason:
            'The service refuses a second wallet for the same user, and a transfer checks that the wallet is active first.',
        },
      ],
      numbers: [
        '83 backend commits and 38 frontend commits from me between October and December 2025.',
        'About 2,700 lines added to the backend module and about 3,000 to the frontend.',
      ],
      note: 'My commits are under OakarOo / Mykal-Steele. The class site is offline now, so there is no live demo.',
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
        'A practice site for programming classes. Students solve problems in an in-browser editor and their code is checked against tests right away.',
      problem:
        'Students in the Java class I mentor needed practice that matches the course, with instant feedback instead of waiting for me to check their code. Paid code-runner APIs charge per run, which does not work for a whole class running code.',
      role: 'Solo. I wrote the problems and their tests, built the editor page and test runner, and set up the sandbox on Azure that runs Java and Python.',
      result:
        'The Java class I mentor practices on it during class. The sandbox costs about $6 a month because it only runs while someone is coding.',
      stack: [
        'TypeScript',
        'Java',
        'Python',
        'JavaScript',
        'Next.js',
        'React',
        'Express',
        'Azure',
        'CodeMirror',
        'Piston',
      ],
      features: [
        '16 problems: 11 algorithm problems that each come in JavaScript and Python, plus 5 Java problems that follow the course.',
        'JavaScript tests run in the browser. Java and Python code goes to the backend, which runs it on Piston and checks the output of each test.',
        'Opening a Java or Python problem starts the sandbox VM. It turns off after 30 minutes without a run, and a daily limit plus a timer on the VM itself stop it from running all night.',
        'While the sandbox is starting, the API answers "not ready" instead of a server error, so the site\'s failover does not mistake it for an outage.',
        'Progress is saved per problem and language in the browser.',
      ],
      decisions: [
        {
          title: 'Self-hosted Piston',
          reason:
            'Paid code-runner APIs charge per run, so Java and Python run on a Piston sandbox I host on an Azure VM.',
        },
        {
          title: 'One VM that is off by default',
          reason:
            'An always-on scale set and load balancer cost about $60 a month sitting idle. One VM that starts on demand costs $0.22 for each hour it runs.',
        },
        {
          title: 'JavaScript in the browser',
          reason: 'JavaScript problems run locally, so only Java and Python need the sandbox.',
        },
      ],
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
        'An attendance system built at a KMUTT IoT hackathon. Students check in by tapping an NFC card on a reader box instead of scanning a QR code.',
      problem:
        'Checking in meant every student scanning a QR code on their phone, which is slow with a full room. A tap on a reader is faster and needs no phone at the door.',
      role: 'Team of three. I wrote all of the ESP32 firmware for the reader box, and most of the backend and frontend: about 70% and 60% of the commits, including the check-in logic, card registration, and the register-card page.',
      result:
        '2nd place (1st runner-up) at the KMUTT SIT IoT Hackathon 2026. A check-in takes under a second from tap to confirmation on the box.',
      stack: [
        'TypeScript',
        'React',
        'Tailwind CSS',
        'Express',
        'Prisma',
        'PostgreSQL',
        'ESP32',
        'Socket.io',
      ],
      features: [
        "Students sign up on the web app, register for events, and link their NFC card on the reader box or with their phone's NFC.",
        'The box reads the card with a PN532 reader and sends its ID to the Express API over HTTPS.',
        'A known card is marked present and logged. An unknown card makes the box show a QR code that opens registration. A second tap at the same event is not counted twice.',
        'The firmware is a 5-state state machine with a touch screen and 4 buzzer tones, so students know the result without looking.',
      ],
      decisions: [
        {
          title: 'The box talks HTTPS to the API',
          reason:
            'Each scan is one request to the backend, so the box needs no database and the web app stays the single source of truth.',
        },
        {
          title: 'Socket.io for card linking',
          reason:
            'The backend tells the web app the moment a card is linked, so the registration page confirms it without a refresh.',
        },
      ],
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
      liveUrl: 'https://frontend-six-chi-19.vercel.app',
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
        'An npm CLI that creates an Express + TypeScript + Prisma + SQLite backend with one command: npm create adorex.',
      problem:
        'Setting up the same stack for every class project was repeated work, and students lost time on setup before they reached the database part of the course.',
      role: 'Solo. I built, tested, and published the CLI and its template.',
      result:
        'It became the Web Dev class template, and about 30 to 40 students started their projects with it. Setup went from about 2 hours to about 20 minutes.',
      stack: [
        'TypeScript',
        'JavaScript',
        'Node.js',
        'Express',
        'Prisma',
        'SQLite',
        'Zod',
        'GitHub Actions',
      ],
      features: [
        'Asks for a project name (or takes one as an argument), and can create the project in the current folder.',
        'The new project has a running Express server with a health route, a Prisma schema on SQLite, environment settings, and scripts to run, typecheck, build, and start.',
        'Works with npm, pnpm, yarn, and bun, and starts a git repository for you.',
      ],
      decisions: [
        {
          title: 'Defaults match the class stack',
          reason:
            'Students start with Express, TypeScript, Prisma, and SQLite, a stack they already know from class.',
        },
        {
          title: 'Test the generated app, not just the CLI',
          reason:
            'CI creates a real project on Ubuntu, macOS, and Windows with Node 22 and 24, then typechecks, builds, and starts it.',
        },
      ],
      numbers: [
        '2,649 downloads on npm in the last year.',
        '19 published versions since April 2026.',
      ],
      color: '#00ffc2',
      npm: 'npmjs.com/package/create-adorex',
      image: {
        src: '/projects/create-adorex/cover.webp',
        alt: 'The create-adorex page on npm with the install command and usage for npm, pnpm, yarn, and bun.',
      },
      repoUrl: 'github.com/Mykal-Steele/adorex-cli',
    },
    {
      id: 'cognimax',
      name: 'CogniMax',
      status: 'BETA',
      language: 'Python',
      langColor: '#3572A5',
      summary:
        'A chess engine that plays to beat a specific opponent quickly. It predicts how a player at a given rating is likely to reply and picks the move with the best expected result, instead of assuming the opponent plays perfectly.',
      problem:
        "Engines like Stockfish assume the opponent always finds the best reply. Against a real 1200-rated player that wastes chances, so games drag on. Training bots and game AI that play at a person's level need an engine that takes the opponent's likely mistakes into account.",
      role: 'Research intern at the IC2 Lab, KMUTT, June to July 2026. I built the engine, designed and ran the experiments, and wrote the statistics and the scripts that recompute every number in the report from the raw games.',
      result:
        'Across 4,120 games against a human-like opponent at 11 ratings from 600 to 2600, CogniMax won in a median of 22 moves, versus 27 for Stockfish searching to the same depth. It won faster at every rating (up to 31% fewer moves at 2400) and lost no games.',
      stack: [
        'Python',
        'PyTorch',
        'python-chess',
        'Stockfish',
        'maia3',
        'pandas',
        'SciPy',
        'statsmodels',
      ],
      features: [
        "Stockfish at depth 8 proposes CogniMax's candidate moves and scores the positions.",
        'maia3, a neural network trained on human games, predicts how likely the opponent is to play each reply at the target rating.',
        'A 3-move-deep expectimax search combines the two and picks the move with the best expected result. A setting controls how much risk it takes.',
        'In every game the opponent is maia3 at the target rating, picking moves the way a person at that level would.',
      ],
      decisions: [
        {
          title: 'Win speed as the main measure',
          reason:
            'Both engines won nearly every game, so the useful question was how fast each one wins.',
        },
        {
          title: 'Statistics that hold up',
          reason:
            'Bootstrap A/B tests, Holm-corrected paired tests, power analysis, and survival models, plus scripts that check every claim in the report against the raw data.',
        },
      ],
      numbers: [
        'CogniMax: 2,056 wins, 4 draws, 0 losses. Stockfish: 2,030 wins, 30 draws, 0 losses.',
        "Its chance of winning by any given move was 1.5 times Stockfish's at rating 600 and 2.9 times at 2400.",
        'About 30,500 lines of Python for the engine, experiments, analysis, and report.',
      ],
      limits:
        "The gain is for engines limited to a shallow search. CogniMax thinks about 4.4 seconds a move against Stockfish's 30 ms, and a Stockfish given the same time wins at least as fast. A reply predictor built from Stockfish alone also did as well as maia3, which the report treats as its main finding.",
      color: '#fe9d00',
      repoUrl: 'github.com/Mykal-Steele/CogniMax',
      image: {
        src: '/projects/cognimax/moves-to-win.webp',
        alt: 'Bar chart of median moves to win in Run 4: CogniMax wins in fewer moves than the Stockfish control at every Elo band from 600 to 2000.',
        fit: 'contain',
      },
      screenshots: [
        {
          src: '/projects/cognimax/all-11-bands.webp',
          alt: "Bar chart of effect size (Cliff's delta) at all 11 tested Elo bands from 600 to 2600.",
          caption:
            'Effect size at all 11 tested Elo bands, 600 to 2600, pooled across every run. The advantage holds at every band and is largest from 2200 to 2600.',
          width: 1600,
          height: 875,
        },
        {
          src: '/projects/cognimax/win-rate.webp',
          alt: 'Bar chart of win rate by Elo band in Run 4, with both engines near 100 percent.',
          caption:
            'Win rate by Elo band, Run 4. Both engines win nearly every game, which is why moves to win is the main measure.',
          width: 1600,
          height: 876,
        },
      ],
    },
    {
      id: 'uniloom',
      name: 'Uniloom',
      status: 'IN_PROGRESS',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'A self-hosted work tracker for building software with a coding agent: plan small slices with done-when checklists, let the agent do the work, and keep the approvals with people.',
      problem:
        'A coding agent writes code fast, but people still have to decide what gets built and when it counts as done. Uniloom keeps the plan, the checklists, and the approvals in one place, and agents connect to it over MCP.',
      role: 'One of three main contributors at UniCorp. I built project invite links with optional approval (the API, the join page, join requests, and cleanup of revoked links) and the one-command local setup that works on Windows, macOS, and Linux.',
      result:
        'People join projects through the invite links I built, and a new contributor gets the whole app running locally with two commands on any of the three operating systems.',
      stack: [
        'TypeScript',
        'Next.js',
        'Hono',
        'Bun',
        'Prisma',
        'PostgreSQL',
        'Better Auth',
        'OpenID Connect',
        'MCP',
      ],
      color: '#8b5cf6',
      repoUrl: 'github.com/unishare-oss/uniloom',
      liveUrl: 'https://loom.psstee.me/',
      image: {
        src: '/projects/uniloom/cover.webp',
        alt: 'The Uniloom landing page with a board showing slices in aligning, in progress, and in review.',
      },
    },
  ] as Project[],

  otherProjects: [
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
    { id: 'python', name: 'Python', group: 'Languages', story: '' },
    { id: 'sql', name: 'SQL', group: 'Languages', story: '' },
    { id: 'react', name: 'React', group: 'Web & Backend', story: '' },
    { id: 'nextjs', name: 'Next.js', group: 'Web & Backend', story: '' },
    { id: 'tailwindcss', name: 'Tailwind CSS', group: 'Web & Backend', story: '' },
    { id: 'nodejs', name: 'Node.js', group: 'Web & Backend', story: '' },
    { id: 'bun', name: 'Bun', group: 'Web & Backend', story: '' },
    { id: 'express', name: 'Express', group: 'Web & Backend', story: '' },
    { id: 'nestjs', name: 'NestJS', group: 'Web & Backend', story: '' },
    { id: 'hono', name: 'Hono', group: 'Web & Backend', story: '' },
    { id: 'prisma', name: 'Prisma', group: 'Web & Backend', story: '' },
    { id: 'postgresql', name: 'PostgreSQL', group: 'Databases', story: '' },
    { id: 'sqlite', name: 'SQLite', group: 'Databases', story: '' },
    { id: 'mongodb', name: 'MongoDB', group: 'Databases', story: '' },
    { id: 'docker', name: 'Docker', group: 'Tools & Infra', story: '' },
    { id: 'nginx', name: 'Nginx', group: 'Tools & Infra', story: '' },
    { id: 'githubactions', name: 'GitHub Actions', group: 'Tools & Infra', story: '' },
    { id: 'azure', name: 'Azure', group: 'Tools & Infra', story: '' },
    { id: 'cloudflare', name: 'Cloudflare', group: 'Tools & Infra', story: '' },
    { id: 'git', name: 'Git', group: 'Tools & Infra', story: '' },
    { id: 'linux', name: 'Linux', group: 'Tools & Infra', story: '' },
    { id: 'swagger', name: 'Swagger / OpenAPI', group: 'Tools & Infra', story: '' },
    { id: 'figma', name: 'Figma', group: 'Tools & Infra', story: '' },
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
