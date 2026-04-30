'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Folder,
  Bot,
  Terminal as TerminalIcon,
  GithubIcon,
  LinkedinIcon,
  GitBranch,
} from 'lucide-react';

import { TitleBar } from './TitleBar';
import { ActivityBar } from './ActivityBar';
import { SidePanel } from './SidePanel';
import { TabBar } from './TabBar';
import { RightPanel, AskMePanel } from './RightPanel';
import { StatusBar } from './StatusBar';
import { Terminal } from './Terminal';
import { SettingsPanel } from './SettingsPanel';
import { useIDE } from './context/IDEContext';
import { useResponsive } from './hooks/useResponsive';
import { MobileHeader } from './mobile/MobileHeader';
import { MobileNav } from './mobile/MobileNav';
import { MobileDrawer } from './mobile/MobileDrawer';
import { ThemeProvider } from './context/ThemeContext';
import { IDEProvider } from './context/IDEContext';
import { portfolioData } from './data/portfolio';
import { sans, mono } from './constants/fonts';

function DesktopShell({ children }: { children: ReactNode }) {
  const { terminalOpen, isSettingsOpen } = useIDE();
  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', overflow: 'hidden', background: 'var(--ide-bg-2)' }}
    >
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        <SidePanel />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TabBar />
          <div
            className="flex-1 overflow-y-auto"
            style={{
              background: 'var(--ide-bg-4)',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--ide-bg-5) transparent',
            }}
          >
            {children}
          </div>
          {terminalOpen && <Terminal />}
        </div>
        <RightPanel />
      </div>
      <StatusBar />
      {isSettingsOpen && <SettingsPanel />}
    </div>
  );
}

function TabletShell({ children }: { children: ReactNode }) {
  const { terminalOpen, isSettingsOpen } = useIDE();
  const [tabletDrawer, setTabletDrawer] = useState<'side' | 'right' | null>(null);
  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', overflow: 'hidden', background: 'var(--ide-bg-2)' }}
    >
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <div
          className="shrink-0 flex flex-col items-center justify-between py-2"
          style={{
            width: 48,
            background: 'var(--ide-bg-0)',
            borderRight: '1px solid var(--ide-border)',
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <button
              aria-label="Toggle explorer panel"
              onClick={() => setTabletDrawer((d) => (d === 'side' ? null : 'side'))}
              className="flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                background: tabletDrawer === 'side' ? 'var(--ide-border)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderLeft:
                  tabletDrawer === 'side' ? '2px solid var(--ide-orange)' : '2px solid transparent',
              }}
            >
              <Folder
                size={18}
                color={tabletDrawer === 'side' ? 'var(--ide-text-1)' : 'var(--ide-text-6)'}
              />
            </button>
            <button
              aria-label="Toggle system panel"
              onClick={() => setTabletDrawer((d) => (d === 'right' ? null : 'right'))}
              className="flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                background: tabletDrawer === 'right' ? 'var(--ide-border)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderLeft:
                  tabletDrawer === 'right'
                    ? '2px solid var(--ide-orange)'
                    : '2px solid transparent',
              }}
            >
              <Bot
                size={18}
                color={tabletDrawer === 'right' ? 'var(--ide-text-1)' : 'var(--ide-text-6)'}
              />
            </button>
          </div>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <TabBar />
          <div
            className="flex-1 overflow-y-auto"
            style={{
              background: 'var(--ide-bg-4)',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--ide-bg-5) transparent',
            }}
          >
            {children}
          </div>
          {terminalOpen && <Terminal />}
        </div>
      </div>
      <StatusBar />
      <MobileDrawer
        open={tabletDrawer === 'side'}
        onClose={() => setTabletDrawer(null)}
        title="Explorer"
        position="right"
      >
        <SidePanel />
      </MobileDrawer>
      <MobileDrawer
        open={tabletDrawer === 'right'}
        onClose={() => setTabletDrawer(null)}
        title="System & Ask Oo"
        position="right"
      >
        <RightPanel />
      </MobileDrawer>
      {isSettingsOpen && <SettingsPanel />}
    </div>
  );
}

type MobileDrawerType = 'explorer' | 'askme' | 'terminal' | 'more' | null;

function MobileMoreMenu({
  onOpenTerminal,
  onOpenAskOo,
  onOpenExplorer,
  onClose,
}: {
  onOpenTerminal: () => void;
  onOpenAskOo: () => void;
  onOpenExplorer: () => void;
  onClose: () => void;
}) {
  const menuItems = [
    {
      icon: <TerminalIcon size={16} color="var(--ide-accent)" />,
      label: 'Terminal',
      sub: 'Interactive command line',
      action: onOpenTerminal,
    },
    {
      icon: <Bot size={16} color="var(--ide-purple)" />,
      label: 'Ask Oo',
      sub: "Chat with Oakar's knowledge base",
      action: onOpenAskOo,
    },
    {
      icon: <Folder size={16} color="var(--ide-orange)" />,
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
                fontSize: 12,
                fontFamily: sans,
                color: 'var(--ide-text-1)',
                fontWeight: 600,
              }}
            >
              {item.label}
            </div>
            <div style={{ fontSize: 10, fontFamily: sans, color: 'var(--ide-text-6)' }}>
              {item.sub}
            </div>
          </div>
        </button>
      ))}
      <div className="px-4 pt-4 pb-2" style={{ borderTop: '1px solid var(--ide-border)' }}>
        <div
          style={{
            fontSize: 9,
            fontFamily: sans,
            color: 'var(--ide-text-7)',
            letterSpacing: '0.1em',
            marginBottom: 8,
          }}
        >
          LINKS
        </div>
        <div className="flex flex-col gap-2">
          <a
            href={`https://${portfolioData.github}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2"
            style={{
              fontSize: 11,
              fontFamily: mono,
              color: 'var(--ide-text-4)',
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
              fontSize: 11,
              fontFamily: mono,
              color: 'var(--ide-text-4)',
              textDecoration: 'none',
            }}
          >
            <LinkedinIcon size={14} color="#0077b5" />
            LinkedIn
          </a>
        </div>
      </div>
      <div
        className="mx-4 mt-4 px-3 py-2"
        style={{ background: 'var(--ide-accent-dark)', borderRadius: 4 }}
      >
        <div className="flex items-center gap-2">
          <GitBranch size={10} color="var(--ide-accent-light)" />
          <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-accent-light)' }}>
            ROOT@{portfolioData.handle}:~$
          </span>
        </div>
      </div>
    </div>
  );
}

function MobileShell({ children }: { children: ReactNode }) {
  const { isSettingsOpen } = useIDE();
  const [drawer, setDrawer] = useState<MobileDrawerType>(null);
  const open = (type: MobileDrawerType) => setDrawer(type);
  const close = () => setDrawer(null);
  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh', overflow: 'hidden', background: 'var(--ide-bg-2)' }}
    >
      <MobileHeader onMenuOpen={() => open('explorer')} />
      <div
        className="flex-1 overflow-y-auto"
        style={{
          background: 'var(--ide-bg-4)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--ide-bg-5) transparent',
        }}
      >
        {children}
      </div>
      <MobileNav onMoreOpen={() => open('more')} />
      <MobileDrawer open={drawer === 'explorer'} onClose={close} title="Explorer" position="right">
        <SidePanel />
      </MobileDrawer>
      <MobileDrawer open={drawer === 'more'} onClose={close} title="Menu">
        <MobileMoreMenu
          onOpenTerminal={() => open('terminal')}
          onOpenAskOo={() => open('askme')}
          onOpenExplorer={() => open('explorer')}
          onClose={close}
        />
      </MobileDrawer>
      <MobileDrawer open={drawer === 'terminal'} onClose={close} title="Terminal">
        <div style={{ height: '60vh' }}>
          <Terminal embedded />
        </div>
      </MobileDrawer>
      <MobileDrawer open={drawer === 'askme'} onClose={close} title="Ask Oo">
        <div style={{ height: '70vh' }}>
          <AskMePanel />
        </div>
      </MobileDrawer>
      {isSettingsOpen && <SettingsPanel />}
    </div>
  );
}

function IDELayoutInner({ children }: { children: ReactNode }) {
  const { isMobile, isTablet } = useResponsive();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.add('ide-layout');
    return () => {
      document.documentElement.classList.remove('ide-layout');
    };
  }, []);

  useEffect(() => {
    const routes = [
      '/',
      '/about',
      '/projects',
      '/contact',
      '/projects/create-adorex',
      '/projects/chroma-board',
      '/projects/vexta',
      '/projects/discord-forge',
      '/projects/axum-rest',
      '/projects/express-legacy',
    ];
    routes.forEach((r) => router.prefetch(r));
  }, [router]);

  if (isMobile) return <MobileShell>{children}</MobileShell>;
  if (isTablet) return <TabletShell>{children}</TabletShell>;
  return <DesktopShell>{children}</DesktopShell>;
}

export function IDELayout({ children }: { children: ReactNode }) {
  return <IDELayoutInner>{children}</IDELayoutInner>;
}

export function PortfolioShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <IDEProvider>
        <IDELayout>{children}</IDELayout>
      </IDEProvider>
    </ThemeProvider>
  );
}
