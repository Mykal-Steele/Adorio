'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Circle, BarChart2 } from 'lucide-react';
import { useIDE } from './context/IDEContext';
import { portfolioData } from './data/portfolio';
import { useResponsive } from './hooks/useResponsive';
import { mono, sans } from './constants/fonts';

function matchResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes('stack') || q.includes('tech') || q.includes('language') || q.includes('tool'))
    return portfolioData.aiResponses.stack;
  if (
    q.includes('project') ||
    q.includes('repo') ||
    q.includes('work') ||
    q.includes('npm') ||
    q.includes('adorex')
  )
    return portfolioData.aiResponses.projects;
  if (
    q.includes('avail') ||
    q.includes('hire') ||
    q.includes('job') ||
    q.includes('collab') ||
    q.includes('intern')
  )
    return portfolioData.aiResponses.available;
  if (q.includes('community') || q.includes('mentor') || q.includes('teach'))
    return portfolioData.aiResponses.community;
  if (
    q.includes('philosoph') ||
    q.includes('approach') ||
    q.includes('bun') ||
    q.includes('rust') ||
    q.includes('go')
  )
    return portfolioData.aiResponses.philosophy;
  if (
    q.includes('background') ||
    q.includes('experience') ||
    q.includes('career') ||
    q.includes('kmutt') ||
    q.includes('university')
  )
    return portfolioData.aiResponses.background;
  if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('message'))
    return portfolioData.aiResponses.contact;
  return portfolioData.aiResponses.default;
}

const CHIPS = [
  { label: 'stack', query: "what's your tech stack?" },
  { label: 'projects', query: 'show me your projects' },
  { label: 'available', query: 'are you available to hire?' },
  { label: 'community', query: 'what community roles do you have?' },
  { label: 'background', query: 'tell me your background' },
];

function SystemPanel() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 3000);
    return () => clearInterval(t);
  }, []);
  const cpuValues = ['2.1%', '1.8%', '2.4%', '2.0%'];
  const currentCpu = cpuValues[tick % cpuValues.length];

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span
            style={{
              fontSize: 9,
              fontFamily: sans,
              color: 'var(--ide-text-5)',
              letterSpacing: '0.12em',
            }}
          >
            Live Projects
          </span>
          <Circle
            size={6}
            fill="var(--ide-accent)"
            color="var(--ide-accent)"
            className="pulse-dot"
            style={{ animation: 'pulse 2s infinite' }}
          />
        </div>
        {portfolioData.liveProjects.map((proj) => {
          const statusColor =
            proj.status === 'ONLINE'
              ? 'var(--ide-accent)'
              : proj.status === 'DEGRADED'
                ? 'var(--ide-orange)'
                : 'var(--ide-accent)';
          const barWidth = proj.status === 'DEGRADED' ? 64 : parseInt(proj.cpu) || 10;
          return (
            <div
              key={proj.name}
              className="mb-3 p-3"
              style={{ background: 'var(--ide-bg-2)', border: '1px solid var(--ide-border)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: sans,
                    color: 'var(--ide-text-1)',
                    fontWeight: 600,
                  }}
                >
                  {proj.name}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: sans,
                    color: statusColor,
                    letterSpacing: '0.05em',
                  }}
                >
                  {proj.status}
                </span>
              </div>
              <div className="flex gap-3 mb-2">
                {[
                  {
                    label: 'CPU',
                    value: proj.status === 'DEGRADED' ? proj.cpu : currentCpu,
                    color: proj.status === 'DEGRADED' ? 'var(--ide-orange)' : 'var(--ide-text-1)',
                  },
                  { label: 'Latency', value: proj.latency, color: 'var(--ide-text-1)' },
                  { label: 'Uptime', value: proj.uptime, color: 'var(--ide-accent)' },
                ].map((m) => (
                  <div key={m.label}>
                    <div
                      style={{
                        fontSize: 8,
                        fontFamily: sans,
                        color: 'var(--ide-text-5)',
                        marginBottom: 1,
                      }}
                    >
                      {m.label}
                    </div>
                    <div style={{ fontSize: 12, fontFamily: mono, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div className="relative" style={{ height: 2, background: 'var(--ide-border)' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${Math.min(barWidth, 100)}%`,
                    background: statusColor,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 pb-4">
        <div
          style={{
            fontSize: 9,
            fontFamily: sans,
            color: 'var(--ide-text-5)',
            letterSpacing: '0.12em',
            marginBottom: 10,
          }}
        >
          Language Distribution
        </div>
        {portfolioData.languageDistribution.map((l) => (
          <div key={l.name} className="mb-2">
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-text-4)' }}>
                {l.name}
              </span>
              <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-text-6)' }}>
                {l.pct}%
              </span>
            </div>
            <div style={{ height: 3, background: 'var(--ide-border)' }}>
              <div style={{ height: '100%', width: `${l.pct}%`, background: l.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Message {
  role: 'user' | 'system';
  text: string;
}

export function AskMePanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', text: portfolioData.aiResponses.default },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);
    setTimeout(
      () => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { role: 'system', text: matchResponse(text) }]);
      },
      900 + Math.random() * 400,
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-4 py-3" style={{ borderBottom: '1px solid var(--ide-border)' }}>
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 24,
              height: 24,
              background: 'var(--ide-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={12} color="var(--ide-accent-dark)" />
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                fontFamily: sans,
                color: 'var(--ide-text-1)',
                fontWeight: 600,
              }}
            >
              Ask Oo
            </div>
            <div style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-text-6)' }}>
              oakar's knowledge base
            </div>
          </div>
          <div
            className="ml-auto"
            style={{
              fontSize: 8,
              fontFamily: sans,
              color: 'var(--ide-accent)',
              background: 'var(--ide-accent-a10)',
              padding: '2px 6px',
            }}
          >
            ONLINE
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
            {msg.role === 'system' && (
              <div className="flex items-center gap-1 mb-1">
                <Bot size={9} color="var(--ide-accent)" />
                <span style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-accent)' }}>
                  Ask Oo
                </span>
              </div>
            )}
            <div
              className="inline-block text-left"
              style={{
                background: msg.role === 'system' ? 'var(--ide-bg-2)' : 'var(--ide-accent-a8)',
                border: `1px solid ${msg.role === 'system' ? 'var(--ide-border)' : 'var(--ide-accent-a20)'}`,
                padding: '8px 12px',
                maxWidth: '100%',
              }}
            >
              <pre
                style={{
                  fontSize: 10,
                  fontFamily: mono,
                  color: msg.role === 'system' ? 'var(--ide-text-4)' : 'var(--ide-accent-light)',
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                  lineHeight: 1.7,
                }}
              >
                {msg.text}
              </pre>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-1">
              <Bot size={9} color="var(--ide-accent)" />
              <span style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-accent)' }}>
                Ask Oo
              </span>
            </div>
            <div
              style={{
                background: 'var(--ide-bg-2)',
                border: '1px solid var(--ide-border)',
                padding: '8px 12px',
                display: 'inline-flex',
                gap: 4,
                alignItems: 'center',
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: 4,
                    background: 'var(--ide-accent)',
                    borderRadius: '50%',
                    animation: `typingDot 1.2s ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div
        className="shrink-0 px-4 pt-2 pb-1 flex flex-wrap gap-1"
        style={{ borderTop: '1px solid var(--ide-border-subtle)' }}
      >
        {CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => sendMessage(chip.query)}
            style={{
              background: 'var(--ide-border-subtle)',
              border: '1px solid var(--ide-border-medium)',
              cursor: 'pointer',
              fontSize: 9,
              fontFamily: mono,
              color: 'var(--ide-text-5)',
              padding: '2px 7px',
              letterSpacing: '0.04em',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--ide-accent-a30)';
              (e.currentTarget as HTMLElement).style.color = 'var(--ide-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--ide-border-medium)';
              (e.currentTarget as HTMLElement).style.color = 'var(--ide-text-5)';
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <div className="shrink-0 px-4 pb-3 pt-2">
        <div
          className="flex items-center gap-2"
          style={{
            background: 'var(--ide-bg-2)',
            border: '1px solid var(--ide-border-strong)',
            padding: '6px 10px',
          }}
        >
          <span style={{ fontSize: 10, fontFamily: mono, color: 'var(--ide-accent)' }}>›</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask anything about oakar..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 10,
              fontFamily: mono,
              color: 'var(--ide-text-2)',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: input.trim() ? 'var(--ide-accent)' : 'var(--ide-text-7)',
            }}
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function RightPanel() {
  const { rightPanelTab, setRightPanelTab } = useIDE();
  const { isMobile, isTablet } = useResponsive();
  const isInDrawer = isMobile || isTablet;
  return (
    <div
      className="shrink-0 flex flex-col"
      style={{
        width: isInDrawer ? '100%' : 280,
        background: 'var(--ide-bg-3)',
        borderLeft: isInDrawer ? 'none' : '1px solid var(--ide-border)',
      }}
    >
      <div
        className="shrink-0 flex"
        style={{ borderBottom: '1px solid var(--ide-border)', height: 32 }}
      >
        {(['system', 'askme'] as const).map((tab) => {
          const isActive = rightPanelTab === tab;
          const labels = { system: 'System', askme: 'Ask Oo' };
          const icons = { system: <BarChart2 size={10} />, askme: <Bot size={10} /> };
          return (
            <button
              key={tab}
              onClick={() => setRightPanelTab(tab)}
              data-guide={tab === 'askme' ? 'ask-oo' : undefined}
              className="flex items-center gap-1.5 px-4 h-full"
              style={{
                background: isActive ? 'var(--ide-bg-4)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--ide-accent)' : '2px solid transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 9,
                fontFamily: sans,
                color: isActive ? 'var(--ide-text-1)' : 'var(--ide-text-6)',
                letterSpacing: '0.08em',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {icons[tab]}
              {labels[tab]}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-hidden">
        {rightPanelTab === 'system' ? <SystemPanel /> : <AskMePanel />}
      </div>
    </div>
  );
}
