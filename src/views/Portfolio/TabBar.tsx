'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CopyX, X } from 'lucide-react';
import { useIDE } from './context/IDEContext';
import { fileNameForPath } from './data/files';
import { sans } from './constants/fonts';
import { usePendingNavPath } from './hooks/usePendingNavPath';
import { FileIcon, IconButton } from './shared';

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openTabs, closeTab, closeOtherTabs } = useIDE();
  const pendingPath = usePendingNavPath();
  const activePath = pendingPath ?? pathname;

  const close = (path: string) => {
    const index = openTabs.indexOf(path);
    const next = openTabs[index + 1] ?? openTabs[index - 1] ?? '/';
    // The page on screen always keeps a tab, so its last tab can't close onto itself
    if (path === activePath && next === path) return;
    closeTab(path);
    if (path === activePath) router.push(next);
  };

  return (
    <nav
      aria-label="Open files"
      className="flex shrink-0 items-stretch"
      style={{
        height: 44,
        background: 'var(--ide-bg-1)',
        borderBottom: '1px solid var(--ide-border)',
      }}
    >
      <button
        onClick={closeOtherTabs}
        disabled={openTabs.length < 2}
        aria-label="Close other tabs"
        title="Close other tabs"
        className={`pf-tab flex shrink-0 items-center justify-center ${openTabs.length < 2 ? '' : 'ide-hover'}`}
        style={{
          width: 44,
          border: 'none',
          borderRight: '1px solid var(--ide-border)',
          background: 'transparent',
          color: 'var(--ide-text-4)',
          opacity: openTabs.length < 2 ? 0.4 : 1,
          cursor: openTabs.length < 2 ? 'default' : 'pointer',
        }}
      >
        <CopyX size={16} />
      </button>
      <div
        className="flex min-w-0 flex-1 items-stretch overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {openTabs.map((path) => {
          const active = path === activePath;
          const name = fileNameForPath(path);
          return (
            <div
              key={path}
              className={`group relative flex shrink-0 items-center ${active ? '' : 'ide-hover'}`}
              style={{
                background: active ? 'var(--ide-bg-0)' : 'transparent',
                borderRight: '1px solid var(--ide-border)',
                boxShadow: active ? 'inset 0 -2px 0 var(--ide-yellow)' : 'none',
              }}
            >
              {/* Spans the whole tab so its focus ring circles the close button too */}
              <Link
                href={path}
                aria-current={active ? 'page' : undefined}
                className="pf-tab pf-tab-open flex h-full items-center gap-2 pr-10 pl-4"
                style={{
                  textDecoration: 'none',
                  color: active ? 'var(--ide-text-1)' : 'var(--ide-text-4)',
                  fontSize: 15,
                  fontWeight: active ? 700 : 400,
                  fontFamily: sans,
                }}
              >
                <FileIcon path={path} />
                {name}
              </Link>
              <IconButton
                onClick={() => close(path)}
                aria-label={`Close ${name}`}
                size={28}
                color="var(--ide-text-5)"
                className={`pf-tab ide-hover-icon absolute top-1/2 right-1.5 -translate-y-1/2 rounded ${active ? '' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'}`}
              >
                <X size={13} />
              </IconButton>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
