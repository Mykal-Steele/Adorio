'use client';

import { useState, useEffect } from 'react';
import { Bot, Circle, BarChart2, Sparkles } from 'lucide-react';
import { useIDE } from './context/IDEContext';
import { portfolioData } from './data/portfolio';
import { useResponsive } from './hooks/useResponsive';
import { mono, sans } from './constants/fonts';

type LiveStatus = 'ONLINE' | 'DEGRADED' | 'DOWN' | 'PAUSED';

const STATUS_CODE: Record<number, LiveStatus> = {
  2: 'ONLINE',
  8: 'DEGRADED',
  9: 'DOWN',
  0: 'PAUSED',
};

// Display name overrides for UptimeRobot friendly_name values
const DISPLAY_NAMES: Record<string, string> = {
  'adorio.space': 'Adorio',
};

// Which monitors also pull CPU from /api/metrics (matched against friendly_name)
const CPU_MONITORS = new Set(['adorio.space']);

interface MonitorCard {
  key: string;
  displayName: string;
  status: LiveStatus;
  uptime: string;
  hasCpu: boolean;
}

const LS_MONITORS = 'sys_monitors';
const LS_CPU = 'sys_cpu';
const LS_MEMORY = 'sys_memory';
const LS_FETCHED_AT = 'sys_fetched_at';

function readCache<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}
function writeCache(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

function useSecondsAgo(ts: number | null) {
  const [age, setAge] = useState(0);
  useEffect(() => {
    if (!ts) return;
    setAge(Math.floor((Date.now() - ts) / 1000));
    const t = setInterval(() => setAge(Math.floor((Date.now() - ts) / 1000)), 5000);
    return () => clearInterval(t);
  }, [ts]);
  if (!ts) return null;
  return age < 10 ? 'just now' : `${age}s ago`;
}

function SystemPanel() {
  const [monitors, setMonitors] = useState<MonitorCard[]>([]);
  const [cpu, setCpu] = useState<string | null>(null);
  const [memory, setMemory] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);

  useEffect(() => {
    const cachedMonitors = readCache<MonitorCard[]>(LS_MONITORS);
    if (cachedMonitors) setMonitors(cachedMonitors);
    const cachedCpu = readCache<string>(LS_CPU);
    if (cachedCpu) setCpu(cachedCpu);
    const cachedMemory = readCache<string>(LS_MEMORY);
    if (cachedMemory) setMemory(cachedMemory);
    const cachedFetchedAt = readCache<number>(LS_FETCHED_AT);
    if (cachedFetchedAt) setFetchedAt(cachedFetchedAt);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/uptime');
        const json = await res.json();
        const raw = json?.monitors;
        if (!Array.isArray(raw) || raw.length === 0) return;
        const cards = raw.map(
          (m: { friendly_name: string; status: number; custom_uptime_ratio: string }) => ({
            key: m.friendly_name,
            displayName: DISPLAY_NAMES[m.friendly_name] ?? m.friendly_name,
            status: STATUS_CODE[m.status] ?? 'ONLINE',
            uptime: `${(parseFloat(m.custom_uptime_ratio) || 100).toFixed(3)}%`,
            hasCpu: CPU_MONITORS.has(m.friendly_name),
          }),
        );
        setMonitors(cards);
        writeCache(LS_MONITORS, cards);
        if (json.ts) {
          setFetchedAt((prev) => Math.max(prev ?? 0, json.ts));
          writeCache(LS_FETCHED_AT, json.ts);
        }
      } catch {
        /* silent */
      }
    };
    const t1 = setTimeout(load, 1500);
    const t2 = setInterval(load, 60_000);
    return () => {
      clearTimeout(t1);
      clearInterval(t2);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/metrics');
        const json = await res.json();
        if (json.cpu) {
          setCpu(json.cpu);
          writeCache(LS_CPU, json.cpu);
        }
        if (json.memory) {
          setMemory(json.memory);
          writeCache(LS_MEMORY, json.memory);
        }
        if (json.ts) {
          setFetchedAt((prev) => Math.max(prev ?? 0, json.ts));
          writeCache(LS_FETCHED_AT, json.ts);
        }
      } catch {
        /* silent */
      }
    };
    const t1 = setTimeout(load, 1500);
    const t2 = setInterval(load, 60_000);
    return () => {
      clearTimeout(t1);
      clearInterval(t2);
    };
  }, []);

  const updatedAgo = useSecondsAgo(fetchedAt);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
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
            {updatedAgo && (
              <span style={{ fontSize: 8, fontFamily: mono, color: 'var(--ide-text-7)' }}>
                {updatedAgo}
              </span>
            )}
          </div>
          <Circle
            size={6}
            fill="var(--ide-accent)"
            color="var(--ide-accent)"
            style={{ animation: 'pulse 2s infinite' }}
          />
        </div>
        {monitors.map((m) => {
          const statusColor =
            m.status === 'ONLINE'
              ? 'var(--ide-accent)'
              : m.status === 'DEGRADED' || m.status === 'DOWN'
                ? 'var(--ide-orange)'
                : 'var(--ide-text-5)';
          const cpuVal = m.hasCpu && cpu ? cpu : '—';
          const barWidth = m.hasCpu && cpu ? parseFloat(cpu) || 2 : 2;
          return (
            <div
              key={m.key}
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
                  {m.displayName}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: sans,
                    color: statusColor,
                    letterSpacing: '0.05em',
                  }}
                >
                  {m.status}
                </span>
              </div>
              <div className="flex gap-3 mb-2">
                {[
                  { label: 'CPU', value: cpuVal, color: 'var(--ide-text-1)' },
                  {
                    label: 'Memory',
                    value: m.hasCpu && memory ? memory : '—',
                    color: 'var(--ide-text-1)',
                  },
                  { label: 'Uptime', value: m.uptime, color: 'var(--ide-accent)' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div
                      style={{
                        fontSize: 8,
                        fontFamily: sans,
                        color: 'var(--ide-text-5)',
                        marginBottom: 1,
                      }}
                    >
                      {stat.label}
                    </div>
                    <div style={{ fontSize: 12, fontFamily: mono, color: stat.color }}>
                      {stat.value}
                    </div>
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

export function AskMePanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-4 py-3" style={{ borderBottom: '1px solid var(--ide-border)' }}>
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 24,
              height: 24,
              background: 'var(--ide-bg-2)',
              border: '1px solid var(--ide-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={12} color="var(--ide-text-5)" />
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
              color: 'var(--ide-text-5)',
              background: 'var(--ide-border-subtle)',
              padding: '2px 6px',
              letterSpacing: '0.05em',
            }}
          >
            COMING SOON
          </div>
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto px-6 flex flex-col items-center justify-center text-center gap-3"
        style={{ scrollbarWidth: 'none' }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: 'var(--ide-bg-2)',
            border: '1px dashed var(--ide-border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles size={16} color="var(--ide-text-6)" />
        </div>
        <div
          style={{
            fontSize: 11,
            fontFamily: sans,
            color: 'var(--ide-text-2)',
            fontWeight: 600,
          }}
        >
          Not built yet
        </div>
        <p
          style={{
            fontSize: 10,
            fontFamily: mono,
            color: 'var(--ide-text-5)',
            lineHeight: 1.7,
            maxWidth: 210,
            margin: 0,
          }}
        >
          This is going to be a real assistant you can ask about my projects and background, once
          it's hooked up to an actual AI backend. For now there's nothing behind it, so it's parked
          here until that part is done.
        </p>
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
                borderTop: 'none',
                borderRight: 'none',
                borderLeft: 'none',
                borderBottom: isActive ? '2px solid var(--ide-accent)' : '2px solid transparent',
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
