'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ExternalLink, Github, Package, PlayCircle } from 'lucide-react';
import { portfolioData, type ProjectShot } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { mono, sans, vietnam, title as titleFont } from '../constants/fonts';
import { statusConfig } from '../constants/status';
import { Breadcrumb, Badge, IDECard, SectionLabel } from '../shared';

const EXT_BY_LANGUAGE: Record<string, string> = {
  JavaScript: '.js',
  TypeScript: '.ts',
  Python: '.py',
  Java: '.java',
};

const bodyStyle = {
  fontFamily: vietnam,
  fontSize: 16,
  lineHeight: 1.6,
  color: 'var(--ide-text-3)',
  margin: 0,
  maxWidth: '70ch',
} as const;

function Screenshot({ shot }: { shot: ProjectShot }) {
  return (
    <figure
      style={{
        margin: 0,
        background: 'var(--ide-bg-2)',
        border: '1px solid var(--ide-border)',
      }}
    >
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        sizes="(max-width: 900px) 100vw, 760px"
        style={{ display: 'block', width: '100%', height: 'auto' }}
      />
      <figcaption
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--ide-border-subtle)',
          fontFamily: vietnam,
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--ide-text-4)',
        }}
      >
        {shot.caption}
      </figcaption>
    </figure>
  );
}

export function ProjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const { isMobile } = useResponsive();

  const project = portfolioData.projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full"
        style={{ color: 'var(--ide-text-5)', fontFamily: sans }}
      >
        <div style={{ fontSize: 18, marginBottom: 12 }}>Project not found</div>
        <button
          onClick={() => router.push('/projects')}
          style={{
            color: 'var(--ide-accent)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: mono,
            fontSize: 15,
          }}
        >
          ← Back to projects
        </button>
      </div>
    );
  }

  const sc = statusConfig[project.status] || statusConfig.STABLE;
  const ext = project.language ? (EXT_BY_LANGUAGE[project.language] ?? '.md') : '.md';
  const screenshots = project.screenshots ?? [];
  const mainShots = screenshots.slice(0, 3);
  const moreShots = screenshots.slice(3);
  const hasLinks = Boolean(project.repoUrl || project.npm || project.links?.length);

  return (
    <div className="flex flex-col" style={{ minHeight: '100%' }}>
      <Breadcrumb
        segments={['src', 'projects', `${project.id}${ext}`]}
        language={project.language ?? 'Markdown'}
      />

      <div className={`flex ${isMobile ? 'flex-col' : ''} flex-1`}>
        <div className={`flex-1 ${isMobile ? 'p-5' : 'p-8'}`}>
          <h1
            style={{
              fontSize: 36,
              fontFamily: titleFont,
              fontWeight: 700,
              color: 'var(--ide-text-1)',
              letterSpacing: '-1px',
              margin: '0 0 8px',
            }}
          >
            {project.name}
          </h1>
          <div
            style={{ width: 48, height: 3, background: 'var(--ide-orange)', marginBottom: 24 }}
          />

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Badge color={sc.color} bg={sc.bg} style={{ padding: '3px 10px' }}>
              {sc.label}
            </Badge>
            {project.language && project.langColor && (
              <span
                style={{
                  fontSize: 13,
                  fontFamily: mono,
                  color: project.langColor,
                  background: `${project.langColor}18`,
                  padding: '2px 8px',
                }}
              >
                {project.language}
              </span>
            )}
          </div>

          <p
            style={{
              fontSize: 19,
              fontFamily: vietnam,
              color: 'var(--ide-text-2)',
              lineHeight: 1.6,
              margin: '0 0 16px',
              maxWidth: '65ch',
            }}
          >
            {project.summary}
          </p>

          {project.requiresAccount && (
            <p
              style={{
                ...bodyStyle,
                fontSize: 15,
                color: 'var(--ide-text-4)',
                marginBottom: 28,
              }}
            >
              This project needs an account to open. Ask me for a demo account if you want to try
              it.
            </p>
          )}

          {project.problem && (
            <div style={{ marginTop: 32 }}>
              <SectionLabel>The problem</SectionLabel>
              <p style={bodyStyle}>{project.problem}</p>
            </div>
          )}

          {project.role && (
            <div style={{ marginTop: 32 }}>
              <SectionLabel>My role</SectionLabel>
              <p style={bodyStyle}>{project.role}</p>
            </div>
          )}

          {project.decisions && project.decisions.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <SectionLabel>Decisions</SectionLabel>
              {project.decisions.map((decision, i) => (
                <div key={decision.title} className="flex items-start" style={{ gap: 16 }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 13,
                      color: 'var(--ide-text-6)',
                      paddingTop: 2,
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        fontFamily: sans,
                        fontSize: 16,
                        fontWeight: 700,
                        color: 'var(--ide-text-2)',
                        marginBottom: 4,
                      }}
                    >
                      {decision.title}
                    </div>
                    <p style={bodyStyle}>{decision.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {project.changes && project.changes.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <SectionLabel>What changed</SectionLabel>
              <ul
                className="flex flex-col gap-2"
                style={{ margin: 0, padding: 0, listStyle: 'none' }}
              >
                {project.changes.map((change) => (
                  <li key={change} className="flex items-start" style={{ gap: 10 }}>
                    <span
                      style={{
                        color: 'var(--ide-accent)',
                        fontSize: 10,
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                    >
                      ▸
                    </span>
                    <span style={bodyStyle}>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.numbers && project.numbers.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <SectionLabel>Numbers</SectionLabel>
              <ul
                className="flex flex-col gap-2"
                style={{ margin: 0, padding: 0, listStyle: 'none' }}
              >
                {project.numbers.map((number) => (
                  <li key={number} className="flex items-start" style={{ gap: 10 }}>
                    <span
                      style={{
                        color: 'var(--ide-orange)',
                        fontSize: 10,
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                    >
                      ▸
                    </span>
                    <span style={bodyStyle}>{number}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mainShots.length > 0 && (
            <div style={{ marginTop: 36 }}>
              <SectionLabel>Screenshots</SectionLabel>
              <div className="flex flex-col gap-5">
                {mainShots.map((shot) => (
                  <Screenshot key={shot.src} shot={shot} />
                ))}
              </div>
              {moreShots.length > 0 && (
                <div
                  className="grid gap-4"
                  style={{
                    marginTop: 16,
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  }}
                >
                  {moreShots.map((shot) => (
                    <Screenshot key={shot.src} shot={shot} />
                  ))}
                </div>
              )}
            </div>
          )}

          {project.tags.length > 0 && (
            <div
              className="flex flex-wrap gap-2"
              style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--ide-border)' }}
            >
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 12,
                    fontFamily: mono,
                    color: 'var(--ide-text-4)',
                    background: 'var(--ide-bg-3)',
                    border: '1px solid var(--ide-border-medium)',
                    padding: '3px 10px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <aside
          className="shrink-0"
          style={{
            width: isMobile ? '100%' : 260,
            borderLeft: isMobile ? 'none' : '1px solid var(--ide-border)',
            borderTop: isMobile ? '1px solid var(--ide-border)' : 'none',
            background: 'var(--ide-bg-3)',
          }}
        >
          <div className="p-4">
            <div
              style={{
                fontSize: 11,
                fontFamily: sans,
                color: 'var(--ide-text-4)',
                letterSpacing: '0.12em',
                marginBottom: 16,
              }}
            >
              At a glance
            </div>

            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: 13, fontFamily: sans, color: 'var(--ide-text-4)' }}>
                Status
              </span>
              <span
                style={{ fontSize: 12, background: sc.bg, color: sc.color, padding: '2px 8px' }}
              >
                {project.status === 'IN_PROGRESS' ? 'In progress' : project.status}
              </span>
            </div>

            {project.stats.length > 0 && (
              <IDECard className="mb-4 p-3">
                {project.stats.map((s) => (
                  <div key={s.label} className="flex items-center justify-between mb-2 last:mb-0">
                    <span style={{ fontSize: 13, fontFamily: sans, color: 'var(--ide-text-4)' }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 14, fontFamily: mono, color: 'var(--ide-text-2)' }}>
                      {s.value}
                    </span>
                  </div>
                ))}
              </IDECard>
            )}

            {project.liveUrl && (
              <button
                onClick={() => router.push(project.liveUrl!)}
                className="w-full flex items-center justify-center gap-2 py-3 transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--ide-accent)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontFamily: sans,
                  fontWeight: 700,
                  color: 'var(--ide-bg-2)',
                  marginBottom: 8,
                }}
              >
                <PlayCircle size={12} />
                Open live
              </button>
            )}

            {hasLinks && (
              <div className="flex flex-col gap-2">
                {project.repoUrl && (
                  <a
                    href={`https://${project.repoUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 transition-opacity hover:opacity-90"
                    style={{
                      border: '1px solid var(--ide-border-medium)',
                      fontSize: 13,
                      fontFamily: sans,
                      fontWeight: 600,
                      color: 'var(--ide-text-3)',
                      textDecoration: 'none',
                    }}
                  >
                    <Github size={12} />
                    Source
                  </a>
                )}
                {project.npm && (
                  <a
                    href={`https://${project.npm}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 transition-opacity hover:opacity-90"
                    style={{
                      border: '1px solid var(--ide-border-medium)',
                      fontSize: 13,
                      fontFamily: sans,
                      fontWeight: 600,
                      color: 'var(--ide-text-3)',
                      textDecoration: 'none',
                    }}
                  >
                    <Package size={12} />
                    npm package
                  </a>
                )}
                {project.links?.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 transition-opacity hover:opacity-90"
                    style={{
                      border: '1px solid var(--ide-border-medium)',
                      fontSize: 13,
                      fontFamily: sans,
                      fontWeight: 600,
                      color: 'var(--ide-text-3)',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={12} />
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {project.note && (
              <p
                style={{
                  fontFamily: vietnam,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--ide-text-5)',
                  margin: '12px 0 0',
                }}
              >
                {project.note}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
