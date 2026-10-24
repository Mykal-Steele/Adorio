'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ExternalLink, Github, Linkedin, Mail, Download } from 'lucide-react';
import { portfolioData, type Project } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { useProjectNavigation } from '../hooks/useProjectNavigation';
import { mono, sans, vietnam } from '../constants/fonts';
import { Breadcrumb, Badge } from '../shared';

const FEATURED_IDS = ['chronochunk', 'coding-challenges', 'create-adorex'];

const statusColors: Record<string, string> = {
  STABLE: 'var(--ide-accent)',
  BETA: 'var(--ide-orange)',
  DEPRECATED: 'var(--ide-pink)',
};

const heroLinks = [
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

function ProjectLinks({ project }: { project: Project }) {
  const links: { label: string; href: string; external: boolean }[] = [];
  if (project.liveUrl) links.push({ label: 'Live', href: project.liveUrl, external: false });
  if (project.repoUrl)
    links.push({ label: 'GitHub', href: `https://${project.repoUrl}`, external: true });
  if (project.npm) links.push({ label: 'npm', href: `https://${project.npm}`, external: true });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {links.map((link) =>
        link.external ? (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:underline"
            style={{
              fontSize: 15,
              fontFamily: sans,
              color: 'var(--ide-accent)',
              textDecoration: 'none',
            }}
          >
            {link.label}
            <ExternalLink size={13} />
          </a>
        ) : (
          <Link
            key={link.label}
            href={link.href}
            className="inline-flex items-center gap-1.5 hover:underline"
            style={{
              fontSize: 15,
              fontFamily: sans,
              color: 'var(--ide-accent)',
              textDecoration: 'none',
            }}
          >
            {link.label}
            <ArrowRight size={13} />
          </Link>
        ),
      )}
    </div>
  );
}

export function Dashboard() {
  const router = useRouter();
  const { openProject, prefetchProject } = useProjectNavigation();
  const { isMobile, isTablet } = useResponsive();

  const featured = FEATURED_IDS.map((id) =>
    portfolioData.projects.find((project) => project.id === id),
  ).filter((project): project is Project => Boolean(project));

  return (
    <div className="min-h-full">
      <Breadcrumb segments={['src', 'dashboard.tsx']} language="TypeScript JSX" />

      <section
        className={isMobile ? 'px-5 py-8' : 'px-8 py-10'}
        style={{ background: 'var(--ide-bg-3)', borderBottom: '1px solid var(--ide-border)' }}
      >
        <h1
          style={{
            fontFamily: sans,
            fontSize: isMobile ? 34 : 44,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--ide-text-1)',
            margin: 0,
            marginBottom: 10,
          }}
        >
          {portfolioData.name}
        </h1>
        <p
          style={{
            fontFamily: vietnam,
            fontSize: isMobile ? 17 : 19,
            lineHeight: 1.6,
            color: 'var(--ide-text-2)',
            maxWidth: '62ch',
            margin: 0,
            marginBottom: 24,
          }}
        >
          {portfolioData.headline}
        </p>

        <div className="flex flex-wrap gap-3">
          {heroLinks.map(({ label, href, download, icon: Icon, primary, external }) => {
            const style = {
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              fontSize: 15,
              fontFamily: sans,
              fontWeight: 600,
              textDecoration: 'none',
              border: primary ? 'none' : '1px solid var(--ide-border-stronger)',
              background: primary ? 'var(--ide-accent)' : 'transparent',
              color: primary ? 'var(--ide-bg-1)' : 'var(--ide-text-2)',
            } as const;

            return external ? (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={style}>
                <Icon size={15} />
                {label}
              </a>
            ) : (
              <a key={label} href={href} download={download} style={style}>
                <Icon size={15} />
                {label}
              </a>
            );
          })}
        </div>
      </section>

      <section
        className={isMobile ? 'px-5 py-6' : 'px-8 py-7'}
        style={{ borderBottom: '1px solid var(--ide-border)' }}
      >
        <h2
          style={{
            fontFamily: sans,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ide-text-5)',
            margin: 0,
            marginBottom: 14,
          }}
        >
          Now
        </h2>
        <ul className="flex flex-col gap-3" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {portfolioData.now.map((item) => (
            <li key={item.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                style={{
                  fontFamily: vietnam,
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--ide-text-2)',
                }}
              >
                {item.label}
              </span>
              <span style={{ fontFamily: vietnam, fontSize: 16, color: 'var(--ide-text-4)' }}>
                {item.detail}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={isMobile ? 'px-5 py-7' : 'px-8 py-8'}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2
            style={{
              fontFamily: sans,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ide-text-5)',
              margin: 0,
            }}
          >
            Featured projects
          </h2>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 hover:underline"
            style={{
              fontFamily: sans,
              fontSize: 15,
              color: 'var(--ide-accent)',
              textDecoration: 'none',
            }}
          >
            All projects
            <ArrowRight size={14} />
          </Link>
        </div>

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          }}
        >
          {featured.map((project) => (
            <article
              key={project.id}
              className="flex flex-col p-5"
              style={{
                background: 'var(--ide-bg-2)',
                border: '1px solid var(--ide-border)',
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <button
                  onClick={() => openProject(project.id)}
                  onMouseEnter={() => prefetchProject(project.id)}
                  onTouchStart={() => prefetchProject(project.id)}
                  className="text-left hover:underline"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: sans,
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--ide-text-1)',
                  }}
                >
                  {project.name}
                </button>
                <span
                  style={{
                    flexShrink: 0,
                    fontFamily: sans,
                    fontSize: 12,
                    letterSpacing: '0.06em',
                    color: statusColors[project.status] || 'var(--ide-accent)',
                  }}
                >
                  {project.status}
                </span>
              </div>

              <p
                style={{
                  fontFamily: vietnam,
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: 'var(--ide-text-3)',
                  margin: 0,
                  marginBottom: 16,
                }}
              >
                {project.summary}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: 'var(--ide-text-4)',
                      background: 'var(--ide-bg-4)',
                      padding: '2px 6px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-3" style={{ borderTop: '1px solid var(--ide-border)' }}>
                <ProjectLinks project={project} />
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => router.push('/about')}
            className="inline-flex items-center gap-2 hover:underline"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: sans,
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--ide-text-2)',
            }}
          >
            About me
            <ArrowRight size={15} />
          </button>
          <Badge
            color="var(--ide-accent)"
            style={{ fontSize: 12, padding: '3px 9px', alignSelf: 'center' }}
          >
            Open to internships
          </Badge>
        </div>
      </section>

      <div style={{ height: 48 }} />
    </div>
  );
}
