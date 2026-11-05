'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { IntentLink } from '@/components/IntentLink';
import { ChevronRight, Folder as FolderClosed, FolderOpen } from 'lucide-react';
import { portfolioData } from './data/portfolio';
import {
  CERTIFICATES_INDEX,
  ROOT_FILES,
  certificateFileName,
  initialOpenFolders,
  projectFileName,
} from './data/files';
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

// A real link, so it opens in a new tab like any other. The explorer lists 30 odd pages, so
// each one is fetched when pointed at, focused or touched, not all of them on load.
function FileRow({ path, name, depth }: { path: string; name: string; depth: number }) {
  const pathname = usePathname();
  const active = (usePendingNavPath() ?? pathname) === path;

  return (
    <IntentLink
      href={path}
      onlyOnIntent
      aria-current={active ? 'page' : undefined}
      className={active ? '' : 'ide-hover'}
      style={{
        ...rowStyle,
        textDecoration: 'none',
        paddingLeft: 14 + depth * 22,
        background: active ? 'var(--ide-border-subtle)' : 'transparent',
        boxShadow: active ? 'inset 2px 0 0 var(--ide-yellow)' : 'none',
        color: active ? 'var(--ide-text-1)' : 'var(--ide-text-3)',
        fontWeight: active ? 700 : 400,
      }}
    >
      <FileIcon path={path} />
      <span className="truncate">{name}</span>
    </IntentLink>
  );
}

function Folder({
  name,
  color,
  open,
  onToggle,
  depth = 0,
  children,
}: {
  name: string;
  color: string;
  open: boolean;
  depth?: number;
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
          paddingLeft: 8 + depth * 22,
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
              left: 15 + depth * 22,
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

// The shell renders it inline on wide screens and inside a drawer below lg
export function SidePanel({ inDrawer = false }: { inDrawer?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() => initialOpenFolders(pathname));
  const toggle = (folder: keyof typeof open) =>
    setOpen((prev) => ({ ...prev, [folder]: !prev[folder] }));

  return (
    <nav
      aria-label="Explorer"
      className="shrink-0 flex flex-col overflow-hidden"
      style={{
        width: inDrawer ? '100%' : 268,
        background: 'var(--ide-bg-1)',
        borderRight: inDrawer ? 'none' : '1px solid var(--ide-border)',
      }}
    >
      {!inDrawer && (
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
      <div className="pf-scroll-hover flex-1 overflow-y-auto py-2">
        {ROOT_FILES.slice(0, 2).map((f) => (
          <FileRow key={f.path} path={f.path} name={f.name} depth={0} />
        ))}
        <Folder
          name="projects"
          color="var(--ide-blue)"
          open={open.projects}
          onToggle={() => toggle('projects')}
        >
          {portfolioData.projects.map((p) => (
            <FileRow key={p.id} path={`/projects/${p.id}`} name={projectFileName(p.id)} depth={1} />
          ))}
        </Folder>
        <Folder
          name="skills"
          color="var(--ide-orange)"
          open={open.skills}
          onToggle={() => toggle('skills')}
        >
          {portfolioData.skills.map((s) => (
            <FileRow key={s.id} path={`/skills/${s.id}`} name={`${s.id}.md`} depth={1} />
          ))}
        </Folder>
        <Folder
          name="certificates"
          color="var(--ide-green)"
          open={open.certificates}
          onToggle={() => toggle('certificates')}
        >
          <FileRow path={CERTIFICATES_INDEX.path} name={CERTIFICATES_INDEX.name} depth={1} />
          {portfolioData.certificates.map((c) => (
            <FileRow
              key={c.id}
              path={`/certificates/${c.id}`}
              name={certificateFileName(c.id)}
              depth={1}
            />
          ))}
        </Folder>
        <FileRow path={ROOT_FILES[2].path} name={ROOT_FILES[2].name} depth={0} />
      </div>
    </nav>
  );
}
