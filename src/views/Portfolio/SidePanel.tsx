'use client';

import { useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Folder as FolderClosed, FolderOpen } from 'lucide-react';
import { portfolioData } from './data/portfolio';
import { ROOT_FILES, projectFileName } from './data/files';
import { useResponsive } from './hooks/useResponsive';
import { usePendingNavPath } from './hooks/usePendingNavPath';
import { sans } from './constants/fonts';
import { FileIcon } from './shared';

const rowStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  height: 36,
  paddingRight: 12,
  border: 'none',
  cursor: 'pointer',
  fontFamily: sans,
  fontSize: 15.5,
  textAlign: 'left',
} as const;

function FileRow({ path, name, depth }: { path: string; name: string; depth: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const active = (usePendingNavPath() ?? pathname) === path;

  return (
    <button
      onClick={() => router.push(path)}
      onMouseEnter={() => router.prefetch(path)}
      aria-current={active ? 'page' : undefined}
      className={active ? '' : 'ide-hover'}
      style={{
        ...rowStyle,
        paddingLeft: 14 + depth * 22,
        background: active ? 'var(--ide-border-subtle)' : 'transparent',
        boxShadow: active ? 'inset 2px 0 0 var(--ide-yellow)' : 'none',
        color: active ? 'var(--ide-text-1)' : 'var(--ide-text-3)',
        fontWeight: active ? 700 : 400,
      }}
    >
      <FileIcon path={path} />
      <span className="truncate">{name}</span>
    </button>
  );
}

function Folder({
  name,
  color,
  open,
  onToggle,
  children,
}: {
  name: string;
  color: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const Icon = open ? FolderOpen : FolderClosed;
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="ide-hover"
        style={{
          ...rowStyle,
          paddingLeft: 8,
          gap: 6,
          background: 'transparent',
          color: 'var(--ide-text-1)',
          fontWeight: 600,
        }}
      >
        <ChevronRight
          size={16}
          color="var(--ide-text-5)"
          style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 150ms ease' }}
        />
        <Icon size={17} color={color} fill={color} fillOpacity={0.25} strokeWidth={1.75} />
        {name}
      </button>
      {open && (
        <div style={{ position: 'relative' }}>
          {/* Indent guide, like an editor's tree */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 15,
              top: 0,
              bottom: 0,
              width: 1,
              background: 'var(--ide-border-strong)',
            }}
          />
          {children}
        </div>
      )}
    </div>
  );
}

export function SidePanel() {
  const pathname = usePathname();
  const { isMobile, isTablet } = useResponsive();
  const [projectsOpen, setProjectsOpen] = useState(pathname.startsWith('/projects/'));
  const [skillsOpen, setSkillsOpen] = useState(true);
  const isInDrawer = isMobile || isTablet;

  return (
    <nav
      aria-label="Explorer"
      className="shrink-0 flex flex-col overflow-hidden"
      style={{
        width: isInDrawer ? '100%' : 268,
        background: 'var(--ide-bg-1)',
        borderRight: isInDrawer ? 'none' : '1px solid var(--ide-border)',
      }}
    >
      {!isInDrawer && (
        <div
          className="shrink-0 px-3 py-2"
          style={{
            borderBottom: '1px solid var(--ide-border)',
            fontSize: 14,
            fontFamily: sans,
            fontWeight: 700,
            color: 'var(--ide-text-4)',
          }}
        >
          Explorer
        </div>
      )}
      <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'thin' }}>
        {ROOT_FILES.slice(0, 2).map((f) => (
          <FileRow key={f.path} path={f.path} name={f.name} depth={0} />
        ))}
        <Folder
          name="projects"
          color="var(--ide-blue)"
          open={projectsOpen}
          onToggle={() => setProjectsOpen((v) => !v)}
        >
          {portfolioData.projects.map((p) => (
            <FileRow key={p.id} path={`/projects/${p.id}`} name={projectFileName(p.id)} depth={1} />
          ))}
        </Folder>
        <Folder
          name="skills"
          color="var(--ide-orange)"
          open={skillsOpen}
          onToggle={() => setSkillsOpen((v) => !v)}
        >
          {portfolioData.skills.map((s) => (
            <FileRow key={s.id} path={`/skills/${s.id}`} name={`${s.id}.md`} depth={1} />
          ))}
        </Folder>
        <FileRow path={ROOT_FILES[2].path} name={ROOT_FILES[2].name} depth={0} />
      </div>
    </nav>
  );
}
