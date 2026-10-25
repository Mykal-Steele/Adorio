'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { experienceForSkill, projectsForSkill } from '../data/skills';
import { useResponsive } from '../hooks/useResponsive';
import { sans, serif } from '../constants/fonts';
import { body, eyebrow } from '../constants/type';
import { ProjectImage, SectionLabel, TechLogo } from '../shared';

export function SkillDetail({ id }: { id: string }) {
  const { isMobile } = useResponsive();
  const skill = portfolioData.skills.find((s) => s.id === id);

  if (!skill) {
    return (
      <div className="flex h-full flex-col items-center justify-center" style={{ gap: 12 }}>
        <p style={{ ...body, fontWeight: 700 }}>No skill called {id}</p>
        <Link href="/" className="pf-link">
          <ArrowLeft size={16} />
          Back to about_me.md
        </Link>
      </div>
    );
  }

  const projects = projectsForSkill(skill);
  const roles = [...new Set(experienceForSkill(skill).map((m) => m.role))];
  const story = skill.story.split(/\n\s*\n/).filter(Boolean);

  return (
    <div
      className={isMobile ? 'px-4 pt-10 pb-20' : 'px-10 pt-16 pb-28'}
      style={{ maxWidth: 760, margin: '0 auto' }}
    >
      <header className="flex items-center" style={{ gap: 20 }}>
        <span
          className="grid shrink-0 place-items-center"
          style={{
            width: 80,
            height: 80,
            background: 'var(--ide-bg-3)',
            borderRadius: 16,
            boxShadow: 'var(--ide-card-shadow)',
          }}
        >
          <TechLogo id={skill.id} size={44} />
        </span>
        <div>
          <p style={eyebrow}>{skill.group}</p>
          <h1
            style={{
              fontFamily: serif,
              fontSize: 'clamp(38px, 5vw, 52px)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--ide-text-1)',
              margin: '4px 0 0',
            }}
          >
            {skill.name}
          </h1>
        </div>
      </header>

      {story.length > 0 && (
        <section className="flex flex-col" style={{ gap: 16, marginTop: 48 }}>
          {story.map((paragraph) => (
            <p key={paragraph} style={body}>
              {paragraph}
            </p>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginTop: 64 }}>
          <SectionLabel>Projects</SectionLabel>
          <ul
            className="grid"
            style={{
              gap: 24,
              margin: 0,
              padding: 0,
              listStyle: 'none',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            }}
          >
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="pf-card block"
                  style={{ padding: 8, background: 'var(--ide-bg-3)', borderRadius: 3 }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <ProjectImage project={project} sizes="(max-width: 900px) 100vw, 340px" />
                  </div>
                  <span
                    style={{
                      display: 'block',
                      padding: '12px 6px 4px',
                      fontFamily: serif,
                      fontSize: 20,
                      fontWeight: 700,
                      color: 'var(--ide-text-1)',
                    }}
                  >
                    {project.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {roles.length > 0 && (
        <section style={{ marginTop: 64 }}>
          <SectionLabel>At work</SectionLabel>
          <ul
            className="flex flex-wrap"
            style={{ gap: 12, margin: 0, padding: 0, listStyle: 'none' }}
          >
            {roles.map((role) => (
              <li key={role}>
                <Link href="/" className="pf-btn">
                  {role}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
