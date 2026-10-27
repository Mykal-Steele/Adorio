// Every bit of portfolio content comes from here

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
  // In my own words, for the questions recruiters ask in interviews
  hardPart?: string;
  learned?: string;
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
  detail: string;
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
  // Specs shown on the skill page, like the laptop on the Linux page
  setup?: SetupGroup[];
}

export type SetupGroup = {
  group: string;
  items: { label: string; value: string }[];
};

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
        'I share Microsoft Learn resources and events on social media and go to community events. The Azure credit is also what hosts most of my projects.',
    },
    {
      name: 'Google Developer Group (GDG)',
      short: 'GDG',
      color: '#4285f4',
      since: 'Oct 2025',
      detail: 'Member of GDG on Campus KMUTT and GDG Cloud Bangkok. I go to their events.',
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
        'Built Coding Challenges so they can practice problems that match what they learn in class and on their quizzes and exams',
        'Students who were stuck at the start are now writing OOP code on their own',
      ],
      projectId: 'coding-challenges',
    },
    {
      role: 'Research Intern',
      org: 'IC2 (Innovative Cognitive Computing) Lab, KMUTT · CogniMax Chess Research',
      period: 'Jun 2026 to Jul 2026',
      highlights: [
        'Applied for the summer internship and worked under Dr. Jonathan Hoyin Chan, Director of the IC2 Research Center',
        'Ran my own research project, CogniMax, mostly on my own with weekly progress meetings',
        'Planned every run: how to test it, what it measures, and what comes next, and documented all of it so the results can be reproduced',
      ],
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
      highlights: [
        'One-week hackathon (11 to 18 Jan 2026) with a 2,000 baht budget for the hardware',
        'Spent most of the week getting the touch screen, the NFC reader, and the connection between the box and the website to work together',
      ],
      projectId: 'nfc-attendance',
    },
    {
      role: 'Financial Team Lead',
      org: 'KMUTT Integrated Project (Smart City)',
      period: 'Aug to Dec 2025',
      highlights: [
        'Split the work in my 3-person team and ran the meetings where we decided the design, like how to integrate with SCB and how transfers work',
        'Worked with the traffic department so metro cards can be topped up from the wallet',
        'Worked with the apartment department so people can pay rent through the app',
      ],
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
        'My own platform at adorio.space. It runs this portfolio and my apps, like Social, Coding Challenges, and Hosting, under one domain. I build, host, and deploy all of it.',
      problem:
        'I kept building small apps and wanted them under one domain, deployed automatically, and still up when the main server has a problem.',
      role: 'Solo project. I built the Express backend, the Next.js frontend, login with refresh tokens, and all of the infrastructure.',
      result:
        'Running since February 2025. Every push to main is tested against production containers and deployed with no manual steps.',
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
      ],
      features: [
        'The backend is split into controllers, services, models, and schemas. Zod checks every request, and login, posting, likes, and code runs each have a rate limit.',
        'One container runs Nginx, the Express API, and the Next.js server on Azure Container Apps, with health checks and scaling from 1 to 3 copies.',
        'GitHub Actions checks format and lint, builds, runs integration tests against production containers, deploys to Azure without a stored password (OIDC), waits for the health check, and clears the Cloudflare cache.',
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
        'About 5 people use /social and /coding regularly, and about 20 when my class was on it.',
        'Over 1,200 commits since January 2025, all mine.',
        '195 unit tests and 76 integration tests.',
      ],
      hardPart:
        "The code runner. I had to design it so running it 24/7 doesn't make me go bankrupt lol, and find a way to make it work cheap.",
      note: "Why the name? I wanted something unique so it's easy to find on search. It's inspired by Arduino, and it sounds round. I like it.",
      color: '#00ffc2',
      repoUrl: 'github.com/Mykal-Steele/Adorio',
      liveUrl: 'https://adorio.space',
      image: {
        src: '/projects/adorio/cover.webp',
        alt: 'The adorio.space home page, this portfolio, laid out like a code editor.',
      },
    },
    {
      id: 'social',
      name: 'Social',
      status: 'STABLE',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'A social feed for me and my classmates. You post updates and photos, like posts, and reply in threads.',
      problem:
        'I wanted a place for me and my classmates to post updates and photos without using another platform.',
      role: 'Solo project. I built posts, likes, threaded comments with @mentions, image uploads, and login with refresh tokens.',
      result: 'Running since February 2025. It was the first app on Adorio.',
      stack: [
        'TypeScript',
        'Next.js',
        'React',
        'Tailwind CSS',
        'Node.js',
        'Express',
        'MongoDB',
        'Zod',
        'Cloudinary',
      ],
      features: [
        'The feed renders its first 12 posts on the server and streams them in, then infinite scroll takes over. Likes wait 100 ms, so fast clicks send one request.',
        'Photos upload to Cloudinary, and replies can @mention people.',
      ],
      hardPart:
        'Infinite scroll was a pain. Posts showed up twice, and every new page shuffled the images into different columns. The duplicates came from the server-rendered first page not matching what the browser fetched next, and I stopped the jumping by giving each post a fixed column. Getting the lines on the left of a reply thread to connect smoothly took a while too.',
      color: '#fe9d00',
      liveUrl: '/social',
      image: {
        src: '/projects/social/cover.webp',
        alt: 'The /social feed on adorio.space with the post composer and recent posts pinned to the wall.',
      },
    },
    {
      id: 'hosting',
      name: 'Hosting',
      status: 'BETA',
      language: 'TypeScript',
      langColor: '#3178c6',
      summary:
        'Upload a file and get a link to it at adorio.space/h/<name>. Each file counts its views.',
      problem: 'Putting one page online usually means setting up a whole site for it.',
      role: 'Solo project. I built the upload page, the file list with view counts, the /h/ links, and an admin page for every file.',
      result: 'Live since June 2026 for anyone with an account.',
      stack: [
        'TypeScript',
        'Next.js',
        'React',
        'Tailwind CSS',
        'Node.js',
        'Express',
        'MongoDB',
        'Zod',
      ],
      color: '#8b5cf6',
      liveUrl: '/hosting',
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
        'People use it a lot, mostly to TL;DR a Discord channel in UniCorp (it reads the messages and images too), and also for advice and study guides. Course answers come from about 183 hours of lecture transcripts plus slides and assignments across 9 courses, and each one cites the page, slide, or lecture timestamp it used.',
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
            'AI calls have daily, monthly, and per-user limits, so one heavy user cannot run up the bill.',
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
      hardPart:
        'Handling massive context. A busy channel, hours of lectures, and a pile of slides are way more than the model can take in at once. At first I kept patching problems, like old topics coming back and the bot repeating itself.',
      learned:
        'I should have designed the data handling first, and how the AI would use it. What actually fixed it was putting everything in SQLite, describing each slide once and saving it, and having the bot read only as much of a channel as the question needs.',
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
      hardPart:
        'The SCB API, especially the debit card integration and PromptPay. I had to read through their developer docs, learn the whole API, and write a lot of tests just to understand the flow from 0 to 100. Getting proper credentials set up was tricky too, since their API needs the data properly encrypted and decrypted.',
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
        "The Java class I mentor practices on it during class. They like that the problems target what they learn in class and what's on their quizzes and exams, instead of broad LeetCode questions. The sandbox costs about $6 a month because it only runs while someone is coding.",
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
        'While the sandbox is starting, the API answers "not ready" instead of an error, so the page can tell students to wait a moment.',
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
      stack: ['TypeScript', 'React', 'Tailwind CSS', 'Express', 'Prisma', 'PostgreSQL', 'ESP32'],
      features: [
        "Students sign up on the web app, register for events, and link their NFC card on the reader box or with their phone's NFC.",
        'The box reads the card with a PN532 reader and sends its ID to the Express API over HTTPS.',
        'A known card is marked present and logged. A second tap at the same event is not counted twice.',
        'The firmware is a 5-state state machine with a touch screen and 4 buzzer tones, so students know the result without looking.',
      ],
      decisions: [
        {
          title: 'The box talks HTTPS to the API',
          reason:
            "Each scan is one request to the backend, so the box doesn't need a database of its own.",
        },
        {
          title: 'Register at the door',
          reason:
            'A card the system has never seen is not rejected. The box shows a QR code that opens registration, so a new student is set up on their first tap.',
        },
      ],
      hardPart:
        'Managing all the wires for the TFT touch screen. And the box XD Gluing it all together took the whole night.',
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
        "It became the 2026 Web Dev class template, and about 30 to 40 students started their projects with it. Setting up the stack by hand takes 10 to 20 minutes at least (more if you're new). With adorex it's one command, plus the install and the Prisma migrate.",
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
          title: 'A CLI, not a template repo',
          reason:
            'Students already knew npm create vite, so npm create adorex feels easy for them, and kind of premium. You could ask Vite the same thing: why not just a template repo?',
        },
        {
          title: 'Defaults match the class stack',
          reason:
            'Students start with Express, TypeScript, Prisma, and SQLite, a stack they already know from class. Everyone gets the same versions and folder setup, so their results match.',
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
        "Engines like Stockfish assume the opponent always finds the best reply. Against a real 1200-rated player that wastes chances, so games drag on. Training bots and game AI that play at a person's level need an engine that takes the opponent's likely mistakes into account. Put simply, the best move in general is not always the most effective one. When your opponent has a weak spot, going after it usually works better (like punching someone where they're already hurt, or a better example lol).",
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
      learned:
        'How important it is to document everything and make sure everything can be reproduced. And to write a clear hypothesis and main goal before running anything.',
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
        'A self-hosted work tracker for building software with coding agents. People plan small pieces of work and sign off on them, and the agents do the coding.',
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
      hardPart:
        "We focus on agentic development, and it moves fast. Managing it is really hard, and new developers suffer the most, trying to get all the latest info. That's a big part of why I built the one-command setup.",
      note: 'UniCorp is a group my friends made to simulate working at a company. We built our own central sign-in and a bunch of sites under the name, with a proper PM and ticket system. We hope more devs and friends join.',
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
    {
      name: 'CozyTalk',
      href: 'https://github.com/CozyTalk/CozyTalk',
      detail:
        'Our first mobile app, built with Flutter and Firebase for the agile dev and mobile dev classes combined, so we had to follow agile.',
    },
    {
      name: 'Vexta',
      href: 'https://github.com/Mykal-Steele/Vexta',
      detail: 'Lets you use your phone as a camera for your computer.',
    },
    {
      name: 'Mistbound',
      href: 'https://github.com/Mykal-Steele/MistboundMain',
      detail: "A 2D Unity game. Not complete, it's just movement and stuff.",
    },
    {
      name: 'Rhythm Dots',
      href: '/rygame',
      detail: 'A rhythm game in the browser. Hit the dots in time with the music.',
    },
    {
      name: 'ArchMaster',
      href: '/cao/',
      detail: 'Exam prep for my computer architecture class.',
    },
    {
      name: 'Runway',
      href: '/finance',
      detail:
        'My finance tracker. It gives me a daily budget and carries over what I save or overspend.',
    },
    {
      name: 'SCB API guides',
      href: '/smartcity',
      detail: 'Guides to the SCB APIs (DeepLink and Direct Debit) for the Smart City class.',
    },
  ] as OtherProject[],

  skills: [
    {
      id: 'typescript',
      name: 'TypeScript',
      group: 'Languages',
      story:
        "I started using it when KMUTT started teaching it, and we had to build a lot of projects with it. The year after mine, as a mentor for the web dev course, we voted to make TypeScript the default from day one, instead of starting with JavaScript and switching later like my year did.\n\nI use it for my uni projects and basically everything I've built since, and I refactored Adorio to TypeScript too! At first we had a lot of issues in group projects because no one really knew what we were doing. Learning stuff like optional ? made it a lot easier, and slowly every mistake turned into experience and things started to flow better.\n\nToday I use it for basically every project. I still have issues with some types, usually generics and callbacks, but for daily projects I'm pretty comfortable.",
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      group: 'Languages',
      story:
        "I started learning JavaScript really early, along with HTML, but didn't go too deep. In my year at KMUTT it was taught before TypeScript, and I had a lot of fun with it. After that it basically replaced Java as the main language at my uni, and even algorithms and data structures were taught in JavaScript!\n\nBefore TypeScript I used it with Express. When I moved on to Hono, which defaults to TypeScript, I got nudged into learning TypeScript.\n\nIt clicked when I got async and await: calling a function with await and without it, and realizing it's not really running in parallel. Now I mostly use it for quick scripts and LeetCode-type problems, and I'm pretty comfortable with it.",
    },
    {
      id: 'java',
      name: 'Java',
      group: 'Languages',
      story:
        "Uni started us with Java, and I learned all my programming fundamentals with it. Now I'm the one teaching it back!\n\nWe built mostly OOP stuff and basic CLI programs, like a slot machine and a text RPG. Once I started looking around the docs, I realized how much is already built in. After discovering Java Streams I thought I had the power to do anything haha. ArrayList was pretty cool too. I realized I don't have to start from scratch to do something.\n\nToday I mostly use it for LeetCode-type problems, since Java is actually pretty fun to use, and I like making classes with it.",
    },
    {
      id: 'python',
      name: 'Python',
      group: 'Languages',
      story:
        "I started with Python before uni, on one of those learn-Python websites, doing the basic stuff like conditionals and loops. Then I started asking my friend who started uni before me (he's also doing comp sci) for his homework so I could practice, and ended up doing it myself lol. Mostly LeetCode-type problems, but more interesting.\n\nSame as Java, it started with small CLI programs to test out the language. Lately I use it for my ChronoChunk bot with discord.py, and for the CogniMax research to write the runs.\n\nA mistake I made was not commenting while writing. Python is so compact you can do a lot with very little code, and if you aren't documenting, you get lost in a short while. Nowadays I use it for anything that needs a quick and easy language, for scripts, and for the AI stuff I like trying on Kaggle. I used some for my data science class too, but that class focused more on manual calculation and Orange Data Mining.",
    },
    {
      id: 'sql',
      name: 'SQL',
      group: 'Languages',
      story:
        "I started SQL in my database class. Before that I just used Prisma and never had to touch it, but when I had to learn it, I realized it's pretty awesome. It's always satisfying when you see the result after you press run, like opening a tap and the water just flows out. I know this is a weird comparison, but it's real haha.\n\nGROUP BY was the hard one. I knew it was simple, but the results still seemed surprising for some reason. It started making sense when I took the name literally and thought about grouping the rows, instead of reading it like a sentence.\n\nNow I mostly use it when I have to go deep into a server to check something, like cooking up a quick query to see if an operation worked.",
    },
    {
      id: 'react',
      name: 'React',
      group: 'Web & Backend',
      story:
        "I started it during my web dev class at uni. After the class I watched a lot of videos online, since there are so many of them. I feel like there's always more to learn, but also not. The concepts are really simple, yet you can use them to make complicated structures. I'd say it's just like Langton's Ant.\n\nI build websites haha. Basically all my uni projects are built with it. For my personal projects I moved to Next.js, because plain React has no structure, and it's really frustrating having a completely different setup every time.\n\nIt clicked when I started seeing things as components instead of just code. I see each piece as its own thing, or a group of things, which helps me split the job across components and makes managing it a lot easier. I'm somewhat comfortable with it, but not so much with layouts.",
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      group: 'Web & Backend',
      story:
        'I started using it mainly because I wanted structure and better SEO. I noticed that with React, search engines can\'t really read what\'s on the site because it ships JavaScript, while Next.js renders on the server, which is better for SEO.\n\nI build Adorio and the rest of my projects with it. The big lesson was server side rendering: figuring out what runs on the server and what needs "use client", and that "use client" components still render on the server first. On Adorio, the feed streams its first page from the server, then infinite scroll takes over.\n\nI\'m somewhat comfortable with it.',
    },
    {
      id: 'tailwindcss',
      name: 'Tailwind CSS',
      group: 'Web & Backend',
      story:
        "I started using it in a group project to make writing CSS better, and I was surprised by how good it is. It makes styling so much easier, so I built all my sites with it.\n\nThere was a huge migration from Tailwind 3 to 4, and I had to change a lot of stuff to make it work, especially with the config file being removed. If I had just read the docs properly, I would have had a better time.\n\nI'm pretty comfortable with it, but I might need a refresher on layouts.",
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      group: 'Web & Backend',
      story:
        'Node is what runs my Express backends, ever since the uni projects. create-adorex needs Node 22 too, and publishing it taught me how npm packages, bin scripts, and versions work.\n\nMoving to ES modules tripped me up, like imports needing the .js extension even in TypeScript. These days I reach for Bun first, but Node is still what most things run on.',
    },
    {
      id: 'bun',
      name: 'Bun',
      group: 'Web & Backend',
      story:
        "I started using it when I was looking for something more efficient. I tried it and instantly fell in love, because of how fast it is and how little effort it takes to use.\n\nUniloom's one-command setup and dev scripts all run on Bun, and Adorio's unit tests run with bun test because it's so fast. It's what I reach for first now.",
    },
    {
      id: 'express',
      name: 'Express',
      group: 'Web & Backend',
      story:
        "It was my default after Hono. I started using it in one of the uni group projects, and the year after mine, we voted to make it the default for the web dev class because it has a wider community. I taught it to students as a mentor too.\n\nAdorio's backend, the NFC attendance API, and the create-adorex template all run on Express. The lesson was middleware order. Middleware runs from top to bottom, and putting something like CORS or auth in the wrong spot broke stuff.",
    },
    {
      id: 'nestjs',
      name: 'NestJS',
      group: 'Web & Backend',
      story:
        "I'm still learning this one. My friend recommended it and said it's like Java, and I quite enjoy using it. Right now I'm building a small practice API to learn how modules, controllers, and dependency injection fit together.",
    },
    {
      id: 'hono',
      name: 'Hono',
      group: 'Web & Backend',
      story:
        "It was part of the stack in a group project, and actually the default for the web dev class in my year. The year after, we voted to make Express the default instead, because it has a wider community.\n\nI built some of my early uni sites with it, and the Smart City financial module and Uniloom's API run on it. It's like the modern version of Express, and it works really well with OpenAPI and orval. The frontend gets typed API calls generated from the backend, so nothing drifts. I enjoyed it a lot and want to use it again for my next project.",
    },
    {
      id: 'prisma',
      name: 'Prisma',
      group: 'Web & Backend',
      story:
        "I started using it as part of the web dev course, and it basically became the default for all my projects after that. Teaching it to students as a mentor made me understand it way better than just using it.\n\nIn Smart City, reading a balance and then writing it back could lose money when two transfers hit at the same time, so I switched to Prisma's increment and decrement. Migrations taught me a lesson too. I messed up migrate more than once and had to reset my dev database.",
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      group: 'Databases',
      story:
        'I used it in my database class to learn more about structured databases. Smart City, NFC Attendance, and Uniloom all run on it.\n\nThe thing I keep coming back to is transactions. Wrapping related writes together is how Smart City makes sure a user is never created without a wallet.',
    },
    {
      id: 'sqlite',
      name: 'SQLite',
      group: 'Databases',
      story:
        "It became the new default for freshmen because it's lightweight and relatively easy. There's no server to install, so they can focus on SQL and schema design. I started using it in my database classes too, when I wanted to explore.\n\nWhat surprised me is how far it goes. ChronoChunk does vector search and full-text search all inside SQLite, and create-adorex sets up new projects on it.",
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      group: 'Databases',
      story:
        'This is the database I use for Adorio. The main reason was flexibility, since Adorio is so broad and I was spamming all kinds of random projects under it.\n\nNo schema was great at the start, but the data got messy, so I added Mongoose schemas and Zod validation to keep it in check.',
    },
    {
      id: 'docker',
      name: 'Docker',
      group: 'Tools & Infra',
      story:
        "I started using it when I wanted to use something without setting it up, like Postgres. Then I used it for all my project deployments because it made it so easy. Northflank lets me give it a Dockerfile and it deploys the whole site, which made it even easier.\n\nAdorio ships Nginx, Express, and Next.js together in one image, and Docker Compose runs ChronoChunk on its VM. I had to learn a lot about Compose, and I still need to learn a lot even though I use it all the time. I've played a little with Nginx sidecars and stuff too.",
    },
    {
      id: 'nginx',
      name: 'Nginx',
      group: 'Tools & Infra',
      story:
        'Nginx is the front door for Adorio. Inside one container, it sends /api to Express and the pages to Next.js, and serves /cao on its own. On my old DigitalOcean server it handled the HTTPS certificates too, before Azure did that for me.\n\nI know enough to route and proxy things, but I still look stuff up a lot.',
    },
    {
      id: 'githubactions',
      name: 'GitHub Actions',
      group: 'Tools & Infra',
      story:
        "It's basically been there since the start, for CI/CD.\n\nOn Adorio, format, lint, build, and the tests all have to pass before anything deploys, which has saved me from shipping broken stuff.",
    },
    {
      id: 'azure',
      name: 'Azure',
      group: 'Tools & Infra',
      story:
        "I started using it once I became a Microsoft Student Ambassador and got $150 of free Azure credit every month. Adorio, ChronoChunk, and the code runner for Coding Challenges all run on it.\n\nThe big lesson was idle costs. The code runner's scale set was costing about $60 a month just sitting there, so I switched to one VM that turns itself off when nobody is coding. I also set budget alerts so I find out before the credit runs out, not after. And GitHub deploys to it with OIDC, so there's no Azure password stored anywhere.",
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare',
      group: 'Tools & Infra',
      story:
        "I found out about it by accident while looking through some blog, and realized how much free stuff they give away, like caching and DNS. After a while I moved my whole domain's DNS from Namecheap to Cloudflare. It's awesome and I don't know why people don't mention it more. It's like an instant glow up for your site, for free.\n\nAdorio runs through it. A Cloudflare Worker switches the site to my free backup on Northflank if Azure goes down, and my resume lives in R2, so updating it is one upload.\n\nIt has bitten me too. After a deploy, Cloudflare kept serving old cached pages that pointed to JavaScript files that didn't exist anymore, so the site went white. Now every deploy clears the cache. And Cloudflare Fonts once rewrote my font tags and broke React on every page.",
    },
    {
      id: 'git',
      name: 'Git',
      group: 'Tools & Infra',
      story:
        "I've used Git for every project. One of the lessons was ending up on a detached HEAD with commits that weren't on any branch. I used rebase to get them back where they belonged.\n\nAnother time, git add just wouldn't pick up a change, and git commit -am was what finally got it committed.",
    },
    {
      id: 'linux',
      name: 'Linux',
      group: 'Tools & Infra',
      story:
        "I started tweaking with Linux a few years ago. At the start I was mainly looking for a way to make my old laptop run faster, so I distro hopped for a while, starting with Peppermint, then stuff like Linux Mint and Puppy Linux. Another distro I like is Fedora.\n\nToday I use Omarchy (Arch with Hyprland) daily for everything, including building this site, and it works really well. Of course I've had a lot of problems with booting and setup. Dual booting with Windows broke my boot a few times, and fixing it taught me a lot about how the system starts. But I never gave up on Linux, just like it never gave up on me (unless you count it randomly not booting, but that's usually because of the Windows I'm dual booting holding or locking something. Of course it is lmao).",
      setup: [
        {
          group: 'Machine',
          items: [
            { label: 'Laptop', value: 'ASUS Zenbook 14X OLED' },
            { label: 'CPU', value: 'Intel Core i7-12700H, 14 cores and 20 threads, up to 4.7 GHz' },
            { label: 'Graphics', value: 'Intel Iris Xe (integrated)' },
            { label: 'Memory', value: '16 GB' },
            { label: 'Storage', value: 'Samsung 1 TB NVMe SSD' },
            { label: 'Display', value: '14" OLED, 3840x2400 at 60 Hz, 2x scaling' },
            { label: 'Mic', value: 'HyperX SoloCast (USB)' },
          ],
        },
        {
          group: 'System',
          items: [
            { label: 'OS', value: 'Omarchy 4 (Arch Linux)' },
            { label: 'Desktop', value: 'Hyprland on Wayland' },
            {
              label: 'Filesystem',
              value: 'btrfs, with a Snapper snapshot before every package update',
            },
            { label: 'Theme', value: 'Coppernight' },
          ],
        },
        {
          group: 'Tools',
          items: [
            { label: 'Terminal', value: 'foot' },
            { label: 'Shell', value: 'Bash with Starship' },
            { label: 'Editor', value: 'VS Code, and Neovim in the terminal' },
            { label: 'Versions', value: 'mise, with Bun and pnpm' },
            { label: 'Containers', value: 'Docker, with lazydocker' },
            { label: 'Git', value: 'lazygit' },
            { label: 'Terminal tools', value: 'tmux, btop, fzf, zoxide, eza' },
          ],
        },
      ],
    },
    {
      id: 'swagger',
      name: 'Swagger / OpenAPI',
      group: 'Tools & Infra',
      story:
        "I started using it in the integrated project at uni, the one where the whole class (50+ devs) works on one project. Not the whole project used it, but our financial department used it heavily.\n\nOur Swagger docs let the other departments see and try our endpoints without asking us, and the frontend's API calls were generated from the spec with orval, so there was no hand-written fetch code.",
    },
    {
      id: 'figma',
      name: 'Figma',
      group: 'Tools & Infra',
      story:
        'I started using it in my first group project. I use it to make low-fi and high-fi designs of my websites before I start working on them.',
    },
  ] as Skill[],

  setup: [
    { id: 'archlinux', name: 'Arch Linux' },
    { id: 'hyprland', name: 'Omarchy / Hyprland' },
    { id: 'neovim', name: 'Neovim' },
    { id: 'bash', name: 'Bash' },
    { id: 'pnpm', name: 'pnpm' },
    { id: 'mise', name: 'mise' },
  ] as SetupItem[],

  timeline: [
    {
      year: '2026',
      events: [
        'Published create-adorex on npm (Apr).',
        'Became a Microsoft Student Ambassador (Apr).',
        'Built CozyTalk, our first mobile app, with my team.',
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
