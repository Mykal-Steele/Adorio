'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { useContentWidth } from '../hooks/useContentWidth';
import { body } from '../constants/type';
import { PageHeader, ProjectCard, SectionLabel } from '../shared';

export function Projects() {
  const { isMobile } = useResponsive();
  const oneColumn = useContentWidth() < 640;

  return (
    <div
      className={isMobile ? 'px-4 pt-8 pb-16' : 'px-8 pt-16 pb-24'}
      style={{ maxWidth: 1040, margin: '0 auto' }}
    >
      <PageHeader
        eyebrow={`${portfolioData.projects.length} projects · open a card for the full case study`}
        title="Projects"
        subtitle="Backend services, tools, and the systems that keep them running."
      />

      <div
        className="grid"
        style={{
          gap: isMobile ? 32 : 40,
          marginTop: 48,
          gridTemplateColumns: oneColumn ? '1fr' : 'repeat(2, 1fr)',
        }}
      >
        {portfolioData.projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <section style={{ marginTop: isMobile ? 48 : 64 }}>
        <SectionLabel>Other projects</SectionLabel>
        <ul
          className="grid"
          style={{
            gap: '28px 40px',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            gridTemplateColumns: oneColumn ? '1fr' : 'repeat(2, 1fr)',
          }}
        >
          {portfolioData.otherProjects.map((project) => (
            <li key={project.name} className="flex flex-col items-start" style={{ gap: 10 }}>
              {project.href.startsWith('http') ? (
                <a href={project.href} target="_blank" rel="noopener noreferrer" className="pf-btn">
                  {project.name}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <Link href={project.href} className="pf-btn">
                  {project.name}
                  <ArrowRight size={14} />
                </Link>
              )}
              <p style={{ ...body, fontSize: 16 }}>{project.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
