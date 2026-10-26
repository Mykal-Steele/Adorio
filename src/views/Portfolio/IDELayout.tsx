'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Folder, Terminal as TerminalIcon, GithubIcon, LinkedinIcon } from 'lucide-react';

import { TitleBar } from './TitleBar';
import { ActivityBar } from './ActivityBar';
import { SidePanel } from './SidePanel';
import { TabBar } from './TabBar';
import { StatusBar } from './StatusBar';
import { Terminal } from './Terminal';
import { useIDE } from './context/IDEContext';
import { MobileHeader } from './mobile/MobileHeader';
import { MobileNav } from './mobile/MobileNav';
import { MobileDrawer } from './mobile/MobileDrawer';
import { IDEProvider } from './context/IDEContext';
import { portfolioData } from './data/portfolio';
import { sans } from './constants/fonts';
import { eyebrow } from './constants/type';
import { NavigationProgressBar } from './shared/NavigationProgressBar';
import { SettingsButton } from './shared';

type MobileDrawerType = 'explorer' | 'terminal' | 'more' | null;

function MobileMoreMenu({
  onOpenTerminal,
  onOpenExplorer,
  onClose,
}: {
  onOpenTerminal: () => void;
  onOpenExplorer: () => void;
  onClose: () => void;
}) {
  const menuItems = [
    {
      icon: <TerminalIcon size={16} color="var(--ide-text-3)" />,
      label: 'Terminal',
      sub: 'Interactive command line',
      action: onOpenTerminal,
    },
    {
      icon: <Folder size={16} color="var(--ide-text-3)" />,
      label: 'File Explorer',
      sub: 'Browse portfolio files',
      action: onOpenExplorer,
    },
  ];
  return (
    <div className="py-2">
      {menuItems.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            onClose();
            setTimeout(item.action, 100);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-left ide-hover"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderBottom: '1px solid var(--ide-border-subtle)',
          }}
        >
          {item.icon}
          <div>
            <div
              style={{
                fontSize: 15,
                fontFamily: sans,
                color: 'var(--ide-text-1)',
                fontWeight: 700,
              }}
            >
              {item.label}
            </div>
            <div style={{ fontSize: 13, fontFamily: sans, color: 'var(--ide-text-4)' }}>
              {item.sub}
            </div>
          </div>
        </button>
      ))}
      <div className="px-4 pt-4 pb-2" style={{ borderTop: '1px solid var(--ide-border)' }}>
        <div style={{ ...eyebrow, fontSize: 11, marginBottom: 8 }}>Links</div>
        <div className="flex flex-col gap-2">
          <a
            href={`https://${portfolioData.github}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2"
            style={{
              fontSize: 15,
              fontFamily: sans,
              color: 'var(--ide-text-3)',
              textDecoration: 'none',
            }}
          >
            <GithubIcon size={14} color="var(--ide-text-5)" />
            {portfolioData.github}
          </a>
          <a
            href={`https://${portfolioData.linkedin}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2"
            style={{
              fontSize: 15,
              fontFamily: sans,
              color: 'var(--ide-text-3)',
              textDecoration: 'none',
            }}
          >
            <LinkedinIcon size={14} color="var(--ide-text-5)" />
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}

// One shell for every screen size. CSS picks which bars show, so the server renders the
// right layout and nothing swaps in after JavaScript loads. Below md (768px): mobile header
// and bottom nav. md to lg: title bar, a rail with an explorer drawer, tabs, status bar.
// lg and up: the full editor with the activity bar and explorer.
function Shell({ children }: { children: ReactNode }) {
  const { terminalOpen, sidePanelOpen } = useIDE();
  const [drawer, setDrawer] = useState<MobileDrawerType>(null);
  const open = (type: MobileDrawerType) => setDrawer(type);
  const close = () => setDrawer(null);

  return (
    <div className="flex h-dvh flex-col overflow-hidden" style={{ background: 'var(--ide-bg-1)' }}>
      <div className="shrink-0 md:hidden">
        <MobileHeader onMenuOpen={() => open('explorer')} />
      </div>
      <div className="hidden shrink-0 md:block">
        <TitleBar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex">
          <ActivityBar />
        </div>
        <div
          className="hidden shrink-0 flex-col items-center justify-between py-2 md:flex lg:hidden"
          style={{ width: 52, borderRight: '1px solid var(--ide-border)' }}
        >
          <button
            aria-label="Toggle explorer panel"
            onClick={() => setDrawer((d) => (d === 'explorer' ? null : 'explorer'))}
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderLeft:
                drawer === 'explorer' ? '2px solid var(--ide-yellow)' : '2px solid transparent',
            }}
          >
            <Folder
              size={18}
              color={drawer === 'explorer' ? 'var(--ide-text-1)' : 'var(--ide-text-5)'}
            />
          </button>
          <SettingsButton />
        </div>
        {sidePanelOpen && (
          <div className="hidden lg:flex">
            <SidePanel />
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="hidden shrink-0 md:block">
            <TabBar />
          </div>
          <main
            className="@container flex-1 overflow-y-auto"
            style={{
              background: 'var(--ide-bg-0)',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--ide-bg-5) transparent',
            }}
          >
            {children}
          </main>
          {terminalOpen && (
            <div className="hidden md:block">
              <Terminal />
            </div>
          )}
        </div>
      </div>

      <div className="hidden shrink-0 md:block">
        <StatusBar />
      </div>
      <div className="shrink-0 md:hidden">
        <MobileNav onMoreOpen={() => open('more')} />
      </div>

      <MobileDrawer open={drawer === 'explorer'} onClose={close} title="Explorer" position="right">
        <SidePanel inDrawer />
      </MobileDrawer>
      <MobileDrawer open={drawer === 'more'} onClose={close} title="Menu">
        <MobileMoreMenu
          onOpenTerminal={() => open('terminal')}
          onOpenExplorer={() => open('explorer')}
          onClose={close}
        />
      </MobileDrawer>
      <MobileDrawer open={drawer === 'terminal'} onClose={close} title="Terminal">
        <div style={{ height: '60vh' }}>
          <Terminal embedded />
        </div>
      </MobileDrawer>
    </div>
  );
}

function IDELayoutInner({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('ide-layout');
    return () => {
      document.documentElement.classList.remove('ide-layout');
    };
  }, []);

  return (
    <>
      <NavigationProgressBar />
      <Shell>{children}</Shell>
    </>
  );
}

export function IDELayout({ children }: { children: ReactNode }) {
  return <IDELayoutInner>{children}</IDELayoutInner>;
}

export function PortfolioShell({ children }: { children: ReactNode }) {
  return (
    <IDEProvider>
      <IDELayout>{children}</IDELayout>
    </IDEProvider>
  );
}
