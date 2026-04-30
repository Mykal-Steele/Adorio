'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Minus, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useIDE } from './context/IDEContext';
import { portfolioData } from './data/portfolio';
import { mono, sans } from './constants/fonts';

interface TermLine {
  prefix: string;
  text: string;
  color: string;
}

const bootLines: TermLine[] = [
  { prefix: '$ ', text: 'whoami', color: 'var(--ide-accent)' },
  {
    prefix: '  ',
    text: `oakar oo — Full-Stack Developer, KMUTT Bangkok`,
    color: 'var(--ide-accent-light)',
  },
  { prefix: '$ ', text: 'status --live', color: 'var(--ide-accent)' },
  {
    prefix: '  ✓ ',
    text: 'create-adorex   ONLINE   uptime 99.9%   latency 0.3ms',
    color: 'var(--ide-green)',
  },
  {
    prefix: '  ✓ ',
    text: 'portfolio-ide   ONLINE   uptime 99.5%   latency 18ms',
    color: 'var(--ide-green)',
  },
  {
    prefix: '  ~ ',
    text: 'discord-forge   DEGRADED uptime 97.8%   latency 45ms',
    color: 'var(--ide-orange)',
  },
  { prefix: '$ ', text: 'availability --check', color: 'var(--ide-accent)' },
  { prefix: '  → ', text: 'Status: Open to Opportunities', color: 'var(--ide-purple)' },
  { prefix: '  → ', text: 'TYPE:   Internship · Part-time · Collab', color: 'var(--ide-text-3)' },
  { prefix: '  → ', text: 'TZ:     UTC+7 Bangkok', color: 'var(--ide-text-3)' },
  { prefix: '  → ', text: 'RESP:   < 24h', color: 'var(--ide-text-3)' },
];

type CommandFn = (args: string[]) => TermLine[];

const ROUTE_MAP: Record<string, string> = {
  dashboard: '/',
  home: '/',
  about: '/about',
  projects: '/projects',
  contact: '/contact',
};

function makeCommands(navigate: (path: string) => void): Record<string, CommandFn> {
  return {
    help: () => {
      // Left column is 14 chars wide (command + args), padded to align descriptions.
      const cmds: [string, string][] = [
        ['whoami', 'identity & availability'],
        ['status', 'live project metrics'],
        ['ls', 'list portfolio pages'],
        ['pwd', 'current location'],
        ['open <page>', 'navigate to a page'],
        ['stack', 'tech stack overview'],
        ['projects', 'list all projects'],
        ['skills', 'installed packages'],
        ['contact', 'reach out'],
        ['date', 'current date & time'],
        ['clear', 'clear terminal'],
      ];
      return [
        { prefix: '  ', text: 'Available commands:', color: 'var(--ide-text-5)' },
        { prefix: '  ', text: '', color: 'var(--ide-text-4)' },
        ...cmds.map(([cmd, desc]) => ({
          prefix: '  ',
          text: `${cmd.padEnd(16)}${desc}`,
          color: 'var(--ide-text-4)',
        })),
      ];
    },

    whoami: () => [
      {
        prefix: '  ',
        text: `${portfolioData.name} — ${portfolioData.role}`,
        color: 'var(--ide-accent-light)',
      },
      { prefix: '  ', text: `${portfolioData.university}`, color: 'var(--ide-text-3)' },
      {
        prefix: '  ',
        text: `${portfolioData.location} · ${portfolioData.timezone}`,
        color: 'var(--ide-text-3)',
      },
    ],

    status: () =>
      portfolioData.liveProjects.map((p) => ({
        prefix: p.status === 'ONLINE' ? '  ✓ ' : '  ~ ',
        text: `${p.name.padEnd(18)} ${p.status.padEnd(10)} uptime ${p.uptime.padEnd(8)} latency ${p.latency}`,
        color: p.status === 'ONLINE' ? 'var(--ide-green)' : 'var(--ide-orange)',
      })),

    ls: () => [
      { prefix: '  ', text: 'src/', color: 'var(--ide-orange)' },
      { prefix: '  ', text: '  dashboard.tsx   →  /', color: 'var(--ide-text-4)' },
      { prefix: '  ', text: '  about_me.md     →  /about', color: 'var(--ide-text-4)' },
      { prefix: '  ', text: '  projects.json   →  /projects', color: 'var(--ide-text-4)' },
      { prefix: '  ', text: '  contact.sh      →  /contact', color: 'var(--ide-text-4)' },
    ],

    pwd: () => [
      {
        prefix: '  ',
        text: `/home/${portfolioData.handle.toLowerCase()}/portfolio`,
        color: 'var(--ide-accent-light)',
      },
    ],

    open: (args) => {
      const page = args[0]?.toLowerCase();
      const route = ROUTE_MAP[page];
      if (!route) {
        const available = Object.keys(ROUTE_MAP).join(', ');
        return [
          { prefix: '  ✗ ', text: `unknown page: "${page}"`, color: 'var(--ide-pink)' },
          { prefix: '  → ', text: `available: ${available}`, color: 'var(--ide-text-5)' },
        ];
      }
      navigate(route);
      return [{ prefix: '  ✓ ', text: `navigating to ${route}...`, color: 'var(--ide-accent)' }];
    },

    stack: () => [
      {
        prefix: '  ',
        text: 'Languages:  TypeScript · JavaScript · Go · Python · C++',
        color: 'var(--ide-accent-light)',
      },
      {
        prefix: '  ',
        text: 'Frontend:   React · Next.js · Astro · Tailwind 4.0',
        color: 'var(--ide-orange)',
      },
      {
        prefix: '  ',
        text: 'Backend:    Hono · Bun/Elysia · Express · Node.js',
        color: 'var(--ide-purple)',
      },
      {
        prefix: '  ',
        text: 'Tools:      Docker · Prisma · Git · CLI Development',
        color: 'var(--ide-blue)',
      },
    ],

    projects: () =>
      portfolioData.projects.map((p) => ({
        prefix: '  ',
        text: `${p.name.padEnd(22)} ${p.language.padEnd(14)} ${p.status}`,
        color:
          p.status === 'STABLE'
            ? 'var(--ide-accent)'
            : p.status === 'BETA'
              ? 'var(--ide-orange)'
              : 'var(--ide-pink)',
      })),

    skills: () => {
      const active = portfolioData.skills.filter((s) => s.active);
      return active.map((s) => ({
        prefix: '  ✓ ',
        text: `${s.name.padEnd(20)} ${s.version.padEnd(14)} [${s.category}]`,
        color: 'var(--ide-text-3)',
      }));
    },

    contact: () => [
      { prefix: '  ', text: `github:   ${portfolioData.github}`, color: 'var(--ide-text-3)' },
      { prefix: '  ', text: `linkedin: ${portfolioData.linkedin}`, color: 'var(--ide-text-3)' },
      { prefix: '  ', text: `email:    ${portfolioData.email}`, color: 'var(--ide-text-3)' },
      { prefix: '  → ', text: 'Run: open contact', color: 'var(--ide-accent)' },
    ],

    date: () => [
      {
        prefix: '  ',
        text: new Date().toLocaleString('en-US', {
          timeZone: 'Asia/Bangkok',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        color: 'var(--ide-accent-light)',
      },
      { prefix: '  ', text: 'TZ: Asia/Bangkok (UTC+7)', color: 'var(--ide-text-5)' },
    ],
  };
}

export function Terminal({ embedded }: { embedded?: boolean }) {
  const { toggleTerminal } = useIDE();
  const router = useRouter();
  const [lines, setLines] = useState<TermLine[]>([]);
  const [input, setInput] = useState('');
  const [booted, setBooted] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useCallback(() => makeCommands((path) => router.push(path)), [router]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        setLines((prev) => [...prev, bootLines[i]]);
        i++;
      } else {
        setBooted(true);
        clearInterval(interval);
      }
    }, 180);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = useCallback(() => {
    const raw = input.trim();
    if (!raw) return;

    const [cmd, ...args] = raw.toLowerCase().split(/\s+/);
    const cmdLine: TermLine = { prefix: '$ ', text: raw, color: 'var(--ide-accent)' };

    setHistory((h) => [raw, ...h].slice(0, 50));
    setHistIdx(-1);
    setInput('');

    if (cmd === 'clear') {
      setLines([]);
      return;
    }

    const cmds = commands();
    const handler = cmds[cmd];
    const response: TermLine[] = handler
      ? handler(args)
      : [
          {
            prefix: '  ✗ ',
            text: `command not found: ${cmd}. Type 'help' for options.`,
            color: 'var(--ide-pink)',
          },
        ];

    setLines((prev) => [...prev, cmdLine, ...response]);
  }, [input, commands]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] ?? '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : (history[next] ?? ''));
    }
  };

  return (
    <div
      className="shrink-0 flex flex-col"
      style={{
        height: embedded ? '100%' : 200,
        background: 'var(--ide-bg-1)',
        borderTop: embedded ? 'none' : '1px solid var(--ide-border)',
      }}
    >
      {!embedded && (
        <div
          className="flex items-center gap-4 px-3"
          style={{ height: 28, borderBottom: '1px solid var(--ide-border)', flexShrink: 0 }}
        >
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ide-text-1)',
              fontSize: 10,
              fontFamily: sans,
              fontWeight: 600,
              borderBottom: '2px solid var(--ide-accent)',
              paddingBottom: 2,
            }}
          >
            Terminal
          </button>
          {['Problems (0)', 'Output'].map((t) => (
            <button
              key={t}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ide-text-6)',
                fontSize: 10,
                fontFamily: sans,
              }}
            >
              {t}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTerminal}
              aria-label="Minimise terminal"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ide-text-6)',
              }}
            >
              <Minus size={12} />
            </button>
            <button
              onClick={toggleTerminal}
              aria-label="Close terminal"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ide-text-6)',
              }}
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}
      <div
        className="flex-1 overflow-y-auto px-4 py-2"
        style={{ scrollbarWidth: 'none' }}
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div key={i} className="flex items-start" style={{ lineHeight: '20px' }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: mono,
                color: line?.color ?? 'var(--ide-text-3)',
                whiteSpace: 'pre',
                flexShrink: 0,
              }}
            >
              {line?.prefix}
            </span>
            <span
              style={{ fontSize: 11, fontFamily: mono, color: line?.color ?? 'var(--ide-text-3)' }}
            >
              {line?.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {booted && (
        <div
          className="flex items-center gap-2 px-4 py-1.5 shrink-0"
          style={{ borderTop: '1px solid var(--ide-border-subtle)' }}
        >
          <span
            style={{ fontSize: 11, fontFamily: mono, color: 'var(--ide-accent)', flexShrink: 0 }}
          >
            root@{portfolioData.handle}:~$
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="type 'help' for commands..."
            autoFocus
            aria-label="Terminal input"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 11,
              fontFamily: mono,
              color: 'var(--ide-text-2)',
            }}
          />
          <button
            onClick={handleCommand}
            aria-label="Run command"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: input.trim() ? 'var(--ide-accent)' : 'var(--ide-text-7)',
            }}
          >
            <Send size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
