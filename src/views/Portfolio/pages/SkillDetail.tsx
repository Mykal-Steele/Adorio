'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { experienceForSkill, projectsForSkill } from '../data/skills';
import { useResponsive } from '../hooks/useResponsive';
import { sans, serif } from '../constants/fonts';
import { body, eyebrow, linkHover, textLink } from '../constants/type';
import { FileIcon, SectionLabel, TechLogo } from '../shared';

export function SkillDetail({ id }: { id: string }) {
  const { isMobile } = useResponsive();
  const skill = portfolioData.skills.find((s) => s.id === id);

  if (!skill) {
    return (
      <div className="flex h-full flex-col items-center justify-center" style={{ gap: 12 }}>
        <p style={{ ...body, fontWeight: 700 }}>No skill called {id}</p>
        <Link href="/" className={linkHover} style={textLink}>
          <ArrowLeft size={16} />
          Back to about_me.md
        </Link>
      </div>
    );
  }

  const projects = projectsForSkill(skill);
  const mentions = experienceForSkill(skill);
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
            className="flex flex-col"
            style={{ gap: 12, margin: 0, padding: 0, listStyle: 'none' }}
          >
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="group flex items-start transition-shadow duration-200 [box-shadow:var(--ide-card-shadow)] hover:[box-shadow:var(--ide-card-shadow-hover)]"
                  style={{
                    gap: 16,
                    padding: '16px 20px',
                    background: 'var(--ide-bg-3)',
                    borderRadius: 3,
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ marginTop: 5 }}>
                    <FileIcon path={`/projects/${project.id}`} />
                  </span>
                  <span>
                    <span
                      className="group-hover:underline underline-offset-4"
                      style={{
                        display: 'block',
                        fontFamily: serif,
                        fontSize: 20,
                        fontWeight: 700,
                        color: 'var(--ide-text-1)',
                      }}
                    >
                      {project.name}
                    </span>
                    <span style={{ ...body, display: 'block', fontSize: 15, marginTop: 2 }}>
                      {project.summary}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {mentions.length > 0 && (
        <section style={{ marginTop: 64 }}>
          <SectionLabel>At work</SectionLabel>
          <ul
            className="flex flex-col"
            style={{ gap: 20, margin: 0, padding: 0, listStyle: 'none' }}
          >
            {mentions.map(({ role, org, highlight }) => (
              <li key={highlight}>
                <p style={{ ...body, fontSize: 16 }}>{highlight}</p>
                <p
                  style={{
                    fontFamily: sans,
                    fontSize: 14,
                    color: 'var(--ide-text-5)',
                    margin: '4px 0 0',
                  }}
                >
                  {role}, {org}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
