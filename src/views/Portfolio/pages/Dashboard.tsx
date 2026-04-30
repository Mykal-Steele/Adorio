'use client';

import { useRouter } from 'next/navigation';
import { GitCommit, GitPullRequest, ArrowRight, Zap, ExternalLink } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { useProjectNavigation } from '../hooks/useProjectNavigation';
import { mono, sans, vietnam } from '../constants/fonts';
import { Breadcrumb, Badge, LineNumbers } from '../shared';

const prColors: Record<string, { bg: string; text: string }> = {
  open: { bg: 'var(--ide-accent-a12)', text: 'var(--ide-accent)' },
  merged: { bg: 'var(--ide-purple-a15)', text: 'var(--ide-purple)' },
  closed: { bg: 'var(--ide-pink-a12)', text: 'var(--ide-pink)' },
};

const statusColors: Record<string, string> = {
  STABLE: 'var(--ide-accent)',
  BETA: 'var(--ide-orange)',
  DEPRECATED: 'var(--ide-pink)',
};

export function Dashboard() {
  const router = useRouter();
  const { openProject } = useProjectNavigation();
  const { isMobile, isTablet } = useResponsive();

  return (
    <div className="min-h-full">
      <Breadcrumb segments={['src', 'dashboard.tsx']} language="TypeScript JSX" />

      <div
        className="relative"
        style={{ background: 'var(--ide-bg-3)', borderBottom: '1px solid var(--ide-border)' }}
      >
        <div className="flex">
          {!isMobile && <LineNumbers count={18} />}
          <div className={`flex-1 ${isMobile ? 'px-4 py-6' : 'px-6 py-8'}`}>
            <div
              style={{
                fontSize: 13,
                fontFamily: mono,
                color: 'var(--ide-text-6)',
                marginBottom: 8,
              }}
            >
              // oakar oo — full-stack developer, Bangkok
            </div>
            <div style={{ fontFamily: mono, fontSize: isMobile ? 12 : 14, marginBottom: 4 }}>
              <span style={{ color: 'var(--ide-pink)' }}>const </span>
              <span style={{ color: 'var(--ide-accent-light)' }}>developer</span>
              <span style={{ color: 'var(--ide-pink)' }}> = </span>
              <span style={{ color: 'var(--ide-text-1)' }}>{'{'}</span>
            </div>
            <div
              style={{
                paddingLeft: isMobile ? 16 : 32,
                fontFamily: mono,
                fontSize: isMobile ? 12 : 14,
              }}
            >
              <div>
                <span style={{ color: 'var(--ide-orange)' }}>name</span>
                <span style={{ color: 'var(--ide-text-1)' }}>: </span>
                <span style={{ color: 'var(--ide-syntax-string)' }}>"oakar oo"</span>
                <span style={{ color: 'var(--ide-text-1)' }}>,</span>
              </div>
              <div>
                <span style={{ color: 'var(--ide-orange)' }}>role</span>
                <span style={{ color: 'var(--ide-text-1)' }}>: </span>
                <span style={{ color: 'var(--ide-accent)' }}>"Full-Stack Developer"</span>
                <span style={{ color: 'var(--ide-text-1)' }}>,</span>
              </div>
              <div>
                <span style={{ color: 'var(--ide-orange)' }}>location</span>
                <span style={{ color: 'var(--ide-text-1)' }}>: </span>
                <span style={{ color: 'var(--ide-accent)' }}>"Bangkok, Thailand — KMUTT CS"</span>
                <span style={{ color: 'var(--ide-text-1)' }}>,</span>
              </div>
              <div>
                <span style={{ color: 'var(--ide-orange)' }}>tagline</span>
                <span style={{ color: 'var(--ide-pink)' }}>: </span>
                <span style={{ color: 'var(--ide-pink)' }}>{'() =>'} </span>
                <span style={{ color: 'var(--ide-text-1)' }}>{'{'}</span>
              </div>
            </div>

            <div
              className="my-4 pl-8"
              style={{ borderLeft: '4px solid var(--ide-orange)', overflowX: 'auto' }}
            >
              <pre
                style={{
                  fontFamily: mono,
                  fontSize: isMobile ? 9 : isTablet ? 11 : 14,
                  color: 'var(--ide-accent-light)',
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >{`    ___       __          _
   /   | ____/ /___  ____(_)___
  / /| |/ __  / __ \\/ __/ / __ \\
 / ___ / /_/ / /_/ / / / / /_/ /
/_/  |_|\\__,_/\\____/_/ /_/\\____/`}</pre>
            </div>

            <div
              style={{
                paddingLeft: isMobile ? 16 : 32,
                fontFamily: mono,
                fontSize: isMobile ? 12 : 14,
              }}
            >
              <div>
                <span style={{ color: 'var(--ide-text-1)' }}>{'}'}</span>
              </div>
            </div>
            <div
              style={{ fontFamily: mono, fontSize: isMobile ? 12 : 14, color: 'var(--ide-text-1)' }}
            >
              {'}'}
            </div>

            <div className="flex flex-wrap gap-2 mt-6 mb-6">
              {portfolioData.community.map((c) => (
                <Badge
                  key={c.short}
                  color={c.color}
                  borderColor={`${c.color}40`}
                  style={{ padding: '2px 7px' }}
                >
                  {c.short}
                </Badge>
              ))}
            </div>

            <div className={`flex items-center gap-4 ${isMobile ? 'flex-col items-stretch' : ''}`}>
              <button
                onClick={() => router.push('/about')}
                className="flex items-center gap-2 px-6 py-3 transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--ide-accent-light)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: sans,
                  fontWeight: 700,
                  color: 'var(--ide-accent-dark)',
                  letterSpacing: '0.08em',
                }}
              >
                Read about <ArrowRight size={14} />
              </button>
              <button
                onClick={() => router.push('/projects')}
                className="flex items-center gap-2 px-6 py-3 transition-opacity hover:opacity-80"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--ide-border-stronger)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: sans,
                  fontWeight: 600,
                  color: 'var(--ide-text-4)',
                  letterSpacing: '0.08em',
                }}
              >
                View repos <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid gap-0" style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
        {/* Commits */}
        <div
          style={{
            borderRight: '1px solid var(--ide-border)',
            borderBottom: '1px solid var(--ide-border)',
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--ide-border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <GitCommit size={13} color="var(--ide-accent)" />
              <span
                style={{
                  fontSize: 11,
                  fontFamily: sans,
                  color: 'var(--ide-text-1)',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                }}
              >
                Commit Stream
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-accent)' }}>
                main
              </span>
              <span
                style={{
                  fontSize: 9,
                  background: 'var(--ide-accent-a12)',
                  color: 'var(--ide-accent)',
                  padding: '1px 6px',
                }}
              >
                STABLE
              </span>
            </div>
          </div>
          <div className="px-6 py-4">
            {portfolioData.commits.slice(0, 5).map((c, i) => {
              const branchColor =
                c.branch === 'main'
                  ? 'var(--ide-accent)'
                  : c.branch.startsWith('fix/')
                    ? 'var(--ide-orange)'
                    : 'var(--ide-purple)';
              return (
                <div
                  key={c.hash}
                  className="flex items-start gap-3 mb-4"
                  style={{
                    paddingBottom: i < 4 ? 16 : 0,
                    borderBottom: i < 4 ? '1px solid var(--ide-border-subtle)' : 'none',
                  }}
                >
                  <div style={{ marginTop: 3 }}>
                    <GitCommit size={12} color="var(--ide-text-7)" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontSize: 12,
                        fontFamily: sans,
                        color: 'var(--ide-text-2)',
                        lineHeight: 1.4,
                      }}
                    >
                      {c.message}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span style={{ fontSize: 10, fontFamily: mono, color: branchColor }}>
                        {c.branch}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: mono, color: 'var(--ide-text-7)' }}>
                        #{c.hash}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: sans, color: 'var(--ide-text-7)' }}>
                        {c.time}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-green)' }}>
                        +{c.additions}
                      </span>
                      <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-pink)' }}>
                        -{c.deletions}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => router.push('/projects')}
              style={{
                background: 'none',
                border: '1px solid var(--ide-border-medium)',
                cursor: 'pointer',
                color: 'var(--ide-text-5)',
                fontSize: 10,
                fontFamily: sans,
                padding: '6px 16px',
                width: '100%',
                letterSpacing: '0.06em',
              }}
            >
              View full log →
            </button>
          </div>
        </div>

        {/* Pull Requests */}
        <div style={{ borderBottom: '1px solid var(--ide-border)' }}>
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--ide-border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <GitPullRequest size={13} color="var(--ide-purple)" />
              <span
                style={{
                  fontSize: 11,
                  fontFamily: sans,
                  color: 'var(--ide-text-1)',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                }}
              >
                Pull Requests
              </span>
            </div>
            <span
              style={{
                fontSize: 9,
                background: 'var(--ide-purple-a12)',
                color: 'var(--ide-purple)',
                padding: '1px 6px',
              }}
            >
              {portfolioData.pullRequests.filter((p) => p.status === 'open').length} OPEN
            </span>
          </div>
          <div className="px-6 py-4">
            {portfolioData.pullRequests.map((pr, i) => {
              const isOpen = pr.status === 'open';
              const isMerged = pr.status === 'merged';
              return (
                <div
                  key={pr.id}
                  className="mb-4"
                  style={{
                    paddingBottom: i < portfolioData.pullRequests.length - 1 ? 16 : 0,
                    borderBottom:
                      i < portfolioData.pullRequests.length - 1
                        ? '1px solid var(--ide-border-subtle)'
                        : 'none',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <GitPullRequest
                      size={12}
                      color={
                        isOpen
                          ? 'var(--ide-accent)'
                          : isMerged
                            ? 'var(--ide-purple)'
                            : 'var(--ide-text-6)'
                      }
                      style={{ marginTop: 2, flexShrink: 0 }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          color={(prColors[pr.status] || prColors.open).text}
                          bg={(prColors[pr.status] || prColors.open).bg}
                          style={{ padding: '2px 7px' }}
                        >
                          {pr.status.toUpperCase()}
                        </Badge>
                        <span
                          style={{ fontSize: 10, fontFamily: mono, color: 'var(--ide-text-7)' }}
                        >
                          #{pr.id}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontFamily: sans,
                          color: 'var(--ide-text-2)',
                          lineHeight: 1.4,
                        }}
                      >
                        {pr.title}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-orange)' }}>
                          {pr.head}
                        </span>
                        <span style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-text-7)' }}>
                          → {pr.base}
                        </span>
                        <span style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-text-7)' }}>
                          {pr.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Project Gallery */}
      <div style={{ borderBottom: '1px solid var(--ide-border)' }}>
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--ide-border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <Zap size={13} color="var(--ide-orange)" />
            <span
              style={{
                fontSize: 11,
                fontFamily: sans,
                color: 'var(--ide-text-1)',
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              Project Gallery
            </span>
          </div>
          <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-text-5)' }}>
            TOTAL: {String(portfolioData.projects.length).padStart(3, '0')}
          </span>
        </div>
        <div
          className="grid px-6 py-4 gap-4"
          style={{
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          }}
        >
          {portfolioData.projects.slice(0, 3).map((proj) => (
            <button
              key={proj.id}
              onClick={() => openProject(proj.id)}
              className="text-left p-4 transition-all"
              style={{
                background: 'var(--ide-bg-2)',
                border: '1px solid var(--ide-border)',
                cursor: 'pointer',
                borderRadius: 4,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--ide-orange-a30)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--ide-border)';
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: sans,
                    color: statusColors[proj.status] || 'var(--ide-accent)',
                    letterSpacing: '0.06em',
                  }}
                >
                  ■ {proj.status}
                </span>
                <ArrowRight size={10} color="var(--ide-text-7)" />
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontFamily: sans,
                  color: 'var(--ide-text-1)',
                  fontWeight: 700,
                  marginBottom: 6,
                  letterSpacing: '-0.02em',
                }}
              >
                {proj.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: vietnam,
                  color: 'var(--ide-text-5)',
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}
              >
                {proj.description.slice(0, 80)}...
              </div>
              <div className="flex flex-wrap gap-1">
                {proj.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 9,
                      fontFamily: mono,
                      color: 'var(--ide-text-6)',
                      background: 'var(--ide-bg-3)',
                      padding: '1px 5px',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span style={{ fontSize: 9, fontFamily: mono, color: proj.langColor }}>
                  {proj.language}
                </span>
                <span style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-text-7)' }}>
                  {proj.lastCommit}
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="px-6 pb-4">
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center justify-center gap-2 w-full py-3 transition-opacity hover:opacity-90"
            style={{
              background: 'var(--ide-accent-a6)',
              border: '1px solid var(--ide-accent-a15)',
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: sans,
              color: 'var(--ide-accent)',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}
          >
            View all repositories <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}
