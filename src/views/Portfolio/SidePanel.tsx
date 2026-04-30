'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Folder,
  FileText,
  Terminal,
  ChevronDown,
  GitCommit,
  GitPullRequest,
  Circle,
  Search,
  User,
  MapPin,
  Clock,
} from 'lucide-react';
import { useIDE } from './context/IDEContext';
import { portfolioData } from './data/portfolio';
import { useResponsive } from './hooks/useResponsive';
import { mono, sans } from './constants/fonts';

function ExplorerPanel() {
  const pathname = usePathname();
  const router = useRouter();

  const files = [
    { name: 'dashboard.tsx', path: '/', icon: <FileText size={12} color="var(--ide-orange)" /> },
    { name: 'about_me.md', path: '/about', icon: <FileText size={12} color="var(--ide-text-4)" /> },
    {
      name: 'projects.json',
      path: '/projects',
      icon: <FileText size={12} color="var(--ide-accent-light)" />,
    },
    {
      name: 'contact.sh',
      path: '/contact',
      icon: <Terminal size={12} color="var(--ide-purple)" />,
    },
  ];

  return (
    <div>
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          color: 'var(--ide-text-5)',
          fontSize: 10,
          fontFamily: sans,
          letterSpacing: '0.1em',
        }}
      >
        <ChevronDown size={10} />
        <span>~/src/portfolio</span>
      </div>
      <div
        className="flex items-center gap-1 px-3 py-1"
        style={{
          color: 'var(--ide-text-5)',
          fontSize: 10,
          fontFamily: sans,
          letterSpacing: '0.08em',
        }}
      >
        <Folder size={11} color="var(--ide-orange)" />
        <span>src/</span>
      </div>
      {files.map((f) => {
        const isActive = pathname === f.path || (f.path === '/' && pathname === '/');
        return (
          <button
            key={f.name}
            onClick={() => router.push(f.path)}
            className="w-full flex items-center gap-2 py-1 text-left transition-colors"
            style={{
              background: isActive ? 'var(--ide-border)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--ide-accent)' : '2px solid transparent',
              border: 'none',
              cursor: 'pointer',
              paddingLeft: isActive ? 22 : 24,
              paddingRight: 12,
            }}
            onMouseEnter={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLElement).style.background = 'var(--ide-border-subtle)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            {f.icon}
            <span
              style={{
                fontSize: 12,
                fontFamily: sans,
                color: isActive ? 'var(--ide-accent)' : 'var(--ide-text-3)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {f.name}
            </span>
          </button>
        );
      })}
      <div className="mt-4 px-3 pt-3" style={{ borderTop: '1px solid var(--ide-border-subtle)' }}>
        <div
          style={{
            fontSize: 9,
            fontFamily: sans,
            color: 'var(--ide-text-7)',
            letterSpacing: '0.1em',
            marginBottom: 8,
          }}
        >
          Dependencies
        </div>
        {portfolioData.portfolioDeps.map((dep) => (
          <div
            key={dep}
            style={{
              fontSize: 10,
              fontFamily: mono,
              color: 'var(--ide-text-7)',
              paddingLeft: 4,
              lineHeight: 1.8,
            }}
          >
            # {dep}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePanel() {
  return (
    <div className="px-3">
      <div className="flex items-center gap-3 mb-4">
        <div
          style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, var(--ide-accent), var(--ide-orange))',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <User size={20} color="var(--ide-accent-dark)" />
        </div>
        <div>
          <div
            style={{ fontSize: 13, fontFamily: sans, color: 'var(--ide-text-1)', fontWeight: 700 }}
          >
            oakar oo
          </div>
          <div style={{ fontSize: 10, fontFamily: mono, color: 'var(--ide-accent)' }}>
            {portfolioData.handle}
          </div>
        </div>
      </div>
      <div
        className="mb-4 p-3"
        style={{
          background: 'var(--ide-accent-a5)',
          border: '1px solid var(--ide-accent-a15)',
          borderRadius: 4,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontFamily: sans,
            color: 'var(--ide-text-1)',
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {portfolioData.role}
        </div>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
          <div
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ide-accent)' }}
          />
          <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-accent)' }}>
            Open to Opportunities
          </span>
        </div>
        <div style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-text-5)' }}>
          {portfolioData.university}
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={10} color="var(--ide-text-6)" />
          <span style={{ fontSize: 10, fontFamily: sans, color: 'var(--ide-text-4)' }}>
            {portfolioData.location}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={10} color="var(--ide-text-6)" />
          <span style={{ fontSize: 10, fontFamily: sans, color: 'var(--ide-text-4)' }}>
            UTC+7 · Bangkok
          </span>
        </div>
      </div>
      <div
        style={{
          fontSize: 9,
          fontFamily: sans,
          color: 'var(--ide-text-7)',
          letterSpacing: '0.1em',
          marginBottom: 8,
        }}
      >
        Community
      </div>
      {portfolioData.community.map((c) => (
        <div
          key={c.short}
          className="flex items-center gap-2 mb-2 px-2 py-1.5"
          style={{
            background: `${c.color}08`,
            border: `1px solid ${c.color}25`,
            borderRadius: 3,
            boxShadow: `inset 3px 0 0 ${c.color}`,
          }}
        >
          <Circle size={5} fill={c.color} color={c.color} />
          <span style={{ fontSize: 10, fontFamily: sans, color: 'var(--ide-text-3)' }}>
            {c.name}
          </span>
        </div>
      ))}
      <div
        style={{
          fontSize: 9,
          fontFamily: sans,
          color: 'var(--ide-text-7)',
          letterSpacing: '0.1em',
          marginTop: 12,
          marginBottom: 8,
        }}
      >
        Metrics
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {[
          { label: 'Years', value: '4' },
          { label: 'Repos', value: '5' },
          { label: 'NPM Pkg', value: '1' },
          { label: 'Commits', value: '7+' },
        ].map((s) => (
          <div
            key={s.label}
            className="p-2"
            style={{
              background: 'var(--ide-bg-2)',
              border: '1px solid var(--ide-border-subtle)',
              borderRadius: 3,
            }}
          >
            <div
              style={{
                fontSize: 8,
                fontFamily: sans,
                color: 'var(--ide-text-7)',
                letterSpacing: '0.08em',
                marginBottom: 2,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: 16,
                fontFamily: sans,
                fontWeight: 700,
                color: 'var(--ide-accent-light)',
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchPanel() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const allResults = portfolioData.searchResults;
  const results = query.trim()
    ? allResults.filter(
        (r) =>
          r.file.toLowerCase().includes(query.toLowerCase()) ||
          r.content.toLowerCase().includes(query.toLowerCase()),
      )
    : allResults.slice(0, 5);

  return (
    <div className="px-3">
      <div
        className="flex items-center gap-2 px-2 mb-3"
        style={{
          height: 28,
          background: 'var(--ide-bg-2)',
          border: '1px solid var(--ide-border-strong)',
        }}
      >
        <Search size={10} color="var(--ide-accent)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search portfolio..."
          autoFocus
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
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ide-text-6)',
              fontSize: 10,
              padding: 0,
            }}
          >
            ✕
          </button>
        )}
      </div>
      <div
        style={{
          fontSize: 9,
          fontFamily: sans,
          color: 'var(--ide-text-5)',
          letterSpacing: '0.1em',
          marginBottom: 8,
        }}
      >
        {results.length} RESULTS {query ? `— "${query}"` : ''}
      </div>
      {results.map((r, i) => (
        <button
          key={i}
          onClick={() => router.push(r.path)}
          className="w-full text-left mb-3"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div
            style={{ fontSize: 10, fontFamily: sans, color: 'var(--ide-text-3)', marginBottom: 3 }}
          >
            {r.file}
          </div>
          <div
            className="px-2 py-1"
            style={{ background: 'var(--ide-bg-2)', borderLeft: '2px solid var(--ide-bg-5)' }}
          >
            <span style={{ fontSize: 10, fontFamily: mono, color: 'var(--ide-text-5)' }}>
              {r.line}{' '}
            </span>
            <span style={{ fontSize: 10, fontFamily: mono, color: 'var(--ide-text-4)' }}>
              {r.content}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function GitPanel() {
  const statusColors: Record<string, string> = {
    main: 'var(--ide-accent)',
    'fix/win-paths': 'var(--ide-orange)',
    'feature/astro-template': 'var(--ide-purple)',
    'feature/ts-strict': 'var(--ide-blue)',
    'feature/rust-backend': 'var(--ide-red-dark)',
  };
  return (
    <div>
      <div className="px-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Circle size={7} fill="var(--ide-accent)" color="var(--ide-accent)" />
          <span
            style={{ fontSize: 12, fontFamily: sans, color: 'var(--ide-accent)', fontWeight: 600 }}
          >
            main/production
          </span>
          <span
            style={{
              fontSize: 9,
              background: 'var(--ide-accent-a12)',
              color: 'var(--ide-accent)',
              padding: '1px 5px',
            }}
          >
            STABLE
          </span>
        </div>
        <div style={{ fontSize: 10, fontFamily: sans, color: 'var(--ide-text-6)' }}>
          {portfolioData.commits.length} commits this quarter
        </div>
      </div>
      <div className="px-3 mb-3">
        <div
          style={{
            fontSize: 9,
            fontFamily: sans,
            color: 'var(--ide-text-7)',
            letterSpacing: '0.1em',
            marginBottom: 6,
          }}
        >
          OPEN PRS
        </div>
        {portfolioData.pullRequests
          .filter((p) => p.status === 'open')
          .map((pr) => (
            <div key={pr.id} className="flex items-start gap-2 mb-2">
              <GitPullRequest
                size={10}
                color="var(--ide-blue)"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: 10, fontFamily: sans, color: 'var(--ide-text-3)' }}>
                  #{pr.id} {pr.title.slice(0, 32)}...
                </div>
                <div style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-text-6)' }}>
                  {pr.time}
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="px-3">
        <div
          style={{
            fontSize: 9,
            fontFamily: sans,
            color: 'var(--ide-text-7)',
            letterSpacing: '0.1em',
            marginBottom: 6,
          }}
        >
          RECENT COMMITS
        </div>
        {portfolioData.commits.slice(0, 5).map((c) => (
          <div key={c.hash} className="flex items-start gap-2 mb-3">
            <GitCommit
              size={10}
              color="var(--ide-text-6)"
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <div className="min-w-0">
              <div
                style={{
                  fontSize: 10,
                  fontFamily: sans,
                  color: 'var(--ide-text-4)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {c.message}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: mono,
                    color: statusColors[c.branch] || 'var(--ide-text-5)',
                  }}
                >
                  #{c.hash}
                </span>
                <span style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-text-7)' }}>
                  {c.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsPanel() {
  const categories = ['Language', 'Framework', 'Runtime', 'Tool'];
  return (
    <div className="px-3">
      <div
        style={{
          fontSize: 9,
          fontFamily: sans,
          color: 'var(--ide-text-7)',
          letterSpacing: '0.1em',
          marginBottom: 8,
        }}
      >
        Installed — {portfolioData.skills.length} Packages
      </div>
      {categories.map((cat) => {
        const skills = portfolioData.skills.filter((s) => s.category === cat);
        if (!skills.length) return null;
        return (
          <div key={cat} className="mb-4">
            <div
              style={{
                fontSize: 9,
                fontFamily: sans,
                color: 'var(--ide-text-6)',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              {cat.toUpperCase()}
            </div>
            {skills.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between mb-1 px-2 py-1"
                style={{ background: s.active ? 'var(--ide-border-subtle)' : 'transparent' }}
              >
                <div className="flex items-center gap-2">
                  <Circle
                    size={5}
                    fill={s.active ? 'var(--ide-accent)' : 'var(--ide-text-7)'}
                    color={s.active ? 'var(--ide-accent)' : 'var(--ide-text-7)'}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: mono,
                      color: s.active ? 'var(--ide-text-2)' : 'var(--ide-text-6)',
                    }}
                  >
                    {s.name}
                  </span>
                </div>
                <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-text-7)' }}>
                  {s.version}
                </span>
              </div>
            ))}
          </div>
        );
      })}
      <div className="mt-2 pt-3" style={{ borderTop: '1px solid var(--ide-border-subtle)' }}>
        <div
          style={{
            fontSize: 9,
            fontFamily: sans,
            color: 'var(--ide-text-7)',
            letterSpacing: '0.1em',
            marginBottom: 8,
          }}
        >
          COMMUNITY_ROLES
        </div>
        {portfolioData.community.map((c) => (
          <div key={c.short} className="flex items-center gap-2 mb-2">
            <Circle size={5} fill={c.color} color={c.color} />
            <span style={{ fontSize: 10, fontFamily: sans, color: 'var(--ide-text-5)' }}>
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SidePanel() {
  const { activeSidePanel } = useIDE();
  const { isMobile, isTablet } = useResponsive();
  const labels: Record<string, string> = {
    explorer: 'Explorer: Portfolio',
    profile: 'Profile',
    git: 'Source Control',
    skills: 'Extensions',
  };
  const renderPanel = () => {
    switch (activeSidePanel) {
      case 'explorer':
        return <ExplorerPanel />;
      case 'profile':
        return <ProfilePanel />;
      case 'git':
        return <GitPanel />;
      case 'skills':
        return <SkillsPanel />;
    }
  };
  const isInDrawer = isMobile || isTablet;
  return (
    <div
      className="shrink-0 flex flex-col overflow-hidden"
      data-guide="side-panel"
      style={{
        width: isInDrawer ? '100%' : 220,
        background: 'var(--ide-bg-2)',
        borderRight: isInDrawer ? 'none' : '1px solid var(--ide-border)',
      }}
    >
      <div
        className="shrink-0 px-3 py-2"
        style={{
          borderBottom: '1px solid var(--ide-border)',
          fontSize: 9,
          fontFamily: sans,
          color: 'var(--ide-text-5)',
          letterSpacing: '0.12em',
        }}
      >
        {labels[activeSidePanel]}
      </div>
      <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
        {renderPanel()}
      </div>
    </div>
  );
}
