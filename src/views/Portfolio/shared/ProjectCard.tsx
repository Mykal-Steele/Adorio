'use client';

import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import type { Project } from '../data/portfolio';
import { useIDE } from '../context/IDEContext';
import { useProjectNavigation } from '../hooks/useProjectNavigation';
import { sans, serif } from '../constants/fonts';
import { eyebrow } from '../constants/type';
import { Tape } from './IDECard';
import { StatusLabel } from './StatusLabel';

export function ProjectCard({ project }: { project: Project }) {
  const { addProjectTab } = useIDE();
  const { prefetchProject } = useProjectNavigation();

  return (
    <Link
      href={`/projects/${project.id}`}
      onClick={() => addProjectTab(project.id)}
      onMouseEnter={() => prefetchProject(project.id)}
      onTouchStart={() => prefetchProject(project.id)}
      className="group relative flex h-full flex-col transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5"
      style={{
        padding: 24,
        background: 'var(--ide-bg-3)',
        borderRadius: 3,
        boxShadow: 'var(--ide-card-shadow)',
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <Tape />

      <div className="flex flex-wrap items-center" style={{ gap: 16 }}>
        {project.language && <span style={eyebrow}>{project.language}</span>}
        <StatusLabel status={project.status} />
        {project.requiresAccount && (
          <span className="inline-flex items-center" style={{ ...eyebrow, gap: 4 }}>
            <Lock size={11} />
            Account
          </span>
        )}
      </div>

      <h3
        style={{
          fontFamily: serif,
          fontSize: 23,
          fontWeight: 700,
          lineHeight: 1.25,
          color: 'var(--ide-text-1)',
          margin: '12px 0 0',
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
        {project.summary}
      </p>

      <div className="mt-auto flex items-end justify-between" style={{ gap: 16, paddingTop: 20 }}>
        <span style={{ fontFamily: sans, fontSize: 14, color: 'var(--ide-text-5)' }}>
          {project.tags.slice(0, 3).join(' / ')}
        </span>
        <ArrowRight
          size={18}
          color="var(--ide-accent)"
          className="shrink-0 transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
