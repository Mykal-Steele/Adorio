'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { textLink } from '../constants/type';
import { PageHeader, ProjectCard, SectionLabel } from '../shared';

export function Projects() {
  const { isMobile } = useResponsive();

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
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        }}
      >
        {portfolioData.projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <section style={{ marginTop: isMobile ? 48 : 64 }}>
        <SectionLabel>Other projects</SectionLabel>
        <ul
          className="flex flex-wrap"
          style={{ gap: '12px 32px', margin: 0, padding: 0, listStyle: 'none' }}
        >
          {portfolioData.otherProjects.map((project) => (
            <li key={project.name}>
              {project.href.startsWith('http') ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline underline-offset-4"
                  style={textLink}
                >
                  {project.name}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <Link
                  href={project.href}
                  className="hover:underline underline-offset-4"
                  style={textLink}
                >
                  {project.name}
                  <ArrowRight size={14} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
