'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Code2, User, FolderGit2, Mail, MoreHorizontal } from 'lucide-react';
import { sans } from '../constants/fonts';

interface MobileNavProps {
  onMoreOpen: () => void;
}

const navItems = [
  { path: '/', icon: Code2, label: 'Home' },
  { path: '/about', icon: User, label: 'About' },
  { path: '/projects', icon: FolderGit2, label: 'Projects' },
  { path: '/contact', icon: Mail, label: 'Contact' },
];

export function MobileNav({ onMoreOpen }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <div
      className="shrink-0 flex items-center justify-around"
      style={{
        height: 56,
        background: 'var(--ide-bg-0)',
        borderTop: '1px solid var(--ide-border)',
        fontFamily: sans,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {navItems.map(({ path, icon: Icon, label }) => {
        const active = isActive(path);
        return (
          <button
            key={path}
            onClick={() => router.push(path)}
            className="flex flex-col items-center gap-1"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              minWidth: 56,
            }}
          >
            <Icon
              size={18}
              color={active ? 'var(--ide-accent)' : 'var(--ide-text-6)'}
              strokeWidth={active ? 2 : 1.5}
            />
            <span
              style={{
                fontSize: 9,
                color: active ? 'var(--ide-accent)' : 'var(--ide-text-6)',
                fontWeight: active ? 600 : 400,
                letterSpacing: '0.04em',
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
      <button
        onClick={onMoreOpen}
        className="flex flex-col items-center gap-1"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          minWidth: 56,
        }}
      >
        <MoreHorizontal size={18} color="var(--ide-text-6)" strokeWidth={1.5} />
        <span style={{ fontSize: 9, color: 'var(--ide-text-6)', letterSpacing: '0.04em' }}>
          More
        </span>
      </button>
    </div>
  );
}
