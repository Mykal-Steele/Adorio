'use client';

import Link from 'next/link';
import { Download, Github, Linkedin, Mail } from 'lucide-react';
import { portfolioData, type Project, type SkillGroup } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { sans, serif } from '../constants/fonts';
import { body, buttonHover, eyebrow, primaryButton, secondaryButton } from '../constants/type';
import { LogoTile, ProjectImage, SectionLabel, StatusLabel, Tape } from '../shared';

const FEATURED_IDS = ['chronochunk', 'coding-challenges', 'create-adorex'];
const SKILL_GROUPS: SkillGroup[] = ['Languages', 'Web', 'Backend', 'Data', 'Tools'];

const links = [
  { label: 'GitHub', href: `https://${portfolioData.github}`, icon: Github, external: true },
  { label: 'LinkedIn', href: `https://${portfolioData.linkedin}`, icon: Linkedin, external: true },
  { label: 'Email', href: `mailto:${portfolioData.email}`, icon: Mail, external: false },
];

const facts = [
  { label: 'Studying', value: 'Computer Science, year 3, KMUTT' },
  { label: 'GPA', value: '3.28' },
  { label: 'Based in', value: `${portfolioData.location} (${portfolioData.timezone})` },
  { label: 'Status', value: 'Open to opportunities' },
];

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
          <a
            href="/resume"
            download="Oakar-Oo-Resume.pdf"
            className="transition-transform duration-150 hover:-translate-y-px active:scale-[0.97]"
            style={primaryButton}
          >
            <Download size={15} />
            Resume
          </a>
          {links.map(({ label, href, icon: Icon, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={buttonHover}
              style={secondaryButton}
            >
              <Icon size={16} />
              {label}
            </a>
          ))}
        </div>
      </div>

      <aside
        style={{
          position: 'relative',
          padding: '28px 24px 24px',
          background: 'var(--ide-note)',
          boxShadow: '0 18px 28px -18px rgba(60, 44, 24, 0.45), 0 2px 0 rgba(60, 44, 24, 0.08)',
          transform: isMobile ? 'rotate(-1deg)' : 'rotate(2deg)',
          marginTop: isMobile ? 0 : 16,
        }}
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
}: {
  project: Project;
  flip: boolean;
  isMobile: boolean;
}) {
  const href = `/projects/${project.id}`;
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
        className="relative block transition-transform duration-300 hover:rotate-0"
        style={{
          order: !isMobile && flip ? 2 : 0,
          padding: 10,
          background: 'var(--ide-bg-3)',
          boxShadow: 'var(--ide-card-shadow)',
          transform: `rotate(${flip ? 1.2 : -1.2}deg)`,
        }}
      >
        <Tape />
        <ProjectImage project={project} sizes="(max-width: 900px) 100vw, 520px" />
      </Link>

      <div>
        <div className="flex flex-wrap items-center" style={{ gap: 12 }}>
          {project.language && <span style={eyebrow}>{project.language}</span>}
          <StatusLabel status={project.status} />
        </div>
        <h3
          style={{
            fontFamily: serif,
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1.1,
            color: 'var(--ide-text-1)',
            margin: '8px 0 12px',
            textWrap: 'balance',
          }}
        >
          <Link
            href={href}
            className="hover:underline underline-offset-4"
            style={{ color: 'inherit' }}
          >
            {project.name}
          </Link>
        </h3>
        <p style={body}>{project.summary}</p>
        <Link href={href} className={buttonHover} style={{ ...secondaryButton, marginTop: 20 }}>
          Read the case study
        </Link>
      </div>
    </article>
  );
}

function Experience({ isMobile }: { isMobile: boolean }) {
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none', position: 'relative' }}>
      {portfolioData.experience.map((exp, i) => (
        <li
          key={exp.org}
          className="grid"
          style={{
            gridTemplateColumns: isMobile ? '20px 1fr' : '148px 20px 1fr',
            columnGap: isMobile ? 12 : 16,
            paddingBottom: i < portfolioData.experience.length - 1 ? 32 : 0,
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
                bottom: i === portfolioData.experience.length - 1 ? 'auto' : -32,
                height: i === portfolioData.experience.length - 1 ? 28 : 'auto',
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
                background: i === 0 ? 'var(--ide-yellow)' : 'var(--ide-bg-0)',
                border: '2px solid var(--ide-text-3)',
              }}
            />
          </div>
          <article
            style={{
              padding: isMobile ? 20 : 24,
              background: 'var(--ide-bg-3)',
              borderRadius: 3,
              boxShadow: 'var(--ide-card-shadow)',
            }}
          >
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
          </article>
        </li>
      ))}
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
            style={{ gridTemplateColumns: isMobile ? '1fr' : '112px 1fr', gap: isMobile ? 8 : 16 }}
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
        Hover a logo for its name. Click one to see where I used it.
      </p>
    </div>
  );
}

function CareerLog({ isMobile }: { isMobile: boolean }) {
  const margin = isMobile ? 64 : 112;
  return (
    <div
      style={{
        position: 'relative',
        padding: '32px 24px 32px 0',
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

function Community() {
  return (
    <ul className="flex flex-wrap" style={{ gap: 48, margin: 0, padding: 0, listStyle: 'none' }}>
      {portfolioData.community.map((community, i) => (
        <li key={community.short} className="flex items-center" style={{ gap: 20 }}>
          <span
            aria-hidden="true"
            className="grid place-items-center"
            style={{
              width: 92,
              height: 92,
              borderRadius: '50%',
              border: `3px solid ${community.color}`,
              boxShadow: `inset 0 0 0 4px var(--ide-bg-0), inset 0 0 0 5px ${community.color}`,
              color: community.color,
              fontFamily: serif,
              fontSize: 24,
              fontWeight: 700,
              transform: `rotate(${i % 2 ? 7 : -8}deg)`,
              opacity: 0.9,
            }}
          >
            {community.short}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--ide-text-1)',
              maxWidth: '16ch',
            }}
          >
            {community.name}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function About() {
  const { isMobile } = useResponsive();
  const featured = FEATURED_IDS.map((id) =>
    portfolioData.projects.find((project) => project.id === id),
  ).filter((project): project is Project => Boolean(project));
  const sectionGap = isMobile ? 64 : 96;

  return (
    <div
      className={isMobile ? 'px-4 pt-10 pb-20' : 'px-10 pt-16 pb-28'}
      style={{ maxWidth: 1000, margin: '0 auto' }}
    >
      <Hero isMobile={isMobile} />

      <section style={{ marginTop: sectionGap }}>
        <SectionLabel>Featured projects</SectionLabel>
        <div className="flex flex-col" style={{ gap: isMobile ? 56 : 80, marginTop: 40 }}>
          {featured.map((project, i) => (
            <FeaturedProject
              key={project.id}
              project={project}
              flip={i % 2 === 1}
              isMobile={isMobile}
            />
          ))}
        </div>
        <Link
          href="/projects"
          className={buttonHover}
          style={{ ...secondaryButton, marginTop: 56 }}
        >
          See all {portfolioData.projects.length} projects
        </Link>
      </section>

      <section style={{ marginTop: sectionGap, maxWidth: 720 }}>
        <SectionLabel>About me</SectionLabel>
        <div className="flex flex-col" style={{ gap: 16 }}>
          <p style={body}>
            I got into programming at 15 through online HTML classes and Scratch, then spent a few
            years on games and small Python bots before moving to backend work.
          </p>
          <p style={body}>
            At KMUTT, Bangkok I learned TypeScript, React, Express, Hono, and Bun, then Next.js. I
            led the financial team on a 50+ student smart city class project, placed 2nd in the
            KMUTT IoT Hackathon, and now mentor first-year students in Java. I study business
            administration online at University of the People.
          </p>
          <p style={body}>Outside of code: learning Korean and working out.</p>
        </div>
      </section>

      <section style={{ marginTop: sectionGap }}>
        <SectionLabel>Experience</SectionLabel>
        <Experience isMobile={isMobile} />
      </section>

      <section style={{ marginTop: sectionGap }}>
        <SectionLabel>Tech stack</SectionLabel>
        <TechSheet isMobile={isMobile} />
      </section>

      <section style={{ marginTop: sectionGap }}>
        <SectionLabel>Career log</SectionLabel>
        <CareerLog isMobile={isMobile} />
      </section>

      <section style={{ marginTop: sectionGap }}>
        <SectionLabel>Community</SectionLabel>
        <Community />
      </section>
    </div>
  );
}
