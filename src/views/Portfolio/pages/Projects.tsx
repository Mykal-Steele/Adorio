'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink, Lock } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { useProjectNavigation } from '../hooks/useProjectNavigation';
import { mono, sans, vietnam } from '../constants/fonts';
import { statusConfig } from '../constants/status';
import { Breadcrumb, Badge, IDECard, PageHeader, SectionLabel } from '../shared';

export function Projects() {
  const { openProject, prefetchProject } = useProjectNavigation();
  const { isMobile } = useResponsive();

  return (
    <div className="min-h-full">
      <Breadcrumb segments={['src', 'projects.tsx']} language="TypeScript JSX" />

      <div className={isMobile ? 'px-5 py-7' : 'px-8 py-9'}>
        <PageHeader
          title="Projects"
          subtitle="Backend services, tools, and the systems that keep them running."
        />

        <IDECard className="mt-8 mb-8">
          {portfolioData.projects.map((proj, i) => {
            const sc = statusConfig[proj.status] || statusConfig.STABLE;
            const isLast = i === portfolioData.projects.length - 1;
            return (
              <button
                key={proj.id}
                onClick={() => openProject(proj.id)}
                className="w-full text-left px-5 py-5 transition-colors"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: !isLast ? '1px solid var(--ide-border-subtle)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  prefetchProject(proj.id);
                  (e.currentTarget as HTMLElement).style.background = 'var(--ide-bg-3)';
                }}
                onTouchStart={() => prefetchProject(proj.id)}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3 flex-wrap min-w-0">
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize: 19,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        color: 'var(--ide-text-1)',
                      }}
                    >
                      {proj.name}
                    </span>
                    {proj.language && (
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: 12,
                          color: proj.langColor ?? 'var(--ide-text-4)',
                        }}
                      >
                        {proj.language}
                      </span>
                    )}
                    <Badge color={sc.color} bg={sc.bg} style={{ fontSize: 11 }}>
                      {sc.label}
                    </Badge>
                    {proj.requiresAccount && (
                      <span
                        className="inline-flex items-center gap-1"
                        style={{ fontFamily: sans, fontSize: 12, color: 'var(--ide-text-5)' }}
                      >
                        <Lock size={11} />
                        Requires an account
                      </span>
                    )}
                  </div>
                  <ArrowRight
                    size={16}
                    color="var(--ide-text-5)"
                    style={{ flexShrink: 0, marginTop: 4 }}
                  />
                </div>
                <p
                  style={{
                    fontFamily: vietnam,
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: 'var(--ide-text-3)',
                    margin: 0,
                    maxWidth: '78ch',
                  }}
                >
                  {proj.summary}
                </p>
              </button>
            );
          })}
        </IDECard>

        <div style={{ marginTop: 40 }}>
          <SectionLabel>Other projects</SectionLabel>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {portfolioData.otherProjects.map((proj) => {
              const external = proj.href.startsWith('http');
              const style = {
                fontSize: 16,
                fontFamily: vietnam,
                color: 'var(--ide-text-3)',
                textDecoration: 'none',
              } as const;

              return external ? (
                <a
                  key={proj.name}
                  href={proj.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:underline"
                  style={style}
                >
                  {proj.name}
                  <ExternalLink size={13} />
                </a>
              ) : (
                <Link
                  key={proj.name}
                  href={proj.href}
                  className="inline-flex items-center gap-1.5 hover:underline"
                  style={style}
                >
                  {proj.name}
                  <ArrowRight size={13} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}
