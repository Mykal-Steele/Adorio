'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { mono, vietnam } from '../constants/fonts';
import { Breadcrumb, PageHeader, ProjectCard, SectionLabel } from '../shared';

export function Projects() {
  const { isMobile } = useResponsive();

  return (
    <div className="min-h-full">
      <Breadcrumb segments={['src', 'projects.json']} language="JSON" />

      <div className={isMobile ? 'px-5 py-7' : 'px-8 py-9'}>
        <PageHeader
          title="Projects"
          subtitle="Backend services, tools, and the systems that keep them running."
        />

        <div
          className="grid gap-5"
          style={{
            marginTop: 36,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          }}
        >
          {portfolioData.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div style={{ marginTop: 56 }}>
          <SectionLabel>Other projects</SectionLabel>
          <div className="flex flex-wrap gap-3">
            {portfolioData.otherProjects.map((project) => {
              const external = project.href.startsWith('http');
              const style = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 11px',
                fontSize: 14,
                fontFamily: vietnam,
                color: 'var(--ide-text-2)',
                textDecoration: 'none',
                background: 'var(--ide-bg-0)',
                border: '2px solid var(--nb-border)',
                boxShadow: '2px 2px 0 var(--nb-shadow)',
              } as const;

              return external ? (
                <a
                  key={project.name}
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                  style={style}
                >
                  {project.name}
                  <ExternalLink size={13} />
                </a>
              ) : (
                <Link key={project.name} href={project.href} style={style}>
                  {project.name}
                  <ArrowRight size={13} />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2" style={{ marginTop: 28 }}>
          <span
            style={{
              width: 8,
              height: 8,
              background: 'var(--nb-accent)',
              border: '1.5px solid var(--nb-border)',
            }}
          />
          <span
            style={{
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ide-text-4)',
            }}
          >
            {portfolioData.projects.length} projects · open a card for the full case study
          </span>
        </div>
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}
