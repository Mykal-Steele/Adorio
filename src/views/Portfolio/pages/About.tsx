'use client';

import Link from 'next/link';
import { ArrowRight, Download, Github, Linkedin, Mail } from 'lucide-react';
import { portfolioData, type Project } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { mono, sans } from '../constants/fonts';
import { body, eyebrow, primaryButton, textLink } from '../constants/type';
import { PageHeader, ProjectCard, SectionLabel } from '../shared';

const FEATURED_IDS = ['chronochunk', 'coding-challenges', 'create-adorex'];

const links = [
  { label: 'GitHub', href: `https://${portfolioData.github}`, icon: Github, external: true },
  { label: 'LinkedIn', href: `https://${portfolioData.linkedin}`, icon: Linkedin, external: true },
  { label: 'Email', href: `mailto:${portfolioData.email}`, icon: Mail, external: false },
];

const subheading = {
  fontFamily: sans,
  fontSize: 18,
  fontWeight: 700,
  lineHeight: 1.4,
  color: 'var(--ide-text-1)',
  margin: 0,
} as const;

export function About() {
  const { isMobile } = useResponsive();
  const featured = FEATURED_IDS.map((id) =>
    portfolioData.projects.find((project) => project.id === id),
  ).filter((project): project is Project => Boolean(project));
  const sectionGap = isMobile ? 48 : 64;

  return (
    <div
      className={isMobile ? 'px-4 pt-8 pb-16' : 'px-8 pt-16 pb-24'}
      style={{ maxWidth: 776, margin: '0 auto' }}
    >
      <PageHeader
        eyebrow="KMUTT · CS Year 3 · GPA 3.28 · Open to opportunities"
        title="Oakar Oo"
        subtitle="Backend developer · CS student at KMUTT, Bangkok"
      />

      <div className="flex flex-wrap items-center" style={{ gap: 24, marginTop: 32 }}>
        <a
          href="/resume"
          download="Oakar-Oo-Resume.pdf"
          className="transition-transform hover:-translate-y-px"
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
            className="hover:underline underline-offset-4"
            style={textLink}
          >
            <Icon size={16} />
            {label}
          </a>
        ))}
      </div>

      <div className="flex flex-col" style={{ gap: 16, marginTop: 48 }}>
        <p style={body}>
          I got into programming at 15 through online HTML classes and Scratch, then spent a few
          years on games and small Python bots before moving to backend work.
        </p>
        <p style={body}>
          At KMUTT, Bangkok I learned TypeScript, React, Express, Hono, and Bun, then Next.js. I led
          the financial team on a 50+ student smart city class project, placed 2nd in the KMUTT IoT
          Hackathon, and now mentor first-year students in Java. I study business administration
          online at University of the People.
        </p>
        <p style={body}>Outside of code: learning Korean and working out.</p>
      </div>

      <section style={{ marginTop: sectionGap }}>
        <SectionLabel>Featured projects</SectionLabel>
        <div className="flex flex-col" style={{ gap: 32 }}>
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <Link
          href="/projects"
          className="hover:underline underline-offset-4"
          style={{ ...textLink, marginTop: 24 }}
        >
          All projects
          <ArrowRight size={16} />
        </Link>
      </section>

      <section style={{ marginTop: sectionGap }}>
        <SectionLabel>Experience</SectionLabel>
        <div className="flex flex-col" style={{ gap: 32 }}>
          {portfolioData.experience.map((exp) => (
            <article key={exp.org}>
              <div className="flex flex-wrap items-baseline justify-between" style={{ gap: 8 }}>
                <h3 style={subheading}>{exp.role}</h3>
                <span style={eyebrow}>{exp.period}</span>
              </div>
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--ide-accent)',
                  marginTop: 2,
                }}
              >
                {exp.org}
              </div>
              <ul
                className="flex flex-col"
                style={{ gap: 8, margin: '12px 0 0', paddingLeft: 20, listStyle: 'disc' }}
              >
                {exp.highlights.map((highlight) => (
                  <li key={highlight} style={{ ...body, color: 'var(--ide-text-3)' }}>
                    {highlight}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginTop: sectionGap }}>
        <SectionLabel>Tech stack</SectionLabel>
        <dl
          className="grid"
          style={{
            gap: 24,
            margin: 0,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          }}
        >
          {portfolioData.stack.map((group) => (
            <div key={group.category}>
              <dt style={{ ...eyebrow, marginBottom: 8 }}>{group.category}</dt>
              <dd style={{ ...body, fontSize: 16 }}>{group.items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section style={{ marginTop: sectionGap }}>
        <SectionLabel>Tools I use</SectionLabel>
        <p style={body}>{portfolioData.tools}</p>
      </section>

      <section style={{ marginTop: sectionGap }}>
        <SectionLabel>Career log</SectionLabel>
        <ol className="flex flex-col" style={{ gap: 16, margin: 0, padding: 0, listStyle: 'none' }}>
          {portfolioData.timeline.map((item) => (
            <li key={item.year} className="flex items-baseline" style={{ gap: 24 }}>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--ide-text-4)',
                  minWidth: 44,
                  flexShrink: 0,
                }}
              >
                {item.year}
              </span>
              <span style={body}>{item.event}</span>
            </li>
          ))}
        </ol>
      </section>

      <section style={{ marginTop: sectionGap }}>
        <SectionLabel>Community</SectionLabel>
        <ul className="flex flex-col" style={{ gap: 16, margin: 0, padding: 0, listStyle: 'none' }}>
          {portfolioData.community.map((community) => (
            <li key={community.short} className="flex items-start" style={{ gap: 12 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  marginTop: 9,
                  borderRadius: '50%',
                  background: community.color,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={subheading}>{community.short}</div>
                <div style={body}>{community.name}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
