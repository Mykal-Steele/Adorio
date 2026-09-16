import { useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { javascript, javascriptLanguage, scopeCompletionSource } from '@codemirror/lang-javascript';
import { StreamLanguage, indentService } from '@codemirror/language';
import { java } from '@codemirror/legacy-modes/mode/clike';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { paperEditorTheme } from '../constants/editorTheme';
import { javaCompletionSource } from '../constants/javaCompletions';
import { javaSnippetSource, jsSnippetSource } from '../constants/snippets';
import { formatCode, mapPosThroughFormat } from '../utils/formatCode';
import { settingsCompartments, vscodeKeymap } from '../utils/editorKeys';
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
// that line leaves a bracket unclosed, and drop one level if the line being
// indented opens with a closer. Brackets inside string/char literals and
// comments are skipped when counting, so a brace in e.g. "{" or // }
// never shifts indentation. This is the whole Enter story — same as VSCode:
// indent the new line, nothing more.
const countNetOpens = (line: string): number => {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1] ?? '';
    if (inSingle || inDouble) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if ((inSingle && ch === "'") || (inDouble && ch === '"')) {
        inSingle = false;
        inDouble = false;
      }
      continue;
    }
    if (ch === '/' && next === '/') break;
    if (ch === '/' && next === '*') {
      const end = line.indexOf('*/', i + 2);
      if (end === -1) break;
      i = end + 1;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === '{' || ch === '(' || ch === '[') depth++;
    else if (ch === '}' || ch === ')' || ch === ']') depth--;
  }
  return depth;
};

const javaIndent = indentService.of((context, pos) => {
  const currentLine = context.state.doc.lineAt(pos);
  const closesFirst = /^\s*[)\]}]/.test(currentLine.text);

  let prevLineNumber = currentLine.number - 1;
  while (prevLineNumber >= 1 && context.state.doc.line(prevLineNumber).text.trim() === '') {
    prevLineNumber--;
  }
  if (prevLineNumber < 1) return 0;

  const prevLine = context.state.doc.line(prevLineNumber);
  const prevIndent = /^[ \t]*/.exec(prevLine.text)?.[0].length ?? 0;

  let indent = prevIndent + (countNetOpens(prevLine.text) > 0 ? context.unit : 0);
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

// Manual format only (Shift+Alt+F / Format button): a cursor-preserving
// whole-doc replace, left in the undo history as one step. There is
// deliberately no auto-format on Enter or paste — VSCode ships with both
// off by default, and reformatting the whole document behind the user's
// back is what made Enter feel broken.
const dispatchPreservingFormat = (view: EditorView) => {
  const current = view.state.doc.toString();
  const formatted = formatCode(current);
  if (formatted === current) return;
  const selection = view.state.selection;
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: formatted },
    selection: {
      anchor: mapPosThroughFormat(current, formatted, selection.main.anchor),
      head: mapPosThroughFormat(current, formatted, selection.main.head),
    },
  });
};

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
      // VSCode-style Alt+Click multi-cursor (CodeMirror's default is
      // Ctrl/Cmd+Click, which collides with browser shortcuts).
      EditorView.clickAddsSelectionRange.of((event) => event.altKey),
      // Wrapping on by default (Alt+Z toggles): without it a long line
      // pushes the scroller and parent card sideways past the fold.
      ...settingsCompartments,
      keymap.of([
        {
          key: 'Shift-Alt-f',
          run: (view) => {
            dispatchPreservingFormat(view);
            return true;
          },
        },
        ...vscodeKeymap,
      ]),
    ],
    [language],
  );

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
          <button
            onClick={() => {
              const view = viewRef.current;
              if (view) dispatchPreservingFormat(view);
              else onChange(formatCode(code));
            }}
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
          // @uiw registers CodeMirror's stock indentWithTab ahead of user
          // extensions, which would shadow our Tab handler below (whole-line
          // indent everywhere). Disabled so vscodeTab owns Tab/Shift-Tab.
          indentWithTab={false}
          basicSetup={{
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            foldGutter: true,
            lineNumbers: true,
          }}
          onChange={onChange}
          onCreateEditor={(view) => {
            viewRef.current = view;
          }}
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
