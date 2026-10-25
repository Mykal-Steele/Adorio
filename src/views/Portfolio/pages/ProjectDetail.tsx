'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, ExternalLink, Github, Package, PlayCircle } from 'lucide-react';
import { portfolioData, type ProjectShot } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { mono, sans, serif } from '../constants/fonts';
import {
  body,
  buttonHover,
  eyebrow,
  linkHover,
  primaryButton,
  secondaryButton,
  textLink,
} from '../constants/type';
import { skillsForProject } from '../data/skills';
import { IDECard, LogoTile, PageHeader, ProjectImage, StatusLabel } from '../shared';

const sectionHeading = {
  fontFamily: serif,
  fontSize: 24,
  fontWeight: 700,
  lineHeight: 1.25,
  color: 'var(--ide-text-1)',
  margin: '0 0 12px',
} as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 48 }}>
      <h2 style={sectionHeading}>{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col" style={{ gap: 8, margin: 0, paddingLeft: 20, listStyle: 'disc' }}>
      {items.map((item) => (
        <li key={item} style={body}>
          {item}
        </li>
      ))}
    </ul>
  );
}

// Wide screenshots take the full width. Tall ones sit three to a row, two when there
// are only two, and a single one is centered.
function shotColumn(shot: ProjectShot, tallCount: number) {
  if (shot.height <= shot.width) return 'span 6';
  if (tallCount === 1) return '2 / span 4';
  return tallCount >= 3 ? 'span 2' : 'span 3';
}

function Screenshot({ shot }: { shot: ProjectShot }) {
  return (
    <IDECard tape style={{ margin: 0, padding: 8, height: '100%' }}>
      <figure style={{ margin: 0 }}>
        <Image
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          sizes="(max-width: 900px) 100vw, 720px"
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            border: '1px solid var(--ide-border)',
          }}
        />
        <figcaption
          style={{
            padding: '12px 8px 4px',
            fontFamily: sans,
            fontSize: 15,
            lineHeight: 1.55,
            color: 'var(--ide-text-4)',
          }}
        >
          {shot.caption}
        </figcaption>
      </figure>
    </IDECard>
  );
}

export function ProjectDetail({ id }: { id: string }) {
  const { isMobile } = useResponsive();

  const project = portfolioData.projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center" style={{ gap: 12 }}>
        <div style={{ ...sectionHeading, margin: 0 }}>Project not found</div>
        <Link href="/projects" className={linkHover} style={textLink}>
          <ArrowLeft size={16} />
          Back to projects
        </Link>
      </div>
    );
  }

  const { liveUrl } = project;
  const screenshots = project.screenshots ?? [];
  const cover =
    project.image && !screenshots.some((shot) => shot.src === project.image?.src) ? project : null;
  const builtWith = skillsForProject(project);
  const tallCount = screenshots.filter((shot) => shot.height > shot.width).length;
  const hasLinks = Boolean(project.repoUrl || project.npm || project.links?.length);
  const secondaryLinks = [
    ...(project.repoUrl
      ? [{ href: `https://${project.repoUrl}`, label: 'Source', icon: Github }]
      : []),
    ...(project.npm
      ? [{ href: `https://${project.npm}`, label: 'npm package', icon: Package }]
      : []),
    ...(project.links ?? []).map((link) => ({ ...link, icon: ExternalLink })),
  ];

  return (
    <div
      className={`flex ${isMobile ? 'flex-col px-4 pt-8 pb-16' : 'items-start px-8 pt-16 pb-24'}`}
      style={{ gap: 48, maxWidth: 1096, margin: '0 auto' }}
    >
      <article className="min-w-0 flex-1" style={{ maxWidth: 720 }}>
        <PageHeader
          eyebrow={
            <span className="inline-flex flex-wrap items-center" style={{ gap: 16 }}>
              {project.language && <span>{project.language}</span>}
              <StatusLabel status={project.status} />
            </span>
          }
          title={project.name}
          subtitle={project.summary}
        />

        {builtWith.length > 0 && (
          <div className="flex flex-wrap" style={{ gap: 10, marginTop: 24 }}>
            {builtWith.map((skill) => (
              <LogoTile
                key={skill.id}
                id={skill.id}
                name={skill.name}
                href={`/skills/${skill.id}`}
              />
            ))}
          </div>
        )}

        {cover && (
          <div
            style={{
              position: 'relative',
              marginTop: 40,
              padding: 10,
              background: 'var(--ide-bg-3)',
              boxShadow: 'var(--ide-card-shadow)',
            }}
          >
            <ProjectImage project={cover} sizes="(max-width: 900px) 100vw, 720px" />
          </div>
        )}

        {project.requiresAccount && (
          <p
            style={{
              ...body,
              fontSize: 15,
              color: 'var(--ide-text-4)',
              marginTop: 16,
              paddingLeft: 12,
              borderLeft: '2px solid var(--ide-yellow)',
            }}
          >
            This project needs an account to open. Ask me for a demo account if you want to try it.
          </p>
        )}

        {project.problem && (
          <Section title="The problem">
            <p style={body}>{project.problem}</p>
          </Section>
        )}

        {project.role && (
          <Section title="My role">
            <p style={body}>{project.role}</p>
          </Section>
        )}

        {project.decisions && project.decisions.length > 0 && (
          <Section title="Decisions">
            <ol
              className="flex flex-col"
              style={{ gap: 24, margin: 0, padding: 0, listStyle: 'none' }}
            >
              {project.decisions.map((decision, i) => (
                <li key={decision.title} className="flex items-baseline" style={{ gap: 16 }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--ide-text-5)',
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3
                      style={{
                        fontFamily: sans,
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'var(--ide-text-1)',
                        margin: '0 0 4px',
                      }}
                    >
                      {decision.title}
                    </h3>
                    <p style={body}>{decision.reason}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {project.changes && project.changes.length > 0 && (
          <Section title="What changed">
            <BulletList items={project.changes} />
          </Section>
        )}

        {project.numbers && project.numbers.length > 0 && (
          <Section title="Numbers">
            <BulletList items={project.numbers} />
          </Section>
        )}

        {screenshots.length > 0 && (
          <Section title="Gallery">
            <div
              className="grid"
              style={{ gap: 24, marginTop: 8, gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}
            >
              {screenshots.map((shot) => (
                <div
                  key={shot.src}
                  style={{ gridColumn: isMobile ? 'span 6' : shotColumn(shot, tallCount) }}
                >
                  <Screenshot shot={shot} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {project.tags.length > 0 && (
          <p style={{ ...body, fontSize: 15, color: 'var(--ide-text-5)', marginTop: 48 }}>
            {project.tags.join('  ')}
          </p>
        )}
      </article>

      <aside
        className="shrink-0"
        style={{
          width: isMobile ? '100%' : 280,
          position: isMobile ? 'static' : 'sticky',
          top: 32,
        }}
      >
        <IDECard tape style={{ padding: 24 }}>
          <p style={{ ...eyebrow, marginBottom: 16 }}>At a glance</p>

          <dl className="flex flex-col" style={{ gap: 12, margin: 0 }}>
            <div className="flex items-center justify-between" style={{ gap: 12 }}>
              <dt style={{ fontFamily: sans, fontSize: 15, color: 'var(--ide-text-4)' }}>Status</dt>
              <dd style={{ margin: 0 }}>
                <StatusLabel status={project.status} />
              </dd>
            </div>
            {project.stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between" style={{ gap: 12 }}>
                <dt style={{ fontFamily: sans, fontSize: 15, color: 'var(--ide-text-4)' }}>
                  {s.label}
                </dt>
                <dd
                  style={{
                    margin: 0,
                    fontFamily: sans,
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--ide-text-2)',
                    textAlign: 'right',
                  }}
                >
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          {liveUrl && (
            <Link
              href={liveUrl}
              {...(liveUrl.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="w-full transition-transform duration-150 hover:-translate-y-px active:scale-[0.97]"
              style={{ ...primaryButton, marginTop: 24 }}
            >
              <PlayCircle size={15} />
              Open live
            </Link>
          )}

          {hasLinks && (
            <ul
              className="flex flex-col"
              style={{
                gap: 12,
                margin: 0,
                marginTop: 24,
                paddingTop: 20,
                listStyle: 'none',
                borderTop: '1px solid var(--ide-border)',
              }}
            >
              {secondaryLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full ${buttonHover}`}
                    style={secondaryButton}
                  >
                    <Icon size={15} />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {project.note && (
            <p
              style={{
                fontFamily: sans,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--ide-text-5)',
                margin: '16px 0 0',
              }}
            >
              {project.note}
            </p>
          )}
        </IDECard>
      </aside>
    </div>
  );
}
