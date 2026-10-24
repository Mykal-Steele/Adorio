'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Code2,
  Lock,
  MessagesSquare,
  Nfc,
  Package,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { Project } from '../data/portfolio';
import { useIDE } from '../context/IDEContext';
import { useProjectNavigation } from '../hooks/useProjectNavigation';
import { mono, sans, vietnam } from '../constants/fonts';
import { statusConfig } from '../constants/status';
import { Badge } from './Badge';

const COVER_ICONS: Record<string, LucideIcon> = {
  chronochunk: Bot,
  'smartcity-financial': Wallet,
  'coding-challenges': Code2,
  'nfc-attendance': Nfc,
  'create-adorex': Package,
  social: MessagesSquare,
  cognimax: BrainCircuit,
  uniloom: Users,
};

function ProjectCover({ project, compact }: { project: Project; compact: boolean }) {
  const Icon = COVER_ICONS[project.id] ?? Code2;
  const height = compact ? 104 : 176;

  return (
    <div
      style={{
        position: 'relative',
        height,
        overflow: 'hidden',
        borderBottom: '2px solid var(--nb-border)',
        background: `linear-gradient(135deg, ${project.color}26, var(--ide-bg-1) 58%, var(--ide-bg-2))`,
      }}
    >
      {project.coverImage ? (
        <>
          <Image
            src={project.coverImage}
            alt={project.coverAlt ?? project.name}
            fill
            sizes={compact ? '(max-width: 900px) 100vw, 33vw' : '(max-width: 900px) 100vw, 50vw'}
            style={{ objectFit: 'cover', objectPosition: 'top' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.82) 100%)',
            }}
          />
        </>
      ) : (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(var(--ide-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--ide-border-subtle) 1px, transparent 1px)',
              backgroundSize: compact ? '18px 18px' : '26px 26px',
              opacity: 0.6,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: compact ? 12 : 18,
              right: compact ? 12 : 18,
              width: compact ? 40 : 62,
              height: compact ? 40 : 62,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: project.color,
              border: '2px solid var(--nb-border)',
              boxShadow: '3px 3px 0 var(--nb-shadow)',
            }}
          >
            <Icon size={compact ? 20 : 30} color="#2b2723" strokeWidth={2} />
          </div>
        </>
      )}

      <div
        style={{
          position: 'absolute',
          left: compact ? 14 : 18,
          right: 14,
          bottom: compact ? 12 : 16,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: project.coverImage ? 0 : '2px 6px',
            fontFamily: mono,
            fontSize: compact ? 10 : 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: project.coverImage ? '#ffffff' : 'var(--ide-text-2)',
            background: project.coverImage ? 'transparent' : 'var(--ide-bg-0)',
            border: project.coverImage ? 'none' : '1.5px solid var(--nb-border)',
          }}
        >
          {project.tags.slice(0, 2).join(' · ') || project.status.replace('_', ' ')}
        </div>
        <div
          style={{
            marginTop: 2,
            fontFamily: sans,
            fontSize: compact ? 15 : 23,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            color: project.coverImage ? '#ffffff' : 'var(--ide-text-1)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.name}
        </div>
      </div>
    </div>
  );
}

export function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  const { addProjectTab } = useIDE();
  const { prefetchProject } = useProjectNavigation();
  const status = statusConfig[project.status] ?? statusConfig.STABLE;

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--ide-bg-2)',
        border: '2px solid var(--nb-border)',
        boxShadow: '4px 4px 0 var(--nb-shadow)',
        overflow: 'hidden',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
      }}
    >
      <Link
        href={`/projects/${project.id}`}
        onClick={() => addProjectTab(project.id)}
        onMouseEnter={(e) => {
          prefetchProject(project.id);
          const card = e.currentTarget.parentElement as HTMLElement | null;
          if (card) {
            card.style.transform = 'translate(-2px, -2px)';
            card.style.boxShadow = '6px 6px 0 var(--nb-shadow)';
          }
        }}
        onMouseLeave={(e) => {
          const card = e.currentTarget.parentElement as HTMLElement | null;
          if (card) {
            card.style.transform = 'translate(0, 0)';
            card.style.boxShadow = '4px 4px 0 var(--nb-shadow)';
          }
        }}
        onTouchStart={() => prefetchProject(project.id)}
        aria-label={`Open ${project.name}`}
        className="flex flex-col flex-1 text-left h-full"
        style={{
          color: 'inherit',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <ProjectCover project={project} compact={compact} />

        <div className="flex flex-col flex-1" style={{ padding: compact ? 12 : 20 }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {project.language && (
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: compact ? 11 : 12,
                    color: project.langColor ?? 'var(--ide-text-4)',
                  }}
                >
                  {project.language}
                </span>
              )}
              <Badge color={status.color} bg={status.bg} style={{ fontSize: compact ? 10 : 11 }}>
                {status.label}
              </Badge>
              {project.requiresAccount && (
                <span
                  className="inline-flex items-center gap-1"
                  style={{ fontFamily: sans, fontSize: 11, color: 'var(--ide-text-5)' }}
                >
                  <Lock size={10} />
                  Account
                </span>
              )}
            </div>
            <ArrowRight size={15} color="var(--ide-text-5)" style={{ flexShrink: 0 }} />
          </div>

          {!compact && (
            <>
              <p
                style={{
                  margin: '10px 0 0',
                  fontFamily: vietnam,
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: 'var(--ide-text-3)',
                }}
              >
                {project.summary}
              </p>
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5" style={{ marginTop: 14 }}>
                  {project.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        color: 'var(--ide-text-4)',
                        background: 'var(--ide-bg-4)',
                        padding: '2px 6px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Link>
    </article>
  );
}
