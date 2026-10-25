'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Project } from '../data/portfolio';
import { sans, serif } from '../constants/fonts';
import { eyebrow, preview } from '../constants/type';
import { Tape } from './IDECard';
import { LiveTag } from './LiveTag';
import { ProjectImage } from './ProjectImage';
import { StatusLabel } from './StatusLabel';

export function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const href = `/projects/${project.id}`;

  return (
    <Link
      href={href}
      onMouseEnter={() => router.prefetch(href)}
      className="pf-card group relative flex h-full flex-col"
      style={{
        padding: 12,
        background: 'var(--ide-bg-3)',
        borderRadius: 3,
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <Tape />
      <div style={{ overflow: 'hidden' }}>
        <ProjectImage project={project} sizes="(max-width: 900px) 100vw, 480px" />
      </div>

      <div className="flex flex-1 flex-col" style={{ padding: '20px 12px 12px' }}>
        <div className="flex flex-wrap items-center" style={{ gap: 12 }}>
          {project.liveUrl && <LiveTag />}
          {project.language && <span style={eyebrow}>{project.language}</span>}
          <StatusLabel status={project.status} />
        </div>

        <h3
          className="decoration-[var(--ide-yellow)] decoration-[3px] underline-offset-[8px] group-hover:underline"
          style={{
            fontFamily: serif,
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.2,
            color: 'var(--ide-text-1)',
            margin: '8px 0 0',
            textWrap: 'balance',
          }}
        >
          {project.name}
        </h3>

        <p
          style={{
            fontFamily: sans,
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--ide-text-3)',
            margin: '8px 0 0',
          }}
        >
          {preview(project.summary)}
        </p>

        <p
          className="mt-auto"
          style={{ fontFamily: sans, fontSize: 14, color: 'var(--ide-text-5)', paddingTop: 16 }}
        >
          {project.stack.slice(0, 4).join(', ')}
        </p>
      </div>
    </Link>
  );
}
