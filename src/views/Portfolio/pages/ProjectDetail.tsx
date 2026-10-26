'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink, Github, Package, PlayCircle } from 'lucide-react';
import { liveLabel } from '../data/links';
import { portfolioData, type ProjectShot } from '../data/portfolio';
import { mono, sans, serif } from '../constants/fonts';
import { body, eyebrow } from '../constants/type';
import {
  IDECard,
  Lightbox,
  LiveTag,
  Tape,
  PageHeader,
  ProjectImage,
  StatusLabel,
  TechLogo,
} from '../shared';

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

const chipStyle = {
  gap: 8,
  padding: '6px 12px',
  fontSize: 15,
} as const;

// Skills on this site link to their page; anything else is plain text
function BuiltWith({ stack }: { stack: string[] }) {
  return (
    <ul className="flex flex-wrap" style={{ gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
      {stack.map((name) => {
        const skill = portfolioData.skills.find((s) => s.name === name);
        return (
          <li key={name}>
            {skill ? (
              <Link href={`/skills/${skill.id}`} className="pf-btn" style={chipStyle}>
                <TechLogo id={skill.id} size={16} />
                {name}
              </Link>
            ) : (
              <span
                className="inline-flex items-center"
                style={{
                  ...chipStyle,
                  fontFamily: sans,
                  fontWeight: 700,
                  color: 'var(--ide-text-2)',
                  border: '1.5px dashed var(--ide-border-strong)',
                  borderRadius: 4,
                }}
              >
                {name}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      {text.split(/\n\s*\n/).map((paragraph) => (
        <p key={paragraph} style={body}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

// Wide screenshots take the full width. Tall ones sit three to a row, two when there
// are only two, and a single one is centered.
// On phones every shot takes the full width. Class names are written out in full so
// Tailwind can find them.
function shotColumn(shot: ProjectShot, tallCount: number) {
  if (shot.height <= shot.width) return 'col-span-6';
  if (tallCount === 1) return 'col-span-6 md:col-span-4 md:col-start-2';
  return tallCount >= 3 ? 'col-span-6 md:col-span-2' : 'col-span-6 md:col-span-3';
}

function Screenshot({ shot, onOpen }: { shot: ProjectShot; onOpen: () => void }) {
  return (
    <figure
      className="pf-card relative"
      style={{
        margin: 0,
        padding: 8,
        height: '100%',
        background: 'var(--ide-bg-3)',
        borderRadius: 3,
      }}
    >
      <Tape />
      <button
        onClick={onOpen}
        aria-label={`View full size: ${shot.alt}`}
        className="block w-full"
        style={{
          padding: 0,
          border: 'none',
          background: 'none',
          cursor: 'zoom-in',
          overflow: 'hidden',
        }}
      >
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
      </button>
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
  );
}

export function ProjectDetail({ id }: { id: string }) {
  const [openShot, setOpenShot] = useState<ProjectShot | null>(null);

  const project = portfolioData.projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center" style={{ gap: 12 }}>
        <div style={{ ...sectionHeading, margin: 0 }}>Project not found</div>
        <Link href="/projects" className="pf-link">
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
      className="flex flex-col px-4 pt-8 pb-16 md:px-8 md:pt-16 md:pb-24 @[880px]:flex-row @[880px]:items-start"
      style={{ gap: 48, maxWidth: 1096, margin: '0 auto' }}
    >
      <article className="min-w-0 flex-1" style={{ maxWidth: 720 }}>
        <Link href="/projects" className="pf-btn" style={{ marginBottom: 32 }}>
          <ArrowLeft size={15} />
          All projects
        </Link>

        <PageHeader
          eyebrow={
            <span className="inline-flex flex-wrap items-center" style={{ gap: 16 }}>
              {liveUrl && <LiveTag href={liveUrl} />}
              {project.language && <span>{project.language}</span>}
              <StatusLabel status={project.status} />
            </span>
          }
          title={project.name}
          subtitle={project.summary}
        />

        <section
          aria-labelledby="result"
          style={{
            position: 'relative',
            marginTop: 32,
            padding: '24px 24px 20px',
            background: 'var(--ide-note)',
            boxShadow: 'var(--ide-card-shadow)',
          }}
        >
          <Tape />
          <h2 id="result" style={{ ...eyebrow, fontSize: 13 }}>
            Result
          </h2>
          <p
            style={{
              fontFamily: sans,
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.6,
              color: 'var(--ide-text-1)',
              margin: '6px 0 0',
            }}
          >
            {project.result}
          </p>
        </section>

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
            <ProjectImage project={cover} sizes="(max-width: 900px) 100vw, 720px" priority />
          </div>
        )}

        <Section title="Built with">
          <BuiltWith stack={project.stack} />
        </Section>

        <Section title="The problem">
          <p style={body}>{project.problem}</p>
        </Section>

        <Section title="What I built">
          <p style={body}>{project.role}</p>
        </Section>

        {project.features && project.features.length > 0 && (
          <Section title="How it works">
            <BulletList items={project.features} />
          </Section>
        )}

        {project.decisions && project.decisions.length > 0 && (
          <Section title="Key decisions">
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

        {project.numbers && project.numbers.length > 0 && (
          <Section title="By the numbers">
            <BulletList items={project.numbers} />
          </Section>
        )}

        {project.hardPart && (
          <Section title="The hard part">
            <Paragraphs text={project.hardPart} />
          </Section>
        )}

        {project.learned && (
          <Section title="What I learned">
            <Paragraphs text={project.learned} />
          </Section>
        )}

        {project.limits && (
          <Section title="Limits">
            <p style={body}>{project.limits}</p>
          </Section>
        )}

        {screenshots.length > 0 && (
          <Section title="Gallery">
            <div
              className="grid"
              style={{ gap: 24, marginTop: 8, gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}
            >
              {screenshots.map((shot) => (
                <div key={shot.src} className={shotColumn(shot, tallCount)}>
                  <Screenshot shot={shot} onOpen={() => setOpenShot(shot)} />
                </div>
              ))}
            </div>
          </Section>
        )}
      </article>

      {(liveUrl || hasLinks || project.note) && (
        <aside className="w-full shrink-0 @[880px]:sticky @[880px]:w-[280px]" style={{ top: 32 }}>
          <IDECard tape style={{ padding: 24 }}>
            {liveUrl && (
              <Link
                href={liveUrl}
                {...(liveUrl.startsWith('http')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className="pf-btn-primary w-full"
              >
                <PlayCircle size={15} />
                Open live site
              </Link>
            )}
            {liveUrl && (
              <p
                style={{
                  fontFamily: sans,
                  fontSize: 14,
                  color: 'var(--ide-text-4)',
                  textAlign: 'center',
                  margin: '8px 0 0',
                  overflowWrap: 'anywhere',
                }}
              >
                {liveLabel(liveUrl)}
              </p>
            )}

            {hasLinks && (
              <ul
                className="flex flex-col"
                style={{
                  gap: 12,
                  margin: 0,
                  marginTop: liveUrl ? 16 : 0,
                  padding: 0,
                  listStyle: 'none',
                }}
              >
                {secondaryLinks.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pf-btn w-full"
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
      )}
      {openShot && <Lightbox shot={openShot} onClose={() => setOpenShot(null)} />}
    </div>
  );
}
