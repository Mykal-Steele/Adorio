'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Folder, FileText, Terminal, ChevronDown, Circle, User, MapPin, Clock } from 'lucide-react';
import { useIDE } from './context/IDEContext';
import { portfolioData } from './data/portfolio';
import { useResponsive } from './hooks/useResponsive';
import { mono, sans } from './constants/fonts';

function ExplorerPanel() {
  const pathname = usePathname();
  const router = useRouter();

  const files = [
    { name: 'about_me.md', path: '/', icon: <FileText size={14} color="var(--ide-orange)" /> },
    {
      name: 'projects.json',
      path: '/projects',
      icon: <FileText size={14} color="var(--ide-accent)" />,
    },
    {
      name: 'contact.sh',
      path: '/contact',
      icon: <Terminal size={14} color="var(--ide-purple)" />,
    },
  ];

  return (
    <div>
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          color: 'var(--ide-text-4)',
          fontSize: 12,
          fontFamily: sans,
          letterSpacing: '0.06em',
        }}
      >
        <ChevronDown size={12} />
        <span>~/src/portfolio</span>
      </div>
      <div
        className="flex items-center gap-1 px-3 py-1"
        style={{
          color: 'var(--ide-text-4)',
          fontSize: 12,
          fontFamily: sans,
          letterSpacing: '0.06em',
        }}
      >
        <Folder size={14} color="var(--ide-orange)" />
        <span>src/</span>
      </div>
      {files.map((f) => {
        const isActive = pathname === f.path || (f.path === '/' && pathname === '/');
        return (
          <button
            key={f.name}
            onClick={() => router.push(f.path)}
            className="w-full flex items-center gap-2 py-2 text-left transition-colors"
            style={{
              background: isActive ? 'var(--nb-accent)' : 'transparent',
              borderTop: 'none',
              borderRight: 'none',
              borderBottom: 'none',
              borderLeft: isActive ? '4px solid var(--nb-border)' : '4px solid transparent',
              cursor: 'pointer',
              paddingLeft: isActive ? 22 : 24,
              paddingRight: 12,
            }}
            onMouseEnter={(e) => {
              router.prefetch(f.path);
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
                fontSize: 15,
                fontFamily: sans,
                color: isActive ? 'var(--nb-on-accent)' : 'var(--ide-text-3)',
                fontWeight: isActive ? 700 : 400,
              }}
            >
              {f.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ProfilePanel() {
  return (
    <div className="px-3">
      <div className="flex items-center gap-3 mb-5">
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
          <User size={20} color="var(--ide-bg-1)" />
        </div>
        <div>
          <div
            style={{ fontSize: 16, fontFamily: sans, color: 'var(--ide-text-1)', fontWeight: 700 }}
          >
            Oakar Oo
          </div>
          <div style={{ fontSize: 12, fontFamily: mono, color: 'var(--ide-accent)' }}>
            {portfolioData.handle}
          </div>
        </div>
      </div>

      <div
        className="mb-5 p-3"
        style={{
          background: 'var(--ide-accent-a5)',
          border: '1px solid var(--ide-accent-a15)',
          borderRadius: 4,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontFamily: sans,
            color: 'var(--ide-text-1)',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          {portfolioData.role}
        </div>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 6 }}>
          <div
            style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ide-accent)' }}
          />
          <span style={{ fontSize: 13, fontFamily: sans, color: 'var(--ide-accent)' }}>
            Open to Opportunities
          </span>
        </div>
        <div style={{ fontSize: 13, fontFamily: sans, color: 'var(--ide-text-4)' }}>
          {portfolioData.university}
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2">
          <MapPin size={13} color="var(--ide-text-5)" />
          <span style={{ fontSize: 14, fontFamily: sans, color: 'var(--ide-text-3)' }}>
            {portfolioData.location}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={13} color="var(--ide-text-5)" />
          <span style={{ fontSize: 14, fontFamily: sans, color: 'var(--ide-text-3)' }}>
            UTC+7 · Bangkok
          </span>
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          fontFamily: sans,
          color: 'var(--ide-text-5)',
          letterSpacing: '0.1em',
          marginBottom: 8,
        }}
      >
        COMMUNITY
      </div>
      {portfolioData.community.map((c) => (
        <div
          key={c.short}
          className="flex items-center gap-2 mb-2 px-2 py-2"
          style={{
            background: `${c.color}08`,
            border: `1px solid ${c.color}25`,
            borderRadius: 3,
            boxShadow: `inset 3px 0 0 ${c.color}`,
          }}
        >
          <Circle size={6} fill={c.color} color={c.color} />
          <span style={{ fontSize: 14, fontFamily: sans, color: 'var(--ide-text-3)' }}>
            {c.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function SkillsPanel() {
  const categories = ['Language', 'Framework', 'Runtime', 'Tool'] as const;
  return (
    <div className="px-3">
      {categories.map((cat) => {
        const skills = portfolioData.skills.filter((s) => s.category === cat);
        if (!skills.length) return null;
        return (
          <div key={cat} className="mb-5">
            <div
              style={{
                fontSize: 11,
                fontFamily: sans,
                color: 'var(--ide-text-5)',
                letterSpacing: '0.1em',
                marginBottom: 6,
              }}
            >
              {cat.toUpperCase()}
            </div>
            {skills.map((s) => (
              <div key={s.name} className="flex items-center gap-2 mb-1 px-2 py-1">
                <Circle size={5} fill="var(--ide-accent)" color="var(--ide-accent)" />
                <span
                  style={{
                    fontSize: 15,
                    fontFamily: mono,
                    color: 'var(--ide-text-2)',
                  }}
                >
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function SidePanel() {
  const { activeSidePanel } = useIDE();
  const { isMobile, isTablet } = useResponsive();
  const labels: Record<string, string> = {
    explorer: 'Explorer: Portfolio',
    profile: 'Profile',
    skills: 'Skills',
  };
  const renderPanel = () => {
    switch (activeSidePanel) {
      case 'explorer':
        return <ExplorerPanel />;
      case 'profile':
        return <ProfilePanel />;
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
        borderRight: isInDrawer ? 'none' : '2px solid var(--nb-border)',
      }}
    >
      <div
        className="shrink-0 px-3 py-2"
        style={{
          borderBottom: '2px solid var(--nb-border)',
          fontSize: 11,
          fontFamily: sans,
          color: 'var(--ide-text-3)',
          letterSpacing: '0.1em',
          fontWeight: 700,
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
