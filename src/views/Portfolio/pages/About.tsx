'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronDown, Download, Github, Linkedin, Mail, MessageSquare } from 'lucide-react';
import { portfolioData, type Project, type SkillGroup } from '../data/portfolio';
import { skillsForProject } from '../data/skills';
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
  { label: 'Looking for', value: ['A software engineering internship'] },
  {
    label: 'Studying',
    value: [
      'Computer Science, year 3, KMUTT',
      'Business Administration, University of the People (California)',
    ],
  },
  { label: 'Graduating', value: ['2028, both degrees'] },
  { label: 'Based in', value: [`${portfolioData.location} (${portfolioData.timezone})`] },
];

// What a recruiter should take away in one pass; each line links to the full write-up
const proof = [
  {
    id: 'adorio',
    text: ', the site you are on. I run it on Azure with automatic deploys, and a Cloudflare Worker moves traffic to a free backup server on Northflank if Azure goes down.',
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
    text: ', an npm starter that turns 10 to 20 minutes of setup into one command. It became the class template.',
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
function Band({ first = false, children }: { first?: boolean; children: ReactNode }) {
  return (
    <section className="px-4 md:px-10">
      <div
        className={first ? 'pt-10 pb-14 md:pt-16 md:pb-20' : 'py-12 md:py-[72px]'}
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          borderTop: first ? 'none' : '1.5px solid var(--ide-border-strong)',
        }}
      >
        {children}
      </div>
    </section>
  );
}

// Layout follows the editor area's width (container queries on <main>), so the server
// renders it right on every screen and nothing jumps when JavaScript loads
function Hero() {
  return (
    <header className="grid grid-cols-1 items-start gap-10 @[880px]:grid-cols-[1fr_320px] @[880px]:gap-14">
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
          I focus on backends and the setup that keeps them running. I mainly like working with
          APIs, databases, deployment, and developer experience.
        </p>

        <div className="flex flex-wrap items-center" style={{ gap: 12, marginTop: 32 }}>
          <a href="/resume" download="Oakar-Oo-Resume.pdf" className="pf-btn-primary">
            <Download size={15} />
            Resume
          </a>
          <Link href="/contact" className="pf-btn">
            <MessageSquare size={16} />
            Contact me
          </Link>
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
        className="pf-note @container relative max-w-[360px] [--tilt:-1deg] @[560px]:max-w-[620px] @[880px]:mt-14 @[880px]:max-w-none @[880px]:[--tilt:2deg]"
        style={{
          padding: '24px 24px 20px',
          background: 'var(--ide-note)',
          boxShadow: 'var(--ide-card-shadow)',
        }}
      >
        <Tape />
        {/* Two columns once the note is wide enough, which only happens on tablets. CSS columns
            stack each side on its own, so a two-line fact doesn't leave a gap beside it. */}
        <dl
          className="flex flex-col gap-3 @[440px]:block @[440px]:columns-2 @[440px]:gap-8"
          style={{ margin: 0 }}
        >
          {facts.map(({ label, value }) => (
            <div key={label} className="break-inside-avoid @[440px]:mb-4">
              <dt style={{ ...eyebrow, fontSize: 13 }}>{label}</dt>
              {value.map((line, i) => (
                <dd
                  key={line}
                  style={{
                    margin: `${i === 0 ? 2 : 6}px 0 0`,
                    fontFamily: sans,
                    fontSize: 16,
                    fontWeight: 500,
                    color: 'var(--ide-text-1)',
                  }}
                >
                  {line}
                </dd>
              ))}
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
  priority = false,
}: {
  project: Project;
  flip: boolean;
  priority?: boolean;
}) {
  const href = `/projects/${project.id}`;
  const builtWith = skillsForProject(project);
  return (
    <article
      className={`grid grid-cols-1 items-center gap-6 @[880px]:gap-12 ${flip ? '@[880px]:grid-cols-[5fr_6fr]' : '@[880px]:grid-cols-[6fr_5fr]'}`}
    >
      <Link
        href={href}
        aria-label={project.name}
        className={`pf-print relative block ${flip ? '@[880px]:order-2' : ''}`}
        style={
          {
            '--tilt': `${flip ? 1.2 : -1.2}deg`,
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
          className="text-[24px] @[880px]:text-[30px]"
          style={{
            fontFamily: serif,
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

function Experience() {
  const last = portfolioData.experience.length - 1;
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {portfolioData.experience.map((exp, i) => {
        const project = portfolioData.projects.find((p) => p.id === exp.projectId);
        return (
          <li
            key={exp.org}
            className="grid grid-cols-[20px_1fr] gap-x-3 @[880px]:grid-cols-[148px_20px_1fr] @[880px]:gap-x-4"
            style={{ paddingBottom: i < last ? 32 : 0 }}
          >
            <div
              className="hidden @[880px]:block"
              style={{
                ...eyebrow,
                paddingTop: 24,
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {exp.period}
            </div>
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
              className={`grid grid-cols-1 p-5 @[880px]:p-6 ${project ? '@[880px]:grid-cols-[1fr_200px]' : ''}`}
              style={{
                gap: 20,
                background: 'var(--ide-bg-3)',
                borderRadius: 3,
                boxShadow: 'var(--ide-card-shadow)',
              }}
            >
              <div>
                <div className="@[880px]:hidden" style={{ ...eyebrow, marginBottom: 6 }}>
                  {exp.period}
                </div>
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

function TechSheet() {
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
      className="p-5 @[880px]:p-7"
      style={{
        background: 'var(--ide-bg-3)',
        borderRadius: 3,
        boxShadow: 'var(--ide-card-shadow)',
      }}
    >
      <dl className="flex flex-col" style={{ gap: 20, margin: 0 }}>
        {rows.map(({ label, items }) => (
          <div
            key={label}
            className="grid grid-cols-1 items-center gap-2 @[880px]:grid-cols-[132px_1fr] @[880px]:gap-4"
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
        {/* Touch screens can't hover, so they get the tap hint */}
        <span className="[@media(hover:hover)]:hidden">Tap a logo to see where I used it.</span>
        <span className="hidden [@media(hover:hover)]:inline">
          Hover a logo for its name. Click one to see where I used it.
        </span>
      </p>
    </div>
  );
}

// --margin is the notebook's red margin line, wider when there's room
function CareerLog() {
  return (
    <div
      className="[--margin:64px] @[880px]:[--margin:112px]"
      style={{
        padding: '32px 24px 0 0',
        background: 'var(--ide-bg-3)',
        borderRadius: 3,
        boxShadow: 'var(--ide-card-shadow)',
        backgroundImage:
          'linear-gradient(to right, transparent calc(var(--margin) - 2px), var(--ide-margin-line) calc(var(--margin) - 2px), var(--ide-margin-line) var(--margin), transparent var(--margin)), repeating-linear-gradient(to bottom, transparent 0 31px, var(--ide-border) 31px 32px)',
        backgroundPosition: '0 0, 0 32px',
      }}
    >
      {portfolioData.timeline.map((item) => (
        <section
          key={item.year}
          className="grid grid-cols-[var(--margin)_1fr] gap-x-3 @[880px]:gap-x-6"
        >
          <h3
            className="pr-[10px] text-[20px] @[880px]:pr-[18px] @[880px]:text-[26px]"
            style={{
              fontFamily: serif,
              fontWeight: 700,
              lineHeight: '32px',
              color: 'var(--ide-text-1)',
              margin: 0,
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
      className="grid grid-cols-1 @[880px]:grid-cols-2"
      style={{ gap: 24, margin: 0, padding: 0, listStyle: 'none' }}
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

// What a recruiter needs is always visible; the personal side opens on request
function AboutMe() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <p style={body}>
        Most of my work is on the server side. I&apos;m familiar with stuff like TypeScript with
        Express or Hono, Prisma, Docker, Azure, and React and Next.js when a project needs a
        frontend (the full list is in the tech stack below). I want to work on backend, infra, or
        DevOps. A startup where I can learn a lot sounds great, and I don&apos;t mind any country if
        I can work remote.
      </p>
      <p style={body}>
        I love working on things people actually use. Most of what I know comes from building things
        like:
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

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="about-more"
        className="pf-btn self-start"
        style={{ marginTop: 8 }}
      >
        {open ? 'Show less' : 'More about me'}
        <ChevronDown
          size={16}
          aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <div
        id="about-more"
        hidden={!open}
        // The flex class would otherwise override the hidden attribute
        style={{ display: open ? 'flex' : 'none', flexDirection: 'column', gap: 16 }}
      >
        <p style={body}>
          I got into programming at 15 through online HTML classes and Scratch, then spent a few
          years on games and small Python bots. At KMUTT, uni projects kept putting me on the
          backend, and deploying my own stuff got me hooked on how it all runs. If someone asks for
          a feature, I&apos;m happy to build it, because it feels like I&apos;m making an impact.
        </p>
        <p style={body}>
          I picked KMUTT because I heard it has a great Computer Science program, and that&apos;s
          all I was looking for. I&apos;m also doing a business degree online at University of the
          People, on a scholarship, so I know the business side too, not just the technical side.
        </p>
        <p style={body}>
          I like learning new stuff too! Right now I&apos;m learning Go by building a smart project
          manager. Why? Because Go is cool :)
        </p>
        <p style={body}>
          Outside of code, I&apos;m learning Korean (it started as an elective, since most of the
          others weren&apos;t open to international students), working out, and playing chess at
          around 1100 Elo. Can I count working on projects as a hobby too? Haha, that&apos;s what I
          do when I&apos;m free.
        </p>
      </div>
    </div>
  );
}

export function About() {
  const featured = FEATURED_IDS.map((id) =>
    portfolioData.projects.find((project) => project.id === id),
  ).filter((project): project is Project => Boolean(project));

  return (
    <div>
      <Band first>
        <Hero />
      </Band>

      <Band>
        <div style={{ maxWidth: 720 }}>
          <SectionLabel>About me</SectionLabel>
          <AboutMe />
        </div>
      </Band>

      <Band>
        <SectionLabel>Experience</SectionLabel>
        <Experience />
      </Band>

      <Band>
        <SectionLabel>Featured projects</SectionLabel>
        <div className="flex flex-col gap-14 md:gap-20" style={{ marginTop: 40 }}>
          {featured.map((project, i) => (
            <FeaturedProject key={project.id} project={project} flip={i % 2 === 1} />
          ))}
        </div>
        <Link href="/projects" className="pf-btn" style={{ marginTop: 56 }}>
          See all {portfolioData.projects.length} projects
        </Link>
      </Band>

      <Band>
        <SectionLabel>Tech stack</SectionLabel>
        <TechSheet />
      </Band>

      <Band>
        <SectionLabel>Career log</SectionLabel>
        <CareerLog />
      </Band>

      <Band>
        <SectionLabel>Community</SectionLabel>
        <Community />
      </Band>

      <Band>
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
