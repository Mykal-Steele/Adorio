'use client';

import { useRouter } from 'next/navigation';
import { Circle, ExternalLink, Package } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { mono, sans, vietnam, title as titleFont } from '../constants/fonts';
import { statusConfig, codeColors } from '../constants/status';
import { Breadcrumb, Badge, IDECard } from '../shared';

function getCodeSnippet(proj: (typeof portfolioData.projects)[0]) {
  if (proj.language === 'Rust') {
    return {
      lines: [
        { n: '01', code: `use axum::{Router, routing::get};`, type: 'keyword' },
        { n: '02', code: `use sqlx::PgPool;`, type: 'keyword' },
        { n: '03', code: ``, type: 'empty' },
        { n: '04', code: `#[derive(Debug, serde::Serialize)]`, type: 'attr' },
        { n: '05', code: `pub struct AppState {`, type: 'normal' },
        { n: '06', code: `    db: PgPool,`, type: 'field' },
        { n: '07', code: `}`, type: 'normal' },
        { n: '08', code: ``, type: 'empty' },
        { n: '09', code: `#[tokio::main]`, type: 'attr' },
        { n: '10', code: `async fn main() {`, type: 'normal' },
        { n: '11', code: `    let pool = PgPool::connect(&db_url).await?;`, type: 'normal' },
        { n: '12', code: `    // Build Axum router with state`, type: 'comment' },
        { n: '13', code: `    let app = Router::new()`, type: 'normal' },
        { n: '14', code: `        .route("/health", get(health_check))`, type: 'field' },
        { n: '15', code: `        .with_state(AppState { db: pool });`, type: 'normal' },
      ],
    };
  }
  if (proj.id === 'create-adorex') {
    return {
      lines: [
        { n: '01', code: `#!/usr/bin/env node`, type: 'comment' },
        { n: '02', code: `import { scaffold } from './scaffold';`, type: 'keyword' },
        { n: '03', code: `import { parseArgs } from './cli';`, type: 'keyword' },
        { n: '04', code: ``, type: 'empty' },
        { n: '05', code: `const { name, template } = parseArgs();`, type: 'normal' },
        { n: '06', code: ``, type: 'empty' },
        { n: '07', code: `// Supported templates:`, type: 'comment' },
        { n: '08', code: `// hono | react | astro | elysia`, type: 'comment' },
        { n: '09', code: `await scaffold({`, type: 'normal' },
        { n: '10', code: `  name,`, type: 'field' },
        { n: '11', code: `  template,`, type: 'field' },
        { n: '12', code: `  withTypeScript: true,`, type: 'field' },
        { n: '13', code: `});`, type: 'normal' },
        { n: '14', code: ``, type: 'empty' },
        { n: '15', code: `console.log('✓ Project ready. Run: bun dev');`, type: 'normal' },
      ],
    };
  }
  if (proj.language === 'TypeScript') {
    return {
      lines: [
        { n: '01', code: `import { Hono } from 'hono';`, type: 'keyword' },
        { n: '02', code: `import { jwt } from 'hono/jwt';`, type: 'keyword' },
        { n: '03', code: ``, type: 'empty' },
        { n: '04', code: `const app = new Hono();`, type: 'normal' },
        { n: '05', code: ``, type: 'empty' },
        { n: '06', code: `app.use('/api/*', jwt({ secret: env.JWT_SECRET }));`, type: 'normal' },
        { n: '07', code: ``, type: 'empty' },
        { n: '08', code: `app.get('/api/health', (c) => {`, type: 'normal' },
        { n: '09', code: `  return c.json({ status: 'ok' });`, type: 'field' },
        { n: '10', code: `});`, type: 'normal' },
        { n: '11', code: ``, type: 'empty' },
        { n: '12', code: `export default { fetch: app.fetch };`, type: 'normal' },
        { n: '13', code: `// Runs on Bun: bun run index.ts`, type: 'comment' },
        { n: '14', code: ``, type: 'empty' },
        { n: '15', code: ``, type: 'empty' },
      ],
    };
  }
  return {
    lines: [
      { n: '01', code: `package main`, type: 'keyword' },
      { n: '02', code: ``, type: 'empty' },
      { n: '03', code: `import (`, type: 'normal' },
      { n: '04', code: `    "net/http"`, type: 'field' },
      { n: '05', code: `    "time"`, type: 'field' },
      { n: '06', code: `)`, type: 'normal' },
      { n: '07', code: ``, type: 'empty' },
      { n: '08', code: `func main() {`, type: 'normal' },
      { n: '09', code: `    mux := http.NewServeMux()`, type: 'field' },
      { n: '10', code: `    mux.HandleFunc("/health", healthCheck)`, type: 'field' },
      { n: '11', code: `    server := &http.Server{`, type: 'field' },
      { n: '12', code: `        Addr: ":8080",`, type: 'field' },
      { n: '13', code: `        ReadTimeout: 10 * time.Second,`, type: 'field' },
      { n: '14', code: `    }`, type: 'field' },
      { n: '15', code: `}`, type: 'normal' },
    ],
  };
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
        <div style={{ fontSize: 14, marginBottom: 12 }}>// Project not found</div>
        <button
          onClick={() => router.push('/projects')}
          style={{
            color: 'var(--ide-accent)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: mono,
            fontSize: 12,
          }}
        >
          ← cd ../projects
        </button>
      </div>
    );
  }

  const sc = statusConfig[project.status] || statusConfig.STABLE;
  const snippet = getCodeSnippet(project);
  const ext =
    project.language === 'Rust'
      ? '.rs'
      : project.language === 'Go'
        ? '.go'
        : project.language === 'JavaScript'
          ? '.js'
          : '.ts';
  const kernelColor =
    project.kernelSync === 'STABLE'
      ? 'var(--ide-accent)'
      : project.kernelSync === 'SYNCING'
        ? 'var(--ide-orange)'
        : 'var(--ide-pink)';

  return (
    <div className="flex flex-col" style={{ minHeight: '100%' }}>
      <Breadcrumb
        segments={['src', 'projects', `${project.id}${ext}`]}
        language={project.language}
      />

      <div className={`flex ${isMobile ? 'flex-col' : ''} flex-1`}>
        {/* Main content */}
        <div className={`flex-1 ${isMobile ? 'p-4' : 'p-8'}`}>
          <h1
            style={{
              fontSize: 36,
              fontFamily: titleFont,
              fontWeight: 700,
              color: 'var(--ide-text-1)',
              letterSpacing: '-1px',
              marginBottom: 8,
              margin: '0 0 8px',
            }}
          >
            {project.name.replace(/-/g, '_')}
          </h1>
          <div
            style={{ width: 48, height: 3, background: 'var(--ide-orange)', marginBottom: 24 }}
          />

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Badge
              color={sc.color}
              bg={sc.bg}
              style={{ padding: '3px 10px', letterSpacing: '0.08em' }}
            >
              ■ {project.status}
            </Badge>
            <span
              style={{
                fontSize: 10,
                fontFamily: mono,
                color: project.langColor,
                background: `${project.langColor}18`,
                padding: '2px 8px',
              }}
            >
              _{project.language}
            </span>
            <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-text-7)' }}>
              ⎇ {project.branch}
            </span>
            {project.npm && (
              <a
                href={`https://${project.npm}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 9,
                  fontFamily: sans,
                  color: '#cb3837',
                  background: 'rgba(203,56,55,0.1)',
                  border: '1px solid rgba(203,56,55,0.3)',
                  padding: '2px 8px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  letterSpacing: '0.06em',
                }}
              >
                <Package size={9} />
                NPM
              </a>
            )}
          </div>

          <div
            style={{
              fontSize: 15,
              fontFamily: vietnam,
              color: 'var(--ide-text-2)',
              lineHeight: 1.8,
              marginBottom: 32,
              maxWidth: 520,
            }}
          >
            {project.description}
          </div>

          <div
            className="mb-8 px-5 py-5"
            style={{ background: 'var(--ide-bg-2)', borderLeft: '2px solid var(--ide-text-5)' }}
          >
            <div
              style={{
                fontSize: 9,
                fontFamily: sans,
                color: 'var(--ide-text-5)',
                letterSpacing: '0.12em',
                marginBottom: 8,
              }}
            >
              // Architecture Notes
            </div>
            <div
              style={{
                fontSize: 13,
                fontFamily: vietnam,
                fontStyle: 'italic',
                color: 'var(--ide-text-4)',
                lineHeight: 1.7,
              }}
            >
              "{project.archNote}"
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  fontFamily: mono,
                  color: 'var(--ide-text-5)',
                  background: 'var(--ide-bg-3)',
                  border: '1px solid var(--ide-border-medium)',
                  padding: '3px 10px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div
            style={{
              background: 'var(--ide-bg-1)',
              border: '1px solid var(--ide-border)',
              marginBottom: 8,
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2"
              style={{ borderBottom: '1px solid var(--ide-border)' }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontFamily: mono,
                  color: 'var(--ide-text-6)',
                  marginLeft: 12,
                }}
              >
                {project.id}
                {ext}
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 9,
                  fontFamily: sans,
                  color: 'var(--ide-text-7)',
                }}
              >
                Read Only
              </span>
            </div>
            <div className="px-4 py-4">
              {snippet.lines.map((line) => (
                <div key={line.n} className="flex items-start" style={{ lineHeight: '22px' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: mono,
                      color: 'var(--ide-line-number)',
                      width: 32,
                      flexShrink: 0,
                      textAlign: 'right',
                      paddingRight: 16,
                    }}
                  >
                    {line.n}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: mono,
                      color: codeColors[line.type] || 'var(--ide-text-1)',
                    }}
                  >
                    {line.code}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {project.repoUrl && (
            <a
              href={`https://${project.repoUrl}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 mt-4"
              style={{
                fontSize: 10,
                fontFamily: mono,
                color: 'var(--ide-text-6)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--ide-accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--ide-text-6)';
              }}
            >
              <ExternalLink size={10} />
              {project.repoUrl}
            </a>
          )}
        </div>

        {/* Right metrics panel */}
        <div
          className="shrink-0"
          style={{
            width: isMobile ? '100%' : 240,
            borderLeft: isMobile ? 'none' : '1px solid var(--ide-border)',
            borderTop: isMobile ? '1px solid var(--ide-border)' : 'none',
            background: 'var(--ide-bg-3)',
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span
                style={{
                  fontSize: 9,
                  fontFamily: sans,
                  color: 'var(--ide-text-5)',
                  letterSpacing: '0.12em',
                }}
              >
                System Metrics
              </span>
              <span style={{ fontSize: 8, background: sc.bg, color: sc.color, padding: '1px 6px' }}>
                {project.status}
              </span>
            </div>

            {project.status !== 'DEPRECATED' && (
              <>
                <div className="mb-4">
                  <div
                    style={{
                      fontSize: 8,
                      fontFamily: sans,
                      color: 'var(--ide-text-6)',
                      marginBottom: 4,
                      letterSpacing: '0.08em',
                    }}
                  >
                    Memory Usage
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span style={{ fontSize: 18, fontFamily: mono, color: 'var(--ide-text-1)' }}>
                      {project.mem}
                    </span>
                  </div>
                  <div style={{ height: 2, background: 'var(--ide-border)', marginTop: 6 }}>
                    <div
                      style={{ height: '100%', width: '35%', background: 'var(--ide-accent)' }}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div
                    style={{
                      fontSize: 8,
                      fontFamily: sans,
                      color: 'var(--ide-text-6)',
                      marginBottom: 4,
                      letterSpacing: '0.08em',
                    }}
                  >
                    Latency
                  </div>
                  <div style={{ fontSize: 18, fontFamily: mono, color: 'var(--ide-orange)' }}>
                    {project.latency}
                  </div>
                  <div style={{ height: 2, background: 'var(--ide-border)', marginTop: 6 }}>
                    <div
                      style={{ height: '100%', width: '12%', background: 'var(--ide-orange)' }}
                    />
                  </div>
                </div>

                <IDECard className="mb-4 p-3">
                  {[
                    { label: 'Thread Pool', value: project.threadPool },
                    { label: 'CPU Util', value: project.cpu },
                    { label: 'Uptime', value: project.uptime },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-text-6)' }}>
                        {m.label}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: mono, color: 'var(--ide-text-1)' }}>
                        {m.value}
                      </span>
                    </div>
                  ))}
                </IDECard>

                <div
                  className="mb-4 p-3"
                  style={{ background: `${kernelColor}10`, border: `1px solid ${kernelColor}30` }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      fontFamily: sans,
                      color: 'var(--ide-text-6)',
                      marginBottom: 4,
                    }}
                  >
                    Kernel Sync
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle size={6} fill={kernelColor} color={kernelColor} />
                    <span style={{ fontSize: 11, fontFamily: mono, color: kernelColor }}>
                      {project.kernelSync}
                    </span>
                  </div>
                </div>

                {project.repoUrl && (
                  <a
                    href={`https://${project.repoUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 transition-opacity hover:opacity-90"
                    style={{
                      background: 'var(--ide-orange)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontFamily: sans,
                      fontWeight: 700,
                      color: 'var(--ide-bg-2)',
                      letterSpacing: '0.08em',
                      marginBottom: 8,
                      textDecoration: 'none',
                      display: 'flex',
                    }}
                  >
                    <ExternalLink size={12} />
                    View Source
                  </a>
                )}
              </>
            )}

            {project.status === 'DEPRECATED' && (
              <div
                className="p-3 mb-4"
                style={{
                  background: 'var(--ide-pink-a12)',
                  border: '1px solid var(--ide-pink-a12)',
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: sans,
                    color: 'var(--ide-pink)',
                    marginBottom: 4,
                  }}
                >
                  DEPRECATED
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: vietnam,
                    color: 'var(--ide-text-5)',
                    lineHeight: 1.5,
                  }}
                >
                  This project is archived. Superseded by newer tooling in the stack.
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mt-4">
              <div style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-text-6)' }}>
                ★ {project.stars}
              </div>
              <div style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-text-7)' }}>
                #{project.commitHash}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
