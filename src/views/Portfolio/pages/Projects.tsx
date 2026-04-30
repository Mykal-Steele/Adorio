'use client';

import { ArrowRight } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { useProjectNavigation } from '../hooks/useProjectNavigation';
import { mono, sans, vietnam } from '../constants/fonts';
import { statusConfig } from '../constants/status';
import { Breadcrumb, Badge, IDECard, PageHeader } from '../shared';

export function Projects() {
  const { openProject } = useProjectNavigation();
  const { isMobile, isTablet } = useResponsive();

  const totalRepos = portfolioData.projects.length;
  const stableCount = portfolioData.projects.filter((p) => p.status === 'STABLE').length;
  const totalStars = portfolioData.projects.reduce((acc, p) => acc + p.stars, 0);

  return (
    <div className="min-h-full">
      <Breadcrumb segments={['src', 'projects.tsx']} language="TypeScript JSX" />

      <div className={isMobile ? 'px-4 py-6' : 'px-8 py-8'}>
        <div style={{ marginBottom: 8 }}>
          <PageHeader
            title="Projects"
            subtitle="CLI tools, full-stack apps, and backend services."
          />
        </div>

        <IDECard
          className={`flex ${isMobile ? 'flex-wrap gap-4' : 'items-center gap-6'} mt-8 mb-8 px-6 py-4`}
        >
          {[
            { label: 'Total Repos', value: totalRepos.toString() },
            { label: 'Stable Builds', value: stableCount.toString() },
            { label: 'Total Stars', value: totalStars.toLocaleString() },
            { label: 'NPM Packages', value: '1' },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-3">
              <div
                style={{
                  fontSize: 8,
                  fontFamily: sans,
                  color: 'var(--ide-text-6)',
                  letterSpacing: '0.1em',
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontFamily: sans,
                  fontWeight: 700,
                  color: 'var(--ide-text-1)',
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </IDECard>

        <IDECard className="mb-8">
          {portfolioData.projects.map((proj, i) => {
            const sc = statusConfig[proj.status] || statusConfig.STABLE;
            const isLast = i === portfolioData.projects.length - 1;
            return (
              <button
                key={proj.id}
                onClick={() => openProject(proj.id)}
                className={`w-full text-left ${isMobile ? 'flex flex-col gap-2' : 'flex items-center gap-6'} px-6 py-5 transition-all`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: !isLast ? '1px solid var(--ide-border-subtle)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {!isMobile && (
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: mono,
                      color: 'var(--ide-text-7)',
                      flexShrink: 0,
                      width: 24,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                )}
                <div style={{ flexShrink: 0, width: isMobile ? undefined : 220 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      style={{
                        width: 3,
                        height: 3,
                        background: proj.langColor,
                        borderRadius: '50%',
                      }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        fontFamily: sans,
                        fontWeight: 600,
                        color: 'var(--ide-text-1)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {proj.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: sans, color: 'var(--ide-text-6)' }}>
                    lang: {proj.language.toLowerCase()}
                  </div>
                </div>
                <div style={{ flexShrink: 0, width: 100 }}>
                  <Badge color={sc.color} bg={sc.bg}>
                    {sc.label}
                  </Badge>
                </div>
                {!isMobile && (
                  <>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 10,
                          fontFamily: mono,
                          color: 'var(--ide-text-5)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        &ldquo;{proj.commitMessage}&rdquo;
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, width: 90 }}>
                      <div
                        style={{
                          fontSize: 9,
                          fontFamily: sans,
                          color: 'var(--ide-text-6)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Last Commit
                      </div>
                      <div style={{ fontSize: 11, fontFamily: mono, color: 'var(--ide-text-4)' }}>
                        {proj.lastCommit}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, width: 80, textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: 9,
                          fontFamily: sans,
                          color: 'var(--ide-text-6)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Footprint
                      </div>
                      <div style={{ fontSize: 11, fontFamily: mono, color: 'var(--ide-accent)' }}>
                        {proj.footprint}
                      </div>
                    </div>
                  </>
                )}
                <ArrowRight size={14} color="var(--ide-text-7)" style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </IDECard>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}
        >
          {[
            {
              label: 'Primary Stack',
              sub: 'TypeScript · React · Hono',
              value: 'TS',
              color: 'var(--ide-ts-blue)',
            },
            {
              label: 'Active Runtimes',
              sub: 'Bun · Go · Node.js',
              value: '3',
              color: 'var(--ide-orange)',
            },
            {
              label: 'Latest Release',
              sub: 'create-adorex',
              value: 'v1.4',
              color: 'var(--ide-accent)',
            },
          ].map((stat) => (
            <IDECard
              key={stat.label}
              className="p-6"
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: stat.color,
                }}
              />
              <div
                style={{
                  fontSize: 8,
                  fontFamily: sans,
                  color: 'var(--ide-text-6)',
                  letterSpacing: '0.12em',
                  marginBottom: 12,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: vietnam,
                  color: 'var(--ide-text-5)',
                  marginBottom: 8,
                }}
              >
                {stat.sub}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontFamily: sans,
                  fontWeight: 700,
                  color: 'var(--ide-text-1)',
                }}
              >
                {stat.value}
              </div>
              <div style={{ marginTop: 8, height: 2, background: 'var(--ide-border)' }}>
                <div
                  style={{ height: '100%', width: '100%', background: stat.color, opacity: 0.4 }}
                />
              </div>
            </IDECard>
          ))}
        </div>

        <IDECard className="mt-4 p-6">
          <div
            style={{
              fontSize: 9,
              fontFamily: sans,
              color: 'var(--ide-text-6)',
              letterSpacing: '0.12em',
              marginBottom: 16,
            }}
          >
            Language Distribution
          </div>
          {/* height:96 gives the bars room so the % labels don't overlap the title */}
          <div className="flex items-end gap-3" style={{ height: 96 }}>
            {portfolioData.languageDistribution.map((l) => {
              const maxPct = portfolioData.languageDistribution[0]?.pct ?? 100;
              return (
                <div key={l.name} className="flex flex-col items-center gap-1">
                  <span style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-text-6)' }}>
                    {l.pct}%
                  </span>
                  <div
                    style={{
                      width: 32,
                      height: Math.max(8, (l.pct / maxPct) * 60),
                      background: l.color,
                      opacity: 0.8,
                    }}
                  />
                  <span style={{ fontSize: 8, fontFamily: sans, color: 'var(--ide-text-7)' }}>
                    {l.name}
                  </span>
                </div>
              );
            })}
          </div>
        </IDECard>
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}
