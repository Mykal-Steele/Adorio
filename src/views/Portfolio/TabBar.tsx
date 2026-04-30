'use client';

import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useIDE } from './context/IDEContext';
import { portfolioData } from './data/portfolio';
import { sans } from './constants/fonts';

const mainTabs = [
  { name: 'dashboard.tsx', path: '/', color: 'var(--ide-orange)' },
  { name: 'about_me.md', path: '/about', color: 'var(--ide-text-4)' },
  { name: 'projects.json', path: '/projects', color: 'var(--ide-accent-light)' },
  { name: 'contact.sh', path: '/contact', color: 'var(--ide-purple)' },
];

function dotColor(name: string): string {
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return 'var(--ide-orange)';
  if (name.endsWith('.json')) return 'var(--ide-accent-light)';
  if (name.endsWith('.md')) return 'var(--ide-text-4)';
  if (name.endsWith('.sh')) return 'var(--ide-purple)';
  if (name.endsWith('.rs')) return 'var(--ide-red-dark)';
  if (name.endsWith('.go')) return 'var(--ide-cyan)';
  return 'var(--ide-text-4)';
}

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openProjectTabs, closeProjectTab } = useIDE();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const projectTabItems = openProjectTabs.map((id) => {
    const project = portfolioData.projects.find((p) => p.id === id);
    const ext = project?.language === 'Rust' ? '.rs' : project?.language === 'Go' ? '.go' : '.ts';
    return { name: `${id}${ext}`, path: `/projects/${id}`, id };
  });

  return (
    <div
      className="shrink-0 flex items-end overflow-x-auto"
      style={{
        background: 'var(--ide-bg-3)',
        borderBottom: '1px solid var(--ide-border)',
        scrollbarWidth: 'none',
        height: 36,
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
                background: active ? 'var(--ide-bg-4)' : 'transparent',
                borderTop: active ? '1px solid var(--ide-accent)' : '1px solid transparent',
                borderRight: '1px solid var(--ide-border)',
                borderLeft: 'none',
                borderBottom: 'none',
                cursor: 'pointer',
                color: active ? 'var(--ide-text-1)' : 'var(--ide-text-5)',
                fontSize: 11,
                fontFamily: sans,
              }}
            >
              <span style={{ color: dotColor(tab.name), fontSize: 8 }}>●</span>
              {tab.name}
            </button>
          );
        })}
        {projectTabItems.map((tab) => {
          const active = pathname === tab.path;
          return (
            <div
              key={tab.id}
              className="flex items-center h-full shrink-0"
              style={{
                background: active ? 'var(--ide-bg-4)' : 'transparent',
                borderTop: active ? '1px solid var(--ide-accent)' : '1px solid transparent',
                borderRight: '1px solid var(--ide-border)',
              }}
            >
              <button
                onClick={() => router.push(tab.path)}
                className="flex items-center gap-2 px-3 h-full"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: active ? 'var(--ide-text-1)' : 'var(--ide-text-5)',
                  fontSize: 11,
                  fontFamily: sans,
                }}
              >
                <span style={{ color: dotColor(tab.name), fontSize: 8 }}>●</span>
                {tab.name}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeProjectTab(tab.id);
                  if (active) router.push('/projects');
                }}
                className="flex items-center justify-center mr-2"
                style={{
                  width: 16,
                  height: 16,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ide-text-6)',
                  padding: 0,
                }}
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
