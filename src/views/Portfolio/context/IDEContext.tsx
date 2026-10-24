'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type SidePanelType = 'explorer' | 'profile' | 'skills';

const IDEContext = createContext<{
  activeSidePanel: SidePanelType;
  setActiveSidePanel: (panel: SidePanelType) => void;
  terminalOpen: boolean;
  toggleTerminal: () => void;
  openProjectTabs: string[];
  addProjectTab: (id: string) => void;
  closeProjectTab: (id: string) => void;
  isSettingsOpen: boolean;
  toggleSettings: () => void;
} | null>(null);

export function IDEProvider({ children }: { children: ReactNode }) {
  const [activeSidePanel, setActiveSidePanel] = useState<SidePanelType>('explorer');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [openProjectTabs, setOpenProjectTabs] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleTerminal = () => setTerminalOpen((v) => !v);
  const toggleSettings = () => setIsSettingsOpen((v) => !v);

  const addProjectTab = (id: string) => {
    setOpenProjectTabs((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const closeProjectTab = (id: string) => {
    setOpenProjectTabs((prev) => prev.filter((t) => t !== id));
  };

  return (
    <IDEContext.Provider
      value={{
        activeSidePanel,
        setActiveSidePanel,
        terminalOpen,
        toggleTerminal,
        openProjectTabs,
        addProjectTab,
        closeProjectTab,
        isSettingsOpen,
        toggleSettings,
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
