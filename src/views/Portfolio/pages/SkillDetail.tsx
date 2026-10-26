'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { experienceForSkill, projectsForSkill } from '../data/skills';
import { sans, serif } from '../constants/fonts';
import { body, eyebrow } from '../constants/type';
import { ProjectImage, SectionLabel, TechLogo } from '../shared';

export function SkillDetail({ id }: { id: string }) {
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
      className="px-4 pt-10 pb-20 md:px-10 md:pt-16 md:pb-28"
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

      {skill.setup && (
        <section style={{ marginTop: 64 }}>
          <SectionLabel>My setup</SectionLabel>
          <div
            className="flex flex-col p-5 md:p-7"
            style={{
              gap: 32,
              background: 'var(--ide-bg-3)',
              borderRadius: 3,
              boxShadow: 'var(--ide-card-shadow)',
            }}
          >
            {skill.setup.map(({ group, items }) => (
              <div key={group}>
                <h3
                  style={{
                    fontFamily: serif,
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--ide-text-1)',
                    margin: '0 0 12px',
                  }}
                >
                  {group}
                </h3>
                <dl className="flex flex-col" style={{ gap: 10, margin: 0 }}>
                  {items.map(({ label, value }) => (
                    <div
                      key={label}
                      className="grid grid-cols-1 items-baseline gap-0.5 @[640px]:grid-cols-[140px_1fr] @[640px]:gap-4"
                    >
                      <dt style={{ ...eyebrow, fontSize: 15 }}>{label}</dt>
                      <dd style={{ ...body, margin: 0 }}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginTop: 64 }}>
          <SectionLabel>Projects</SectionLabel>
          <ul
            className="grid grid-cols-1 @[640px]:grid-cols-2"
            style={{ gap: 24, margin: 0, padding: 0, listStyle: 'none' }}
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
