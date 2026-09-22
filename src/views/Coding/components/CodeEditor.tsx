import { useRef, useSyncExternalStore } from 'react';
import CodeMirrorEditor from './editors/CodeMirrorEditor';
import MonacoEditor from './editors/MonacoEditor';
import type { EditorHandle } from './editors/types';
import EditorSettings from './EditorSettings';
import LanguagePicker from './LanguagePicker';
import { formatCode } from '../utils/formatCode';
import { Language } from '../types';
import { getEditorEngine, subscribeEditorEngine } from '../utils/editorSettingsStore';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  problemTitle: string;
  language: string;
  availableLanguages: string[];
  onLanguageChange: (language: string) => void;
}

const CodeEditor = ({
  code,
  onChange,
  problemTitle,
  language,
  availableLanguages,
  onLanguageChange,
}: CodeEditorProps) => {
  const engine = useSyncExternalStore(subscribeEditorEngine, getEditorEngine, () => 'monaco');
  // Both engine implementations expose the same { format() } handle (see
  // editors/types.ts) — the Format button below calls whichever is
  // currently mounted without needing to know which one that is.
  const editorRef = useRef<EditorHandle | null>(null);

  return (
    <section
      aria-labelledby="editor-h"
      className="relative z-20 rotate-[0.3deg] rounded-[3px] bg-[var(--paper-cream)] p-[clamp(16px,2vw,22px)] shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)]"
    >
      <span
        aria-hidden="true"
        className="absolute -top-3 right-9 h-[24px] w-20 rotate-[3deg] border-x border-dashed border-[rgba(60,44,24,.3)] bg-[rgba(242,199,68,.7)] shadow-[0_1px_3px_rgba(60,44,24,.2)]"
      />
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="editor-h" className="font-paper-hand text-2xl text-[var(--paper-accent)]">
          your solution
        </h2>
        {/* Only two things live here: the language you're solving in (grows
            over time, so it's a dropdown — see LanguagePicker), and actions
            on the current buffer (Format, settings). The editor engine
            (VS Code vs Classic) is a standing preference, not a per-problem
            choice, so it lives in the settings panel instead of competing
            for space here. */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const handle = editorRef.current;
              if (handle) handle.format();
              else onChange(formatCode(code, language));
            }}
            disabled={language === Language.PYTHON}
            title={
              language === Language.PYTHON
                ? "Auto-format isn't available for Python yet — indentation is meaningful there, so a wrong guess would break your code"
                : 'Format code (Shift+Alt+F)'
            }
            className="rounded-[3px] border-[1.5px] border-dashed border-[rgba(60,44,24,.5)] px-3 py-1 font-paper-mono text-xs font-bold uppercase tracking-[.1em] text-[var(--paper-muted)] transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[rgba(60,44,24,.5)] disabled:hover:bg-transparent"
          >
            Format
          </button>
          <EditorSettings />
          <LanguagePicker
            languages={availableLanguages}
            activeLanguage={language}
            onSelect={onLanguageChange}
          />
        </div>
      </div>
      {/* Counter-rotates the outer section's rotate-[0.3deg] paper-tilt back
          to upright for just the editor surface. Monaco (and CodeMirror)
          render each line as its own absolutely-positioned row; rotating
          that whole stack shifts every row's horizontal position by
          row-offset × sin(0.3°) — a few tenths of a pixel per line, small
          per-row but compounding down the file, which shows up as the
          indent guides visibly drifting off-vertical. Real VS Code never
          has to deal with this because it's never rotated. Canceling the
          rotation here keeps the tilted "pinned note" look on the card's
          border/header/tape while the actual text and guides render dead
          straight, which is what a code editor has to do regardless of the
          chrome around it. */}
      <div className="-rotate-[0.3deg] overflow-hidden rounded-[2px] border-[1.5px] border-[var(--paper-ink)]">
        {engine === 'monaco' ? (
          <MonacoEditor
            ref={editorRef}
            code={code}
            onChange={onChange}
            language={language}
            problemTitle={problemTitle}
          />
        ) : (
          <CodeMirrorEditor
            ref={editorRef}
            code={code}
            onChange={onChange}
            language={language}
            problemTitle={problemTitle}
          />
        )}
      </div>
    </section>
  );
};

export default CodeEditor;
