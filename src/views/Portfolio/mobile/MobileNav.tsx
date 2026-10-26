'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, FolderGit2, Mail, MoreHorizontal } from 'lucide-react';
import { sans } from '../constants/fonts';
import { usePendingNavPath } from '../hooks/usePendingNavPath';

interface MobileNavProps {
  onMoreOpen: () => void;
}

const navItems = [
  { path: '/', icon: User, label: 'About' },
  { path: '/projects', icon: FolderGit2, label: 'Projects' },
  { path: '/contact', icon: Mail, label: 'Contact' },
];

export function MobileNav({ onMoreOpen }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pendingPath = usePendingNavPath();
  const effectivePath = pendingPath ?? pathname;

  // The three main pages are small and static, so get them up front. Links only prefetch
  // once they're on screen, and on desktop this bar is hidden and contact.sh is below the
  // fold in the explorer.
  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.path));
  }, [router]);

  const isActive = (path: string) => {
    if (path === '/') return effectivePath === '/';
    return effectivePath.startsWith(path);
  };

  return (
    <div
      className="shrink-0 flex items-center justify-around"
      style={{
        height: 56,
        background: 'var(--ide-bg-1)',
        borderTop: '1px solid var(--ide-border)',
        fontFamily: sans,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {navItems.map(({ path, icon: Icon, label }) => {
        const active = isActive(path);
        return (
          <Link
            key={path}
            href={path}
            aria-current={active ? 'page' : undefined}
            className="flex flex-col items-center gap-1"
            style={{
              textDecoration: 'none',
              padding: '4px 0',
              minWidth: 56,
              borderTop: active ? '2px solid var(--ide-yellow)' : '2px solid transparent',
            }}
          >
            <Icon
              size={20}
              color={active ? 'var(--ide-text-1)' : 'var(--ide-text-6)'}
              strokeWidth={active ? 2 : 1.5}
            />
            <span
              style={{
                fontSize: 12,
                color: active ? 'var(--ide-text-1)' : 'var(--ide-text-6)',
                fontWeight: active ? 700 : 400,
              }}
            >
              {label}
            </span>
          </Link>
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
          borderTop: '2px solid transparent',
        }}
      >
        <MoreHorizontal size={20} color="var(--ide-text-6)" strokeWidth={1.5} />
        <span style={{ fontSize: 12, color: 'var(--ide-text-6)' }}>More</span>
      </button>
    </div>
  );
}
