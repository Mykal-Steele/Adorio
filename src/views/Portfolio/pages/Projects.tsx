'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { body } from '../constants/type';
import { PageHeader, ProjectCard, SectionLabel } from '../shared';

export function Projects() {
  return (
    <div
      className="px-4 pt-8 pb-16 md:px-8 md:pt-16 md:pb-24"
      style={{ maxWidth: 1040, margin: '0 auto' }}
    >
      <PageHeader
        eyebrow={`${portfolioData.projects.length} projects`}
        title="Projects"
        subtitle="Things I've built, mostly backends and the setup around them."
      />

      <div
        className="grid grid-cols-1 gap-8 md:gap-10 @[640px]:grid-cols-2"
        style={{ marginTop: 48 }}
      >
        {portfolioData.projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} priority={index === 0} />
        ))}
      </div>

      <section className="mt-12 md:mt-16">
        <SectionLabel>Other projects</SectionLabel>
        <ul
          className="grid grid-cols-1 @[640px]:grid-cols-2"
          style={{ gap: '28px 40px', margin: 0, padding: 0, listStyle: 'none' }}
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
