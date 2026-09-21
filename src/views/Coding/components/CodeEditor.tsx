import { useRef, useSyncExternalStore } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import CodeMirrorEditor from './editors/CodeMirrorEditor';
import MonacoEditor from './editors/MonacoEditor';
import type { EditorHandle } from './editors/types';
import EditorSettings from './EditorSettings';
import LanguagePicker from './LanguagePicker';
import { formatCode } from '../utils/formatCode';
import {
  getEditorEngine,
  setEditorEngine,
  subscribeEditorEngine,
  type EditorEngine,
} from '../utils/editorSettingsStore';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  problemTitle: string;
  language: string;
  availableLanguages: string[];
  onLanguageChange: (language: string) => void;
}

const ENGINE_LABELS: Record<EditorEngine, string> = {
  monaco: 'VS Code',
  codemirror: 'Classic',
};

const ENGINE_DESCRIPTIONS: Record<EditorEngine, string> = {
  monaco:
    'Monaco — the actual editor VS Code runs. Real IntelliSense, bracket matching, and shortcuts.',
  codemirror:
    "Classic — this site's original lightweight editor. Lighter, but an approximation of VS Code's behavior rather than the real thing.",
};

const ENGINE_TOOLTIP = `Editor engine — both read and save the exact same code, wrap/font-size settings, and shortcuts. This only changes which underlying editor renders it.\n\n${ENGINE_DESCRIPTIONS.monaco}\n\n${ENGINE_DESCRIPTIONS.codemirror}`;

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
        <div className="flex items-center gap-2">
          <span className="font-paper-mono hidden text-[10.5px] font-bold uppercase tracking-[.08em] text-[var(--paper-muted-2)] sm:inline">
            Editor
          </span>
          <div
            role="radiogroup"
            aria-label="Editor engine"
            className="flex overflow-hidden rounded-[3px] border-[1.5px] border-dashed border-[rgba(60,44,24,.5)]"
          >
            {(Object.keys(ENGINE_LABELS) as EditorEngine[]).map((key) => (
              <button
                key={key}
                role="radio"
                aria-checked={engine === key}
                onClick={() => setEditorEngine(key)}
                title={ENGINE_DESCRIPTIONS[key]}
                className={`px-2.5 py-1 font-paper-mono text-[10.5px] font-bold uppercase tracking-[.08em] transition-colors ${
                  engine === key
                    ? 'bg-[var(--paper-yellow)] text-[var(--paper-ink)]'
                    : 'text-[var(--paper-muted)] hover:bg-[var(--paper-yellow-soft)]'
                }`}
              >
                {ENGINE_LABELS[key]}
              </button>
            ))}
          </div>
          <span
            aria-label="What's the difference between VS Code and Classic?"
            title={ENGINE_TOOLTIP}
            className="cursor-help text-[var(--paper-muted-2)]"
          >
            <InformationCircleIcon className="h-4 w-4" />
          </span>
          <button
            onClick={() => {
              const handle = editorRef.current;
              if (handle) handle.format();
              else onChange(formatCode(code));
            }}
            title="Format code (Shift+Alt+F)"
            className="rounded-[3px] border-[1.5px] border-dashed border-[rgba(60,44,24,.5)] px-3 py-1 font-paper-mono text-xs font-bold uppercase tracking-[.1em] text-[var(--paper-muted)] transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]"
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
      <div className="overflow-hidden rounded-[2px] border-[1.5px] border-[var(--paper-ink)]">
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
