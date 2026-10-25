'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

const IDEContext = createContext<{
  sidePanelOpen: boolean;
  toggleSidePanel: () => void;
  terminalOpen: boolean;
  toggleTerminal: () => void;
  openTabs: string[];
  closeTab: (path: string) => void;
} | null>(null);

export function IDEProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [openTabs, setOpenTabs] = useState<string[]>([]);

  // Like an editor, whatever page is showing has a tab
  useEffect(() => {
    setOpenTabs((prev) => (prev.includes(pathname) ? prev : [...prev, pathname]));
  }, [pathname]);

  return (
    <IDEContext.Provider
      value={{
        sidePanelOpen,
        toggleSidePanel: () => setSidePanelOpen((v) => !v),
        terminalOpen,
        toggleTerminal: () => setTerminalOpen((v) => !v),
        openTabs,
        closeTab: (path) => setOpenTabs((prev) => prev.filter((t) => t !== path)),
      }}
    >
      {children}
    </IDEContext.Provider>
  );
}

export function useIDE() {
  const ctx = useContext(IDEContext);
  if (!ctx) throw new Error('useIDE must be used within IDEProvider');
  return ctx;
}
