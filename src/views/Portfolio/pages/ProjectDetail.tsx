'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink, Package, PlayCircle } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { mono, sans, vietnam, title as titleFont } from '../constants/fonts';
import { statusConfig, codeColors } from '../constants/status';
import { Breadcrumb, Badge, IDECard } from '../shared';

const EXT_BY_LANGUAGE: Record<string, string> = {
  Rust: '.rs',
  Go: '.go',
  JavaScript: '.js',
  TypeScript: '.ts',
  Python: '.py',
  Dart: '.dart',
  'C#': '.cs',
  HTML: '.html',
};

function getCodeSnippet(id: string) {
  switch (id) {
    case 'create-adorex':
      return [
        { n: '01', code: `#!/usr/bin/env node`, type: 'comment' },
        { n: '02', code: `import { scaffold } from './scaffold.js';`, type: 'keyword' },
        { n: '03', code: `import { parseArgs } from './cli.js';`, type: 'keyword' },
        { n: '04', code: ``, type: 'empty' },
        { n: '05', code: `const { name, template } = parseArgs();`, type: 'normal' },
        { n: '06', code: ``, type: 'empty' },
        { n: '07', code: `// One template today: express-sqlite`, type: 'comment' },
        { n: '08', code: `await scaffold({ name, template });`, type: 'normal' },
        { n: '09', code: ``, type: 'empty' },
        { n: '10', code: `console.log('project ready');`, type: 'normal' },
      ];
    case 'vexta':
      return [
        { n: '01', code: `Socket socket = await Socket.connect(host, 4444);`, type: 'normal' },
        { n: '02', code: ``, type: 'empty' },
        { n: '03', code: `final jpeg = await compressFrame(cameraImage);`, type: 'normal' },
        { n: '04', code: `final header = ByteData(4)..setUint32(0, jpeg.length);`, type: 'field' },
        { n: '05', code: `socket.add(header.buffer.asUint8List());`, type: 'field' },
        { n: '06', code: `socket.add(jpeg);`, type: 'field' },
        { n: '07', code: ``, type: 'empty' },
        { n: '08', code: `// receiver decodes with the image pub package,`, type: 'comment' },
        { n: '09', code: `// then hands raw bytes to the driver via FFI.`, type: 'comment' },
      ];
    case 'cognimax':
      return [
        { n: '01', code: `def _chance_node(board, depth, lam):`, type: 'keyword' },
        { n: '02', code: `    replies = maia3.predict(board)`, type: 'normal' },
        { n: '03', code: `    scores = [`, type: 'normal' },
        { n: '04', code: `        _max_node(board.push(m), depth - 1)`, type: 'field' },
        { n: '05', code: `        for m, p in replies`, type: 'field' },
        { n: '06', code: `    ]`, type: 'normal' },
        {
          n: '07',
          code: `    # risk-sensitive weighted average, not a plain mean`,
          type: 'comment',
        },
        { n: '08', code: `    return risk_weighted(scores, replies, lam)`, type: 'normal' },
      ];
    case 'archmaster':
      return [
        { n: '01', code: `const chunks = rankChunks(question, notes);`, type: 'normal' },
        { n: '02', code: `const context = chunks.slice(0, k).join('\\n');`, type: 'normal' },
        { n: '03', code: ``, type: 'empty' },
        { n: '04', code: `const stream = await chat.sendMessageStream({`, type: 'normal' },
        { n: '05', code: `  message: \`\${context}\\n\\n\${question}\`,`, type: 'field' },
        { n: '06', code: `});`, type: 'normal' },
        { n: '07', code: `for await (const chunk of stream) render(chunk.text);`, type: 'normal' },
      ];
    case 'rhythm-dots':
      return [
        { n: '01', code: `function tick(now: number) {`, type: 'normal' },
        { n: '02', code: `  const t = audio.currentTime;`, type: 'field' },
        { n: '03', code: `  dots.forEach((d) => d.updatePosition(t));`, type: 'field' },
        { n: '04', code: `  drawFrame(ctx, dots, hitEffects);`, type: 'field' },
        { n: '05', code: `  requestAnimationFrame(tick);`, type: 'field' },
        { n: '06', code: `}`, type: 'normal' },
      ];
    case 'mistbound':
      return [
        { n: '01', code: `void Update() {`, type: 'normal' },
        { n: '02', code: `    if (Input.GetMouseButtonDown(0) && !isFrozen)`, type: 'field' },
        { n: '03', code: `        CheckQteHit(clockHandAngle);`, type: 'field' },
        { n: '04', code: `}`, type: 'normal' },
        { n: '05', code: ``, type: 'empty' },
        { n: '06', code: `// death/respawn flow: not implemented yet`, type: 'comment' },
      ];
    case 'chronochunk':
      return [
        { n: '01', code: `@bot.command()`, type: 'attr' },
        { n: '02', code: `async def guess(ctx, number: int):`, type: 'keyword' },
        { n: '03', code: `    game = games.get(ctx.author.id)`, type: 'normal' },
        { n: '04', code: `    if not game:`, type: 'normal' },
        { n: '05', code: `        return await ctx.send("start with /game first")`, type: 'field' },
        { n: '06', code: `    game.check(number)`, type: 'field' },
      ];
    case 'coding-challenges':
      return [
        { n: '01', code: `const fn = new Function(\`return \${userCode}\`)();`, type: 'normal' },
        { n: '02', code: `for (const t of testCases) {`, type: 'normal' },
        { n: '03', code: `  const result = fn(...t.input);`, type: 'field' },
        { n: '04', code: `  t.passed = deepEqual(result, t.expected);`, type: 'field' },
        { n: '05', code: `}`, type: 'normal' },
        { n: '06', code: `// runs on the main thread, not a Worker`, type: 'comment' },
      ];
    case 'data-lookup':
      return [
        { n: '01', code: `const [summary, visits, stats, details] =`, type: 'normal' },
        { n: '02', code: `  await Promise.allSettled([`, type: 'normal' },
        { n: '03', code: `    fetchPageViewSummary(),`, type: 'field' },
        { n: '04', code: `    fetchRecentVisits(),`, type: 'field' },
        { n: '05', code: `    fetchVisitorStats(),`, type: 'field' },
        { n: '06', code: `    fetchVisitorDetails(),`, type: 'field' },
        { n: '07', code: `  ]);`, type: 'normal' },
      ];
    case 'smartcity':
      return [
        { n: '01', code: `const guides = [`, type: 'normal' },
        {
          n: '02',
          code: `  { title: 'SCB DeepLink Mobile', href: '/smartcity/deeplink.html' },`,
          type: 'field',
        },
        {
          n: '03',
          code: `  { title: 'SCB Direct Debit', href: '/smartcity/direct-debit.html' },`,
          type: 'field',
        },
        { n: '04', code: `];`, type: 'normal' },
      ];
    default:
      return [
        { n: '01', code: `export default async function App() {`, type: 'normal' },
        { n: '02', code: `  return <Layout>{children}</Layout>;`, type: 'field' },
        { n: '03', code: `}`, type: 'normal' },
      ];
  }
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
  const snippet = getCodeSnippet(project.id);
  const ext = EXT_BY_LANGUAGE[project.language] ?? '.ts';

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
                Illustrative, not the literal file
              </span>
            </div>
            <div className="px-4 py-4">
              {snippet.map((line) => (
                <div key={line.n} className="flex items-start" style={{ lineHeight: '22px' }}>
                  <span
                    style={{
                      fontSize: 'var(--ide-editor-font-size, 12px)',
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
                      fontSize: 'var(--ide-editor-font-size, 12px)',
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

        {/* Right facts panel */}
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
                Facts
              </span>
              <span style={{ fontSize: 8, background: sc.bg, color: sc.color, padding: '1px 6px' }}>
                {project.status}
              </span>
            </div>

            <IDECard className="mb-4 p-3">
              {project.stats.map((s) => (
                <div key={s.label} className="flex items-center justify-between mb-2 last:mb-0">
                  <span style={{ fontSize: 9, fontFamily: sans, color: 'var(--ide-text-6)' }}>
                    {s.label}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: mono, color: 'var(--ide-text-1)' }}>
                    {s.value}
                  </span>
                </div>
              ))}
            </IDECard>

            {project.liveUrl && (
              <button
                onClick={() => router.push(project.liveUrl!)}
                className="w-full flex items-center justify-center gap-2 py-3 transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--ide-accent)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: sans,
                  fontWeight: 700,
                  color: 'var(--ide-bg-2)',
                  letterSpacing: '0.08em',
                  marginBottom: 8,
                }}
              >
                <PlayCircle size={12} />
                Open Live
              </button>
            )}

            {project.repoUrl && (
              <a
                href={`https://${project.repoUrl}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 transition-opacity hover:opacity-90"
                style={{
                  background: project.liveUrl ? 'transparent' : 'var(--ide-orange)',
                  border: project.liveUrl ? '1px solid var(--ide-border-medium)' : 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: sans,
                  fontWeight: 700,
                  color: project.liveUrl ? 'var(--ide-text-4)' : 'var(--ide-bg-2)',
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
          </div>
        </div>
      </div>
    </div>
  );
}
