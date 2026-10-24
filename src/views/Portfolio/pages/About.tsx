'use client';

import Link from 'next/link';
import { ArrowRight, Download, Github, Linkedin, Mail } from 'lucide-react';
import { portfolioData, type Project } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { mono, sans, vietnam } from '../constants/fonts';
import { Breadcrumb, Badge, IDECard, PageHeader, ProjectCard, SectionLabel } from '../shared';

const FEATURED_IDS = ['chronochunk', 'coding-challenges', 'create-adorex'];

const actions = [
  {
    label: 'Resume',
    href: '/resume',
    download: 'Oakar-Oo-Resume.pdf',
    icon: Download,
    primary: true,
    external: false,
  },
  {
    label: 'GitHub',
    href: `https://${portfolioData.github}`,
    icon: Github,
    primary: false,
    external: true,
  },
  {
    label: 'LinkedIn',
    href: `https://${portfolioData.linkedin}`,
    icon: Linkedin,
    primary: false,
    external: true,
  },
  {
    label: 'Email',
    href: `mailto:${portfolioData.email}`,
    icon: Mail,
    primary: false,
    external: false,
  },
];

export function About() {
  const { isMobile } = useResponsive();
  const featured = FEATURED_IDS.map((id) =>
    portfolioData.projects.find((project) => project.id === id),
  ).filter((project): project is Project => Boolean(project));

  return (
    <div className="min-h-full">
      <Breadcrumb segments={['src', 'about_me.md']} language="Markdown" />

      <div
        className={isMobile ? 'px-4 py-6' : 'px-8 py-8'}
        style={{ maxWidth: 760, margin: '0 auto' }}
      >
        <PageHeader
          title="Oakar Oo"
          subtitle="Backend developer · CS student at KMUTT, Bangkok"
          style={{ marginBottom: 20 }}
        />

        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 16 }}>
          <Badge color="var(--ide-text-1)" bg="var(--ide-orange-a12)">
            KMUTT · CS Year 3 · GPA 3.28
          </Badge>
          <Badge color="var(--ide-text-1)" bg="var(--ide-accent-a10)">
            Open to Opportunities
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2" style={{ marginBottom: 40 }}>
          {actions.map(({ label, href, download, icon: Icon, primary, external }) => {
            const style = {
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 15px',
              fontFamily: sans,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              border: '2px solid var(--nb-border)',
              background: primary ? 'var(--nb-accent)' : 'var(--ide-bg-0)',
              color: primary ? 'var(--nb-on-accent)' : 'var(--ide-text-1)',
              boxShadow: '3px 3px 0 var(--nb-shadow)',
              transition: 'transform 120ms ease, box-shadow 120ms ease',
            } as const;

            const hover = (element: HTMLElement) => {
              element.style.transform = 'translate(-2px, -2px)';
              element.style.boxShadow = '5px 5px 0 var(--nb-shadow)';
            };
            const leave = (element: HTMLElement) => {
              element.style.transform = 'translate(0, 0)';
              element.style.boxShadow = '3px 3px 0 var(--nb-shadow)';
            };

            return external ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={style}
                onMouseEnter={(e) => hover(e.currentTarget)}
                onMouseLeave={(e) => leave(e.currentTarget)}
              >
                <Icon size={15} />
                {label}
              </a>
            ) : (
              <a
                key={label}
                href={href}
                download={download}
                style={style}
                onMouseEnter={(e) => hover(e.currentTarget)}
                onMouseLeave={(e) => leave(e.currentTarget)}
              >
                <Icon size={15} />
                {label}
              </a>
            );
          })}
        </div>

        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              fontSize: 16,
              fontFamily: vietnam,
              color: 'var(--ide-text-2)',
              lineHeight: 1.65,
              marginBottom: 18,
              maxWidth: '68ch',
            }}
          >
            I got into programming at 15 through online HTML classes and Scratch, then spent a few
            years on games and small Python bots before moving to backend work.
          </div>
          <div
            style={{
              fontSize: 16,
              fontFamily: vietnam,
              color: 'var(--ide-text-2)',
              lineHeight: 1.65,
              marginBottom: 18,
              maxWidth: '68ch',
            }}
          >
            At KMUTT, Bangkok I learned TypeScript, React, Express, Hono, and Bun, then Next.js. I
            led the financial team on a 50+ student smart city class project, placed 2nd in the
            KMUTT IoT Hackathon, and now mentor first-year students in Java. I study business
            administration online at University of the People.
          </div>
          <div
            style={{
              fontSize: 16,
              fontFamily: vietnam,
              color: 'var(--ide-text-2)',
              lineHeight: 1.65,
              maxWidth: '68ch',
            }}
          >
            Outside of code: learning Korean and working out.
          </div>
        </div>

        <div style={{ marginBottom: 52 }}>
          <SectionLabel>Featured projects</SectionLabel>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}
          >
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} compact />
            ))}
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2"
            style={{
              marginTop: 18,
              padding: '7px 12px',
              fontFamily: mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: 'var(--ide-text-1)',
              background: 'var(--ide-bg-0)',
              border: '2px solid var(--nb-border)',
              boxShadow: '3px 3px 0 var(--nb-shadow)',
            }}
          >
            All projects
            <ArrowRight size={13} />
          </Link>
        </div>

        <SectionLabel>Experience</SectionLabel>
        <div className="mb-12 flex flex-col gap-4">
          {portfolioData.experience.map((exp) => (
            <IDECard
              key={exp.org}
              className="p-5"
              bg="bg-3"
              style={{ borderLeft: '6px solid var(--ide-accent)' }}
            >
              <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                <div>
                  <div
                    style={{
                      fontSize: 17,
                      fontFamily: sans,
                      color: 'var(--ide-text-1)',
                      fontWeight: 700,
                    }}
                  >
                    {exp.role}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontFamily: sans,
                      fontWeight: 600,
                      color: 'var(--ide-accent)',
                      marginTop: 2,
                    }}
                  >
                    {exp.org}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: mono,
                    fontWeight: 700,
                    color: 'var(--nb-on-accent)',
                    background: 'var(--nb-accent)',
                    border: '1.5px solid var(--nb-border)',
                    padding: '3px 8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {exp.period}
                </span>
              </div>
              <ul className="flex flex-col gap-2 pl-1">
                {exp.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2">
                    <span
                      style={{
                        color: 'var(--ide-accent)',
                        fontSize: 10,
                        flexShrink: 0,
                        marginTop: 3,
                      }}
                    >
                      ▸
                    </span>
                    <span
                      style={{
                        fontSize: 16,
                        fontFamily: vietnam,
                        color: 'var(--ide-text-3)',
                        lineHeight: 1.6,
                      }}
                    >
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </IDECard>
          ))}
        </div>

        <SectionLabel>Tech stack</SectionLabel>
        <div
          className="grid gap-4 mb-12"
          style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}
        >
          {portfolioData.stack.map((group) => (
            <IDECard key={group.category} className="p-4" bg="bg-3">
              <div
                style={{
                  fontSize: 12,
                  fontFamily: sans,
                  fontWeight: 700,
                  color: 'var(--ide-text-1)',
                  letterSpacing: '0.1em',
                  marginBottom: 10,
                  paddingBottom: 8,
                  borderBottom: '2px solid var(--nb-border)',
                }}
              >
                {group.category}
              </div>
              {group.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 mb-1.5"
                  style={{ fontSize: 15, fontFamily: mono, color: 'var(--ide-text-3)' }}
                >
                  <span style={{ color: group.color, fontSize: 8 }}>▸</span>
                  {item}
                </div>
              ))}
            </IDECard>
          ))}
        </div>

        <SectionLabel>Tools I use</SectionLabel>
        <p
          style={{
            fontSize: 16,
            fontFamily: vietnam,
            color: 'var(--ide-text-3)',
            lineHeight: 1.6,
            margin: '0 0 48px',
            maxWidth: '68ch',
          }}
        >
          {portfolioData.tools}
        </p>

        <SectionLabel>Career log</SectionLabel>
        <div className="mb-12">
          {portfolioData.timeline.map((item, i) => (
            <div
              key={item.year}
              className="flex items-start gap-4 mb-4"
              style={{
                paddingBottom: i < portfolioData.timeline.length - 1 ? 16 : 0,
                borderBottom:
                  i < portfolioData.timeline.length - 1 ? '2px solid var(--ide-border)' : 'none',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontFamily: mono,
                  fontWeight: 700,
                  color: 'var(--nb-on-accent)',
                  background: 'var(--nb-accent)',
                  border: '1.5px solid var(--nb-border)',
                  padding: '2px 6px',
                  flexShrink: 0,
                  minWidth: 44,
                  textAlign: 'center',
                }}
              >
                {item.year}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontFamily: vietnam,
                  lineHeight: 1.6,
                  color: 'var(--ide-text-2)',
                }}
              >
                {item.event}
              </div>
            </div>
          ))}
        </div>

        <SectionLabel>Community</SectionLabel>
        <div
          className="grid gap-4 mb-16"
          style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}
        >
          {portfolioData.community.map((community) => (
            <IDECard
              key={community.short}
              className="p-4"
              bg="bg-3"
              style={{ borderLeft: `6px solid ${community.color}` }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontFamily: sans,
                  fontWeight: 700,
                  color: 'var(--ide-text-1)',
                  letterSpacing: '0.1em',
                  marginBottom: 6,
                }}
              >
                {community.short}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontFamily: vietnam,
                  color: 'var(--ide-text-2)',
                  lineHeight: 1.6,
                }}
              >
                {community.name}
              </div>
            </IDECard>
          ))}
        </div>
      </div>
    </div>
  );
}
