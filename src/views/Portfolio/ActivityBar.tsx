'use client';

import { Folder, GitBranch, Puzzle, User, Settings } from 'lucide-react';
import { useIDE, type SidePanelType } from './context/IDEContext';
import { sans } from './constants/fonts';

const items: { id: SidePanelType; Icon: typeof Folder; label: string }[] = [
  { id: 'explorer', Icon: Folder, label: 'EXPLORER' },
  { id: 'git', Icon: GitBranch, label: 'SOURCE CONTROL' },
  { id: 'skills', Icon: Puzzle, label: 'EXTENSIONS' },
  { id: 'profile', Icon: User, label: 'PROFILE' },
];

export function ActivityBar() {
  const { activeSidePanel, setActiveSidePanel, toggleSettings } = useIDE();

  return (
    <div
      className="shrink-0 flex flex-col items-center justify-between py-2"
      data-guide="activity-bar"
      role="navigation"
      aria-label="Activity bar"
      style={{
        width: 48,
        background: 'var(--ide-bg-0)',
        borderRight: '1px solid var(--ide-border)',
      }}
    >
      <div className="flex flex-col items-center gap-1">
        {items.map(({ id, Icon, label }) => {
          const isActive = activeSidePanel === id;
          return (
            <div key={id} className="relative group">
              <button
                title={label}
                aria-label={label}
                aria-pressed={isActive}
                className="relative flex items-center justify-center transition-all"
                style={{
                  width: 40,
                  height: 40,
                  background: isActive ? 'var(--ide-border)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderLeft: isActive ? '2px solid var(--ide-orange)' : '2px solid transparent',
                }}
                onClick={() => setActiveSidePanel(id)}
              >
                <Icon
                  size={18}
                  color={isActive ? 'var(--ide-text-1)' : 'var(--ide-text-6)'}
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </button>
              {/* Tooltip */}
              <div
                className="absolute left-full ml-2 px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                role="tooltip"
                style={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--ide-bg-5)',
                  border: '1px solid var(--ide-border-strong)',
                  fontSize: 9,
                  fontFamily: sans,
                  color: 'var(--ide-text-3)',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                  zIndex: 50,
                  borderRadius: 3,
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="relative group">
          <button
            title="SETTINGS"
            aria-label="Open settings"
            onClick={toggleSettings}
            className="flex items-center justify-center transition-all"
            style={{
              width: 40,
              height: 40,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Settings size={18} color="var(--ide-text-6)" strokeWidth={1.5} />
          </button>
          <div
            className="absolute left-full ml-2 px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            role="tooltip"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--ide-bg-5)',
              border: '1px solid var(--ide-border-strong)',
              fontSize: 9,
              fontFamily: sans,
              color: 'var(--ide-text-3)',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
              zIndex: 50,
              borderRadius: 3,
            }}
          >
            SETTINGS
          </div>
        </div>
      </div>
    </div>
  );
}
