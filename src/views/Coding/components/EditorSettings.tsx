import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { RefObject } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import type { EditorView } from '@codemirror/view';
import useClickOutside from '@/hooks/useClickOutside';
import {
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  getEditorSettings,
  resetEditorSettings,
  setFontSize,
  setWrap,
  subscribeEditorSettings,
} from '../utils/editorKeys';

const SHORTCUTS: Array<[string, string]> = [
  ['Tab / Shift-Tab', 'Insert spaces at cursor / outdent (selection indents)'],
  ['Ctrl + ] / [', 'Indent / outdent line'],
  ['Ctrl+Space', 'Trigger suggestions'],
  ['Ctrl + /', 'Toggle line comment'],
  ['Ctrl + Shift + K', 'Delete line'],
  ['Alt + ↑ / ↓', 'Move line up / down'],
  ['Shift + Alt + ↑ / ↓', 'Duplicate line'],
  ['Alt + Z', 'Toggle word wrap'],
  ['Ctrl + = / −', 'Editor zoom in / out'],
  ['Shift + Alt + F', 'Format document'],
  ['Ctrl + F', 'Find in file'],
  ['Ctrl + Enter', 'Run tests (works anywhere on the page)'],
];

const Toggle = ({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between gap-3 py-1.5 text-left"
  >
    <span>
      <span className="block text-[13.5px] font-bold text-[var(--paper-ink)]">{label}</span>
      <span className="block text-xs text-[var(--paper-muted)]">{hint}</span>
    </span>
    <span
      aria-hidden="true"
      className={`relative h-[20px] w-[36px] shrink-0 rounded-full border-[1.5px] transition-colors ${
        checked
          ? 'border-[var(--paper-ink)] bg-[var(--paper-yellow)]'
          : 'border-[rgba(60,44,24,.4)]'
      }`}
    >
      <span
        className={`absolute top-1/2 h-[12px] w-[12px] -translate-y-1/2 rounded-full border border-[var(--paper-ink)] bg-[var(--paper-cream)] transition-all ${
          checked ? 'left-[18px]' : 'left-[3px]'
        }`}
      />
    </span>
  </button>
);

interface EditorSettingsProps {
  viewRef: RefObject<EditorView | null>;
}

const EditorSettings = ({ viewRef }: EditorSettingsProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const settings = useSyncExternalStore(subscribeEditorSettings, getEditorSettings);

  useClickOutside(containerRef, () => setOpen(false));

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Editor settings & shortcuts"
        aria-label="Editor settings and shortcuts"
        className="rounded-[3px] border-[1.5px] border-dashed border-[rgba(60,44,24,.5)] p-[5px] text-[var(--paper-muted)] transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]"
      >
        <Cog6ToothIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Editor settings"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          className="absolute right-0 top-[calc(100%+8px)] z-30 max-h-[70vh] w-[278px] overflow-y-auto rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] p-4 shadow-[4px_5px_0_rgba(60,44,24,.2)] outline-none"
        >
          <p className="font-paper-mono text-[11px] font-bold uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
            Editor settings
          </p>

          <div className="mt-1 divide-y divide-[rgba(60,44,24,.15)]">
            <Toggle
              checked={settings.wrap}
              onChange={(next) => setWrap(viewRef.current, next)}
              label="Word wrap"
              hint="Wrap long lines (Alt+Z)"
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 border-t border-[rgba(60,44,24,.15)] pt-3">
            <span className="text-[13.5px] font-bold text-[var(--paper-ink)]">Font size</span>
            <span className="flex items-center gap-1.5">
              <button
                onClick={() => setFontSize(viewRef.current, settings.fontSize - 1)}
                disabled={settings.fontSize <= MIN_FONT_SIZE}
                aria-label="Decrease font size"
                className="grid h-[26px] w-[26px] place-items-center rounded-[2px] border-[1.5px] border-[rgba(60,44,24,.4)] text-sm font-bold text-[var(--paper-ink)] transition-colors hover:bg-[var(--paper-yellow-soft)] disabled:opacity-40"
              >
                −
              </button>
              <span
                aria-live="polite"
                className="w-[52px] text-center font-paper-mono text-xs text-[var(--paper-muted)]"
              >
                {settings.fontSize}px
              </span>
              <button
                onClick={() => setFontSize(viewRef.current, settings.fontSize + 1)}
                disabled={settings.fontSize >= MAX_FONT_SIZE}
                aria-label="Increase font size"
                className="grid h-[26px] w-[26px] place-items-center rounded-[2px] border-[1.5px] border-[rgba(60,44,24,.4)] text-sm font-bold text-[var(--paper-ink)] transition-colors hover:bg-[var(--paper-yellow-soft)] disabled:opacity-40"
              >
                +
              </button>
            </span>
          </div>

          <div className="mt-3 border-t border-[rgba(60,44,24,.15)] pt-3">
            <p className="mb-1.5 font-paper-mono text-[11px] font-bold uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
              Shortcuts
            </p>
            <dl className="space-y-1.5">
              {SHORTCUTS.map(([keys, action]) => (
                <div key={keys} className="flex items-baseline justify-between gap-2">
                  <dt className="shrink-0 rounded-[2px] border border-[rgba(60,44,24,.35)] bg-[var(--paper-yellow-soft)] px-1.5 py-px font-paper-mono text-[10.5px] font-bold text-[var(--paper-ink)]">
                    {keys}
                  </dt>
                  <dd className="text-right text-xs leading-snug text-[var(--paper-muted)]">
                    {action}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-[11px] leading-snug text-[var(--paper-muted-2)]">
              On macOS, Ctrl above means Cmd. Editor shortcuts apply while the editor is focused.
            </p>
          </div>

          <button
            onClick={() => resetEditorSettings(viewRef.current)}
            className="mt-3 w-full rounded-[2px] border-[1.5px] border-dashed border-[rgba(60,44,24,.4)] py-1.5 font-paper-mono text-[11px] font-bold uppercase tracking-[.12em] text-[var(--paper-muted)] transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]"
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
};

export default EditorSettings;
