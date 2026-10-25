'use client';

import { Files } from 'lucide-react';
import { useIDE } from './context/IDEContext';
import { SettingsButton } from './shared';

export function ActivityBar() {
  const { sidePanelOpen, toggleSidePanel } = useIDE();

  return (
    <div
      className="shrink-0 flex flex-col items-center justify-between py-2"
      role="navigation"
      aria-label="Activity bar"
      style={{
        width: 52,
        background: 'var(--ide-bg-1)',
        borderRight: '1px solid var(--ide-border)',
      }}
    >
      <button
        title={sidePanelOpen ? 'Hide explorer' : 'Show explorer'}
        aria-label="Explorer"
        aria-pressed={sidePanelOpen}
        onClick={toggleSidePanel}
        className="ide-hover flex items-center justify-center"
        style={{
          width: 52,
          height: 48,
          background: 'transparent',
          border: 'none',
          boxShadow: sidePanelOpen ? 'inset 2px 0 0 var(--ide-yellow)' : 'none',
          cursor: 'pointer',
        }}
      >
        <Files
          size={22}
          color={sidePanelOpen ? 'var(--ide-text-1)' : 'var(--ide-text-5)'}
          strokeWidth={1.75}
        />
      </button>
      <SettingsButton />
    </div>
  );
}
