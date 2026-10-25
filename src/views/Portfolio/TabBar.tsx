'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useIDE } from './context/IDEContext';
import { portfolioData } from './data/portfolio';
import { sans } from './constants/fonts';
import { usePendingNavPath } from './hooks/usePendingNavPath';
import { IconButton } from './shared';

const mainTabs = [
  { name: 'about_me.md', path: '/' },
  { name: 'projects.json', path: '/projects' },
  { name: 'contact.sh', path: '/contact' },
];

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openProjectTabs, closeProjectTab } = useIDE();
  const pendingPath = usePendingNavPath();
  const effectivePath = pendingPath ?? pathname;

  useEffect(() => {
    mainTabs.forEach((tab) => router.prefetch(tab.path));
  }, [router]);

  useEffect(() => {
    openProjectTabs.forEach((id) => router.prefetch(`/projects/${id}`));
  }, [router, openProjectTabs]);

  const isActive = (path: string) => {
    if (path === '/' && effectivePath === '/') return true;
    if (path !== '/' && effectivePath.startsWith(path)) return true;
    return false;
  };

  const projectTabItems = openProjectTabs.map((id) => {
    const project = portfolioData.projects.find((p) => p.id === id);
    const ext =
      project?.language === 'Python'
        ? '.py'
        : project?.language === 'JavaScript'
          ? '.js'
          : project?.language === 'Java'
            ? '.java'
            : project?.language
              ? '.ts'
              : '.md';
    return { name: `${id}${ext}`, path: `/projects/${id}`, id };
  });

  return (
    <div
      className="shrink-0 flex items-end overflow-x-auto"
      style={{
        background: 'var(--ide-bg-1)',
        borderBottom: '1px solid var(--ide-border)',
        scrollbarWidth: 'none',
        height: 40,
      }}
    >
      <div className="flex items-end h-full">
        {mainTabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className="flex items-center gap-2 px-4 h-full shrink-0 transition-colors"
              style={{
                background: active ? 'var(--ide-bg-0)' : 'transparent',
                borderTop: 'none',
                borderRight: '1px solid var(--ide-border)',
                borderLeft: 'none',
                borderBottom: active ? '2px solid var(--ide-yellow)' : '2px solid transparent',
                cursor: 'pointer',
                color: active ? 'var(--ide-text-1)' : 'var(--ide-text-4)',
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                fontFamily: sans,
              }}
            >
              {tab.name}
            </button>
          );
        })}
        {projectTabItems.map((tab) => {
          const active = effectivePath === tab.path;
          return (
            <div
              key={tab.id}
              className="flex items-center h-full shrink-0"
              style={{
                background: active ? 'var(--ide-bg-0)' : 'transparent',
                borderRight: '1px solid var(--ide-border)',
                borderBottom: active ? '2px solid var(--ide-yellow)' : '2px solid transparent',
              }}
            >
              <button
                onClick={() => router.push(tab.path)}
                className="flex items-center gap-2 px-3 h-full"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: active ? 'var(--ide-text-1)' : 'var(--ide-text-4)',
                  fontSize: 14,
                  fontWeight: active ? 700 : 400,
                  fontFamily: sans,
                }}
              >
                {tab.name}
              </button>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  closeProjectTab(tab.id);
                  if (active) router.push('/projects');
                }}
                aria-label={`Close ${tab.name} tab`}
                size={32}
                color={active ? 'var(--ide-text-3)' : 'var(--ide-text-6)'}
                className="mr-2"
                style={{ height: '100%' }}
              >
                <X size={10} />
              </IconButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}
