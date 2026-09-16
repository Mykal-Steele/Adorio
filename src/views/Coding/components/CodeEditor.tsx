import { useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { Annotation, Transaction } from '@codemirror/state';
import { javascript, javascriptLanguage, scopeCompletionSource } from '@codemirror/lang-javascript';
import { StreamLanguage, indentService } from '@codemirror/language';
import { java } from '@codemirror/legacy-modes/mode/clike';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { paperEditorTheme } from '../constants/editorTheme';
import { javaCompletionSource } from '../constants/javaCompletions';
import { javaSnippetSource, jsSnippetSource } from '../constants/snippets';
import { formatCode } from '../utils/formatCode';
import { getEditorSettings, settingsCompartments, vscodeKeymap } from '../utils/editorKeys';
import { Language } from '../types';
import LanguagePicker from './LanguagePicker';
import EditorSettings from './EditorSettings';

const javaLanguage = StreamLanguage.define(java);
// .data.of(...) only builds the extension — it still has to be in the
// editor's `extensions` array below to actually take effect.
const javaCompletions = javaLanguage.data.of({ autocomplete: javaCompletionSource });
const javaSnippets = javaLanguage.data.of({ autocomplete: javaSnippetSource });
// toggleComment (Ctrl+/) reads comment syntax from language data — the
// legacy Java mode doesn't provide any, so declare it explicitly.
const javaComments = javaLanguage.data.of({
  commentTokens: { line: '//', block: { open: '/*', close: '*/' } },
});

// The legacy CM5-style clike mode's own indent() is a rough brace-tracking
// heuristic that regularly gets Enter-on-a-plain-statement wrong (dedents to
// the enclosing block instead of matching the line above, like every real
// editor does). Overriding with an explicit indentService replaces it
// outright: match the previous non-blank line's indent, add one level if
// that line opens a brace/paren/bracket it doesn't also close on the same
// line, and drop one level if the line being indented opens with a closer.
const javaIndent = indentService.of((context, pos) => {
  const currentLine = context.state.doc.lineAt(pos);
  const closesFirst = /^\s*[)\]}]/.test(currentLine.text);

  let prevLineNumber = currentLine.number - 1;
  while (prevLineNumber >= 1 && context.state.doc.line(prevLineNumber).text.trim() === '') {
    prevLineNumber--;
  }
  if (prevLineNumber < 1) return closesFirst ? 0 : context.unit;

  const prevLine = context.state.doc.line(prevLineNumber);
  const prevTrimmed = prevLine.text.trim();
  const prevIndent = /^[ \t]*/.exec(prevLine.text)?.[0].length ?? 0;
  const opens = (prevTrimmed.match(/[{([]/g) ?? []).length;
  const closes = (prevTrimmed.match(/[)\]}]/g) ?? []).length;

  let indent = prevIndent + (opens > closes ? context.unit : 0);
  if (closesFirst) indent = Math.max(0, indent - context.unit);
  return indent;
});

// globalThis introspection gets JS completions for every real built-in
// (Array, Object, Math, console, JSON, ...) and their members, not a
// hand-maintained list — this is what "knows the standard library" actually
// looks like when the runtime can be introspected directly, unlike Java.
const jsGlobalCompletions = javascriptLanguage.data.of({
  autocomplete: scopeCompletionSource(globalThis),
});
const jsSnippets = javascriptLanguage.data.of({ autocomplete: jsSnippetSource });

// Plain EditorView.lineWrapping only: a hanging-wrap attempt (padding-left +
// negative text-indent via line decorations) once shifted the selection
// layer's highlight rectangles off the text, producing blocky misaligned
// selections. Wrapped continuation lines starting at column 0 is the lesser
// evil — CodeMirror has no built-in hanging indent.

// Marks our own auto-format transactions so the format-on-newline listener
// below doesn't react to its own formatting dispatch in a loop.
const autoFormat = Annotation.define<boolean>();

// Formats the whole document whenever the user inserts a newline (Enter or
// paste). Formatting only whitespace means the cursor maps cleanly through
// the change, and it's kept out of the undo history so a single undo still
// removes just the newline.
const formatOnNewline = EditorView.updateListener.of((update) => {
  if (!update.docChanged) return;
  if (!getEditorSettings().formatOnNewline) return;
  if (update.transactions.some((tr) => tr.annotation(autoFormat))) return;
  if (!update.transactions.some((tr) => tr.isUserEvent('input'))) return;

  let insertedNewline = false;
  update.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
    if (inserted.toString().includes('\n')) insertedNewline = true;
  });
  if (!insertedNewline) return;

  const current = update.state.doc.toString();
  const formatted = formatCode(current);
  if (formatted === current) return;

  update.view.dispatch({
    changes: { from: 0, to: update.state.doc.length, insert: formatted },
    annotations: [autoFormat.of(true), Transaction.addToHistory.of(false)],
  });
});

const disableGrammarly = EditorView.contentAttributes.of({
  spellcheck: 'false',
  'data-gramm': 'false',
  'data-gramm_editor': 'false',
  'data-enable-grammarly': 'false',
});

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
  // Live view handle for the settings panel (toggles dispatch compartment
  // reconfigures directly — no editor rebuild, no lost undo history).
  const viewRef = useRef<EditorView | null>(null);

  const extensions = useMemo(
    () => [
      language === Language.JAVA ? javaLanguage : javascript({ jsx: false }),
      ...(language === Language.JAVA
        ? [javaCompletions, javaSnippets, javaComments]
        : [jsGlobalCompletions, jsSnippets]),
      ...(language === Language.JAVA ? [javaIndent] : []),
      autocompletion({ activateOnTyping: true }),
      closeBrackets(),
      disableGrammarly,
      // Wrapping on by default (Alt+Z toggles): without it a long line
      // pushes the scroller and parent card sideways past the fold.
      ...settingsCompartments,
      keymap.of([
        {
          key: 'Shift-Alt-f',
          run: (view) => {
            const current = view.state.doc.toString();
            const formatted = formatCode(current);
            if (formatted !== current) {
              view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: formatted },
              });
            }
            return true;
          },
        },
        ...vscodeKeymap,
      ]),
      formatOnNewline,
    ],
    [language],
  );

  return (
    <section
      aria-labelledby="editor-h"
      className="relative rotate-[0.3deg] rounded-[3px] bg-[var(--paper-cream)] p-[clamp(16px,2vw,22px)] shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)]"
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
          <button
            onClick={() => onChange(formatCode(code))}
            title="Format code (Shift+Alt+F)"
            className="rounded-[3px] border-[1.5px] border-dashed border-[rgba(60,44,24,.5)] px-3 py-1 font-paper-mono text-xs font-bold uppercase tracking-[.1em] text-[var(--paper-muted)] transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]"
          >
            Format
          </button>
          <EditorSettings viewRef={viewRef} />
          <LanguagePicker
            languages={availableLanguages}
            activeLanguage={language}
            onSelect={onLanguageChange}
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-[2px] border-[1.5px] border-[var(--paper-ink)]">
        <CodeMirror
          value={code}
          height="380px"
          theme={paperEditorTheme}
          extensions={extensions}
          basicSetup={{
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            foldGutter: true,
            lineNumbers: true,
          }}
          onChange={onChange}
          onUpdate={(update) => {
            viewRef.current = update.view;
          }}
          aria-label={`Code editor for ${problemTitle}`}
        />
      </div>
    </section>
  );
};

export default CodeEditor;
