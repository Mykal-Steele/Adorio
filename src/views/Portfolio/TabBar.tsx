'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useIDE } from './context/IDEContext';
import { fileNameForPath } from './data/files';
import { sans } from './constants/fonts';
import { usePendingNavPath } from './hooks/usePendingNavPath';
import { FileIcon, IconButton } from './shared';

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openTabs, closeTab } = useIDE();
  const pendingPath = usePendingNavPath();
  const activePath = pendingPath ?? pathname;

  useEffect(() => {
    openTabs.forEach((path) => router.prefetch(path));
  }, [router, openTabs]);

  const close = (path: string) => {
    closeTab(path);
    if (path !== activePath) return;
    const index = openTabs.indexOf(path);
    const next = openTabs[index + 1] ?? openTabs[index - 1] ?? '/';
    router.push(next === path ? '/' : next);
  };

  return (
    <nav
      aria-label="Open files"
      className="shrink-0 flex items-stretch overflow-x-auto"
      style={{
        height: 44,
        background: 'var(--ide-bg-1)',
        borderBottom: '1px solid var(--ide-border)',
        scrollbarWidth: 'none',
      }}
    >
      {openTabs.map((path) => {
        const active = path === activePath;
        const name = fileNameForPath(path);
        return (
          <div
            key={path}
            className={`group flex shrink-0 items-center ${active ? '' : 'ide-hover'}`}
            style={{
              background: active ? 'var(--ide-bg-0)' : 'transparent',
              borderRight: '1px solid var(--ide-border)',
              boxShadow: active ? 'inset 0 -2px 0 var(--ide-yellow)' : 'none',
            }}
          >
            <button
              aria-current={active ? 'page' : undefined}
              onClick={() => router.push(path)}
              className="flex h-full items-center gap-2 pl-4 pr-1"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: active ? 'var(--ide-text-1)' : 'var(--ide-text-4)',
                fontSize: 15,
                fontWeight: active ? 700 : 400,
                fontFamily: sans,
              }}
            >
              <FileIcon path={path} />
              {name}
            </button>
            <IconButton
              onClick={() => close(path)}
              aria-label={`Close ${name}`}
              size={28}
              color="var(--ide-text-5)"
              className={`ide-hover-icon mr-1.5 rounded ${active ? '' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'}`}
            >
              <X size={13} />
            </IconButton>
          </div>
        );
      })}
    </nav>
  );
}
