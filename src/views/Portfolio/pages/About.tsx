'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Download, Github, Linkedin, Mail } from 'lucide-react';
import { portfolioData, type Project, type SkillGroup } from '../data/portfolio';
import { skillsForProject } from '../data/skills';
import { useResponsive } from '../hooks/useResponsive';
import { useContentWidth } from '../hooks/useContentWidth';
import { sans, serif } from '../constants/fonts';
import { body, eyebrow, preview } from '../constants/type';
import { LiveTag, LogoTile, ProjectImage, SectionLabel, StatusLabel, Tape } from '../shared';

const FEATURED_IDS = ['chronochunk', 'coding-challenges', 'create-adorex'];
const SKILL_GROUPS: SkillGroup[] = ['Languages', 'Web & Backend', 'Databases', 'Tools & Infra'];

const links = [
  { label: 'GitHub', href: `https://${portfolioData.github}`, icon: Github, external: true },
  { label: 'LinkedIn', href: `https://${portfolioData.linkedin}`, icon: Linkedin, external: true },
  { label: 'Email', href: `mailto:${portfolioData.email}`, icon: Mail, external: false },
];

const facts = [
  { label: 'Looking for', value: 'A software engineering internship' },
  { label: 'Studying', value: 'Computer Science, year 3, KMUTT' },
  { label: 'Graduating', value: '2028' },
  { label: 'Based in', value: `${portfolioData.location} (${portfolioData.timezone})` },
];

// What a recruiter should take away in one pass; each line links to the full write-up
const proof = [
  {
    id: 'adorio',
    text: ', the site you are on. I run it on Azure with automatic deploys and a backup copy that takes over if Azure goes down.',
  },
  {
    id: 'smartcity-financial',
    text: ', the payment backend for a class-wide project, which I led.',
  },
  {
    id: 'nfc-attendance',
    text: ', a tap-to-check-in system that took 2nd place at the KMUTT IoT Hackathon.',
  },
  {
    id: 'create-adorex',
    text: ', an npm starter that cut new-project setup from about 2 hours to 20 minutes and became a class template.',
  },
  {
    id: 'chronochunk',
    text: ', a Discord bot classmates use to ask questions about course material.',
  },
];

const BADGES: Record<string, { src: string; href?: string }> = {
  MSA: { src: '/community/msa-badge.png' },
  GDG: { src: '/community/gdg-badge.svg', href: `https://${portfolioData.googleDev}` },
};

// Sections share one background; a ruled line marks where each new one starts
function Band({
  first = false,
  isMobile,
  children,
}: {
  first?: boolean;
  isMobile: boolean;
  children: ReactNode;
}) {
  return (
    <section style={{ padding: isMobile ? '0 16px' : '0 40px' }}>
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: first
            ? isMobile
              ? '40px 0 56px'
              : '64px 0 80px'
            : isMobile
              ? '48px 0'
              : '72px 0',
          borderTop: first ? 'none' : '1.5px solid var(--ide-border-strong)',
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Hero({ isMobile }: { isMobile: boolean }) {
  return (
    <header
      className="grid items-start"
      style={{ gap: isMobile ? 40 : 56, gridTemplateColumns: isMobile ? '1fr' : '1fr 280px' }}
    >
      <div>
        <h1
          style={{
            fontFamily: serif,
            fontSize: 'clamp(48px, 7vw, 76px)',
            fontWeight: 700,
            lineHeight: 0.98,
            letterSpacing: '-0.03em',
            color: 'var(--ide-text-1)',
            margin: 0,
          }}
        >
          Oakar Oo
        </h1>
        <p
          style={{
            fontFamily: serif,
            fontSize: 'clamp(24px, 3vw, 30px)',
            fontWeight: 500,
            color: 'var(--ide-text-2)',
            margin: '12px 0 0',
          }}
        >
          Backend developer
        </p>
        <p style={{ ...body, fontSize: 19, marginTop: 20, maxWidth: '40ch' }}>
          I build backends and the setup that keeps them running: APIs, databases, deployment, and
          developer experience.
        </p>

        <div className="flex flex-wrap items-center" style={{ gap: 12, marginTop: 32 }}>
          <a href="/resume" download="Oakar-Oo-Resume.pdf" className="pf-btn-primary">
            <Download size={15} />
            Resume
          </a>
          {links.map(({ label, href, icon: Icon, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="pf-btn"
            >
              <Icon size={16} />
              {label}
            </a>
          ))}
        </div>
      </div>

      <aside
        className="pf-note"
        style={
          {
            '--tilt': isMobile ? '-1deg' : '2deg',
            position: 'relative',
            padding: '28px 24px 24px',
            background: 'var(--ide-note)',
            boxShadow: 'var(--ide-card-shadow)',
            marginTop: isMobile ? 0 : 96,
            maxWidth: isMobile ? 360 : undefined,
          } as CSSProperties
        }
      >
        <Tape />
        <dl className="flex flex-col" style={{ gap: 14, margin: 0 }}>
          {facts.map(({ label, value }) => (
            <div key={label}>
              <dt style={{ ...eyebrow, fontSize: 13 }}>{label}</dt>
              <dd
                style={{
                  margin: '2px 0 0',
                  fontFamily: sans,
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--ide-text-1)',
                }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </aside>
    </header>
  );
}

function FeaturedProject({
  project,
  flip,
  isMobile,
  priority = false,
}: {
  project: Project;
  flip: boolean;
  isMobile: boolean;
  priority?: boolean;
}) {
  const href = `/projects/${project.id}`;
  const builtWith = skillsForProject(project);
  return (
    <article
      className="grid items-center"
      style={{
        gap: isMobile ? 24 : 48,
        gridTemplateColumns: isMobile ? '1fr' : flip ? '5fr 6fr' : '6fr 5fr',
      }}
    >
      <Link
        href={href}
        aria-label={project.name}
        className="pf-print relative block"
        style={
          {
            '--tilt': `${flip ? 1.2 : -1.2}deg`,
            order: !isMobile && flip ? 2 : 0,
            padding: 10,
            background: 'var(--ide-bg-3)',
          } as CSSProperties
        }
      >
        <Tape />
        <ProjectImage
          project={project}
          sizes="(max-width: 900px) 100vw, 520px"
          priority={priority}
        />
      </Link>

      <div>
        <div className="flex flex-wrap items-center" style={{ gap: 12 }}>
          {project.liveUrl && <LiveTag />}
          {project.language && <span style={eyebrow}>{project.language}</span>}
          <StatusLabel status={project.status} />
        </div>
        <h3
          style={{
            fontFamily: serif,
            fontSize: isMobile ? 24 : 30,
            fontWeight: 700,
            lineHeight: 1.1,
            color: 'var(--ide-text-1)',
            margin: '8px 0 12px',
            textWrap: 'balance',
          }}
        >
          <Link href={href} style={{ color: 'inherit', textDecoration: 'none' }}>
            {project.name}
          </Link>
        </h3>
        <p style={body}>{preview(project.summary)}</p>
        {builtWith.length > 0 && (
          <div className="flex flex-wrap" style={{ gap: 8, marginTop: 16 }}>
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
        <Link href={href} className="pf-btn" style={{ marginTop: 20 }}>
          Read the case study
        </Link>
      </div>
    </article>
  );
}

function ExperienceProject({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="pf-card block self-start"
      style={{ maxWidth: 260, padding: 8, background: 'var(--ide-bg-0)', borderRadius: 3 }}
    >
      <div style={{ overflow: 'hidden' }}>
        <ProjectImage project={project} sizes="220px" />
      </div>
      <span
        style={{
          display: 'block',
          padding: '10px 4px 2px',
          fontFamily: sans,
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--ide-text-1)',
        }}
      >
        {project.name}
      </span>
    </Link>
  );
}

function Experience({ isMobile }: { isMobile: boolean }) {
  const last = portfolioData.experience.length - 1;
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {portfolioData.experience.map((exp, i) => {
        const project = portfolioData.projects.find((p) => p.id === exp.projectId);
        return (
          <li
            key={exp.org}
            className="grid"
            style={{
              gridTemplateColumns: isMobile ? '20px 1fr' : '148px 20px 1fr',
              columnGap: isMobile ? 12 : 16,
              paddingBottom: i < last ? 32 : 0,
            }}
          >
            {!isMobile && (
              <div
                style={{
                  ...eyebrow,
                  paddingTop: 24,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {exp.period}
              </div>
            )}
            <div className="relative flex justify-center">
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: i === 0 ? 28 : 0,
                  bottom: i === last ? 'auto' : -32,
                  height: i === last ? 28 : 'auto',
                  width: 2,
                  background: 'var(--ide-border-strong)',
                }}
              />
              <span
                aria-hidden="true"
                style={{
                  position: 'relative',
                  marginTop: 24,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: i === 0 ? 'var(--ide-yellow)' : 'var(--ide-bg-3)',
                  border: '2px solid var(--ide-text-3)',
                }}
              />
            </div>
            <article
              className="grid"
              style={{
                gap: 20,
                gridTemplateColumns: project && !isMobile ? '1fr 200px' : '1fr',
                padding: isMobile ? 20 : 24,
                background: 'var(--ide-bg-3)',
                borderRadius: 3,
                boxShadow: 'var(--ide-card-shadow)',
              }}
            >
              <div>
                {isMobile && <div style={{ ...eyebrow, marginBottom: 6 }}>{exp.period}</div>}
                <h3
                  style={{
                    fontFamily: serif,
                    fontSize: 23,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: 'var(--ide-text-1)',
                    margin: 0,
                  }}
                >
                  {exp.role}
                </h3>
                <p
                  style={{
                    fontFamily: sans,
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--ide-text-3)',
                    margin: '4px 0 0',
                  }}
                >
                  {exp.org}
                </p>
                {exp.highlights.length > 0 && (
                  <ul
                    className="flex flex-col marker:text-[var(--ide-text-5)]"
                    style={{ gap: 8, margin: '16px 0 0', paddingLeft: 20, listStyle: 'disc' }}
                  >
                    {exp.highlights.map((highlight) => (
                      <li key={highlight} style={{ ...body, fontSize: 16 }}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {project && <ExperienceProject project={project} />}
            </article>
          </li>
        );
      })}
    </ol>
  );
}

function TechSheet({ isMobile }: { isMobile: boolean }) {
  const rows = [
    ...SKILL_GROUPS.map((group) => ({
      label: group,
      items: portfolioData.skills
        .filter((s) => s.group === group)
        .map((s) => ({ id: s.id, name: s.name, href: `/skills/${s.id}` })),
    })),
    { label: 'Setup', items: portfolioData.setup.map((s) => ({ ...s, href: undefined })) },
  ];

  return (
    <div
      style={{
        padding: isMobile ? 20 : 28,
        background: 'var(--ide-bg-3)',
        borderRadius: 3,
        boxShadow: 'var(--ide-card-shadow)',
      }}
    >
      <dl className="flex flex-col" style={{ gap: 20, margin: 0 }}>
        {rows.map(({ label, items }) => (
          <div
            key={label}
            className="grid items-center"
            style={{ gridTemplateColumns: isMobile ? '1fr' : '132px 1fr', gap: isMobile ? 8 : 16 }}
          >
            <dt
              style={{
                fontFamily: sans,
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--ide-text-2)',
              }}
            >
              {label}
            </dt>
            <dd className="flex flex-wrap" style={{ gap: 10, margin: 0 }}>
              {items.map((item) => (
                <LogoTile key={item.id} id={item.id} name={item.name} href={item.href} />
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <p
        style={{
          fontFamily: sans,
          fontSize: 14,
          color: 'var(--ide-text-5)',
          margin: '24px 0 0',
          paddingTop: 16,
          borderTop: '1px solid var(--ide-border)',
        }}
      >
        {isMobile
          ? 'Tap a logo to see where I used it.'
          : 'Hover a logo for its name. Click one to see where I used it.'}
      </p>
    </div>
  );
}

function CareerLog({ isMobile }: { isMobile: boolean }) {
  const margin = isMobile ? 64 : 112;
  return (
    <div
      style={{
        padding: '32px 24px 0 0',
        background: 'var(--ide-bg-3)',
        borderRadius: 3,
        boxShadow: 'var(--ide-card-shadow)',
        backgroundImage: `linear-gradient(to right, transparent ${margin - 2}px, var(--ide-margin-line) ${margin - 2}px, var(--ide-margin-line) ${margin}px, transparent ${margin}px), repeating-linear-gradient(to bottom, transparent 0 31px, var(--ide-border) 31px 32px)`,
        backgroundPosition: '0 0, 0 32px',
      }}
    >
      {portfolioData.timeline.map((item) => (
        <section
          key={item.year}
          className="grid"
          style={{ gridTemplateColumns: `${margin}px 1fr`, columnGap: isMobile ? 12 : 24 }}
        >
          <h3
            style={{
              fontFamily: serif,
              fontSize: isMobile ? 20 : 26,
              fontWeight: 700,
              lineHeight: '32px',
              color: 'var(--ide-text-1)',
              margin: 0,
              paddingRight: isMobile ? 10 : 18,
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {item.year}
          </h3>
          <ul style={{ margin: '0 0 32px', padding: 0, listStyle: 'none' }}>
            {item.events.map((event) => (
              <li
                key={event}
                style={{
                  fontFamily: sans,
                  fontSize: 16,
                  lineHeight: '32px',
                  color: 'var(--ide-text-2)',
                }}
              >
                {event}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Community({ isMobile }: { isMobile: boolean }) {
  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    padding: 20,
    background: 'var(--ide-bg-3)',
    borderRadius: 3,
    textDecoration: 'none',
  } as const;

  return (
    <ul
      className="grid"
      style={{
        gap: 24,
        margin: 0,
        padding: 0,
        listStyle: 'none',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      }}
    >
      {portfolioData.community.map((community) => {
        const badge = BADGES[community.short];
        const content = (
          <>
            {badge && (
              <Image
                src={badge.src}
                alt=""
                width={88}
                height={88}
                style={{ width: 88, height: 88, objectFit: 'contain', flexShrink: 0 }}
              />
            )}
            <span>
              <span
                style={{
                  display: 'block',
                  fontFamily: serif,
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--ide-text-1)',
                }}
              >
                {community.name}
              </span>
              <span style={{ ...eyebrow, display: 'block', marginTop: 4 }}>
                Since {community.since}
              </span>
              <span
                style={{
                  ...body,
                  display: 'block',
                  fontSize: 15,
                  lineHeight: 1.55,
                  marginTop: 6,
                }}
              >
                {community.detail}
              </span>
            </span>
          </>
        );
        return (
          <li key={community.short}>
            {badge?.href ? (
              <a
                href={badge.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-card"
                style={cardStyle}
              >
                {content}
              </a>
            ) : (
              <div style={{ ...cardStyle, boxShadow: 'var(--ide-card-shadow)' }}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function About() {
  const { isMobile } = useResponsive();
  const stacked = useContentWidth() < 880;
  const featured = FEATURED_IDS.map((id) =>
    portfolioData.projects.find((project) => project.id === id),
  ).filter((project): project is Project => Boolean(project));

  return (
    <div>
      <Band first isMobile={isMobile}>
        <Hero isMobile={stacked} />
      </Band>

      <Band isMobile={isMobile}>
        <SectionLabel>Featured projects</SectionLabel>
        <div className="flex flex-col" style={{ gap: isMobile ? 56 : 80, marginTop: 40 }}>
          {featured.map((project, i) => (
            <FeaturedProject
              key={project.id}
              project={project}
              flip={i % 2 === 1}
              priority={i === 0}
              isMobile={stacked}
            />
          ))}
        </div>
        <Link href="/projects" className="pf-btn" style={{ marginTop: 56 }}>
          See all {portfolioData.projects.length} projects
        </Link>
      </Band>

      <Band isMobile={isMobile}>
        <div style={{ maxWidth: 720 }}>
          <SectionLabel>About me</SectionLabel>
          <div className="flex flex-col" style={{ gap: 16 }}>
            <p style={body}>
              Most of my work is on the server side. I mainly use TypeScript with Express or Hono,
              Prisma with PostgreSQL or SQLite, and Docker on Azure behind Nginx and Cloudflare,
              with React and Next.js when a project needs a frontend.
            </p>
            <p style={body}>
              I got into programming at 15 through online HTML classes and Scratch, then spent a few
              years on games and small Python bots. At KMUTT I moved to backend work, and most of
              what I know now comes from building things other people use:
            </p>
            <ul
              className="flex flex-col marker:text-[var(--ide-text-5)]"
              style={{ gap: 10, margin: 0, paddingLeft: 20, listStyle: 'disc' }}
            >
              {proof.map(({ id, text }) => (
                <li key={id} style={body}>
                  <Link href={`/projects/${id}`} className="pf-link" style={{ fontSize: 17 }}>
                    {portfolioData.projects.find((p) => p.id === id)?.name}
                  </Link>
                  {text}
                </li>
              ))}
            </ul>
            <p style={body}>Outside of code: learning Korean and working out.</p>
          </div>
        </div>
      </Band>

      <Band isMobile={isMobile}>
        <SectionLabel>Experience</SectionLabel>
        <Experience isMobile={stacked} />
      </Band>

      <Band isMobile={isMobile}>
        <SectionLabel>Tech stack</SectionLabel>
        <TechSheet isMobile={stacked} />
      </Band>

      <Band isMobile={isMobile}>
        <SectionLabel>Career log</SectionLabel>
        <CareerLog isMobile={stacked} />
      </Band>

      <Band isMobile={isMobile}>
        <SectionLabel>Community</SectionLabel>
        <Community isMobile={stacked} />
      </Band>

      <Band isMobile={isMobile}>
        <SectionLabel>Certificates</SectionLabel>
        <ul className="flex flex-col" style={{ gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
          {portfolioData.certificates.map((cert) => (
            <li key={cert.name}>
              <a
                href={`https://${portfolioData.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-card block"
                style={{
                  padding: 20,
                  background: 'var(--ide-bg-3)',
                  borderRadius: 3,
                  textDecoration: 'none',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontFamily: serif,
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--ide-text-1)',
                  }}
                >
                  {cert.name}
                </span>
                <span style={{ ...body, display: 'block', fontSize: 15, marginTop: 4 }}>
                  {cert.detail}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Band>
    </div>
  );
}
