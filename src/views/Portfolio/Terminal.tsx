'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Minus, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useIDE } from './context/IDEContext';
import { portfolioData } from './data/portfolio';
import { mono, sans } from './constants/fonts';
import { IconButton } from './shared';

interface TermLine {
  prefix: string;
  text: string;
  color: string;
}

type CommandFn = (args: string[]) => TermLine[];

const ROUTE_MAP: Record<string, string> = {
  home: '/',
  about: '/',
  projects: '/projects',
  contact: '/contact',
};

const INTRO: TermLine = {
  prefix: '  ',
  text: "Type 'help' for commands.",
  color: 'var(--ide-text-4)',
};

function makeCommands(navigate: (path: string) => void): Record<string, CommandFn> {
  return {
    help: () => {
      const cmds: [string, string][] = [
        ['whoami', 'identity'],
        ['ls', 'list portfolio pages'],
        ['open <page>', 'navigate to a page'],
        ['stack', 'tech stack overview'],
        ['projects', 'list all projects'],
        ['skills', 'list skills'],
        ['contact', 'reach out'],
        ['date', 'current date & time'],
        ['clear', 'clear terminal'],
      ];
      return [
        { prefix: '  ', text: 'Available commands:', color: 'var(--ide-text-4)' },
        { prefix: '  ', text: '', color: 'var(--ide-text-4)' },
        ...cmds.map(([cmd, desc]) => ({
          prefix: '  ',
          text: `${cmd.padEnd(16)}${desc}`,
          color: 'var(--ide-text-3)',
        })),
      ];
    },

    whoami: () => [
      {
        prefix: '  ',
        text: `${portfolioData.name}, ${portfolioData.role}`,
        color: 'var(--ide-accent-light)',
      },
      { prefix: '  ', text: `${portfolioData.university}`, color: 'var(--ide-text-3)' },
      {
        prefix: '  ',
        text: `${portfolioData.location} · ${portfolioData.timezone}`,
        color: 'var(--ide-text-3)',
      },
    ],

    ls: () => [
      { prefix: '  ', text: 'src/', color: 'var(--ide-orange)' },
      { prefix: '  ', text: '  about_me.md     →  /', color: 'var(--ide-text-3)' },
      { prefix: '  ', text: '  projects.json   →  /projects', color: 'var(--ide-text-3)' },
      { prefix: '  ', text: '  contact.sh      →  /contact', color: 'var(--ide-text-3)' },
    ],

    open: (args) => {
      const page = args[0]?.toLowerCase();
      const route = ROUTE_MAP[page];
      if (!route) {
        const available = Object.keys(ROUTE_MAP).join(', ');
        return [
          { prefix: '  ✗ ', text: `unknown page: "${page}"`, color: 'var(--ide-pink)' },
          { prefix: '  → ', text: `available: ${available}`, color: 'var(--ide-text-4)' },
        ];
      }
      navigate(route);
      return [{ prefix: '  ✓ ', text: `navigating to ${route}...`, color: 'var(--ide-accent)' }];
    },

    stack: () => [
      {
        prefix: '  ',
        text: 'Languages:  TypeScript · JavaScript · Java · SQL · Python',
        color: 'var(--ide-accent-light)',
      },
      {
        prefix: '  ',
        text: 'Web:        React · Next.js · Tailwind CSS',
        color: 'var(--ide-orange)',
      },
      {
        prefix: '  ',
        text: 'Backend:    Hono · Bun · Express · Node.js',
        color: 'var(--ide-purple)',
      },
      {
        prefix: '  ',
        text: 'Tools:      Docker · Prisma · Linux · Azure · Git',
        color: 'var(--ide-blue)',
      },
    ],

    projects: () =>
      portfolioData.projects.map((p) => ({
        prefix: '  ',
        text: `${p.name.padEnd(22)} ${(p.language ?? 'Markdown').padEnd(14)} ${p.status}`,
        color:
          p.status === 'STABLE'
            ? 'var(--ide-accent)'
            : p.status === 'BETA'
              ? 'var(--ide-orange)'
              : p.status === 'IN_PROGRESS'
                ? 'var(--ide-purple)'
                : 'var(--ide-pink)',
      })),

    skills: () =>
      portfolioData.skills.map((s) => ({
        prefix: '  · ',
        text: `${s.name.padEnd(20)} [${s.group}]`,
        color: 'var(--ide-text-3)',
      })),

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
      { prefix: '  ', text: 'TZ: Asia/Bangkok (UTC+7)', color: 'var(--ide-text-4)' },
    ],
  };
}

export function Terminal({ embedded }: { embedded?: boolean }) {
  const { toggleTerminal } = useIDE();
  const router = useRouter();
  const [lines, setLines] = useState<TermLine[]>([INTRO]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Sets the pane's own scroll position; scrollIntoView would also scroll the page around it
  useEffect(() => {
    const pane = outputRef.current;
    if (pane) pane.scrollTop = pane.scrollHeight;
  }, [lines]);

  const commands = useCallback(() => makeCommands((path) => router.push(path)), [router]);

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

  const fontSize = 14;

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
          style={{ height: 32, borderBottom: '1px solid var(--ide-border)', flexShrink: 0 }}
        >
          <span
            style={{
              color: 'var(--ide-text-1)',
              fontSize: 12,
              fontFamily: sans,
              fontWeight: 600,
            }}
          >
            Terminal
          </span>
          <div className="ml-auto flex items-center gap-2">
            <IconButton
              onClick={toggleTerminal}
              aria-label="Minimise terminal"
              size={28}
              color="var(--ide-text-5)"
            >
              <Minus size={13} />
            </IconButton>
            <IconButton
              onClick={toggleTerminal}
              aria-label="Close terminal"
              size={28}
              color="var(--ide-text-5)"
            >
              <X size={13} />
            </IconButton>
          </div>
        </div>
      )}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto px-4 py-2"
        style={{ scrollbarWidth: 'none' }}
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div key={i} className="flex items-start" style={{ lineHeight: '22px' }}>
            <span
              style={{
                fontSize,
                fontFamily: mono,
                color: line?.color ?? 'var(--ide-text-3)',
                whiteSpace: 'pre',
                flexShrink: 0,
              }}
            >
              {line?.prefix}
            </span>
            <span
              style={{
                fontSize,
                fontFamily: mono,
                color: line?.color ?? 'var(--ide-text-3)',
              }}
            >
              {line?.text}
            </span>
          </div>
        ))}
      </div>
      <div
        className="flex items-center gap-2 px-4 py-1.5 shrink-0"
        style={{ borderTop: '1px solid var(--ide-border)' }}
      >
        <span
          style={{
            fontSize,
            fontFamily: mono,
            color: 'var(--ide-accent)',
            flexShrink: 0,
          }}
        >
          $
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type 'help' for commands..."
          aria-label="Terminal input"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            fontSize,
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
            color: input.trim() ? 'var(--ide-accent)' : 'var(--ide-text-6)',
          }}
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}
