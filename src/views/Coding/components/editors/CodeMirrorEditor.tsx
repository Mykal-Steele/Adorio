import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { javascript, javascriptLanguage, scopeCompletionSource } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { StreamLanguage, indentService, indentUnit } from '@codemirror/language';
import { java } from '@codemirror/legacy-modes/mode/clike';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { paperEditorTheme } from '../../constants/editorTheme';
import { javaCompletionSource } from '../../constants/javaCompletions';
import { javaSnippetSource, jsSnippetSource } from '../../constants/snippets';
import { formatCode, mapPosThroughFormat } from '../../utils/formatCode';
import { settingsCompartments, syncEditorSettings, vscodeKeymap } from '../../utils/editorKeys';
import { subscribeEditorSettings } from '../../utils/editorSettingsStore';
import { Language } from '../../types';
import type { EditorEngineProps, EditorHandle } from './types';

const javaLanguage = StreamLanguage.define(java);
// .data.of() only builds the extension, it still has to go in `extensions` below
const javaCompletions = javaLanguage.data.of({ autocomplete: javaCompletionSource });
const javaSnippets = javaLanguage.data.of({ autocomplete: javaSnippetSource });
// Ctrl+/ reads comment tokens from language data and the legacy Java mode has none
const javaComments = javaLanguage.data.of({
  commentTokens: { line: '//', block: { open: '/*', close: '*/' } },
});

// The legacy clike mode's indent() often dedents Enter after a plain statement.
// This replaces it: copy the previous non-blank line's indent, +1 level if that
// line leaves a bracket open, -1 if the new line starts with a closer. Brackets
// in strings and comments don't count.
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

// introspecting globalThis gives every real JS built-in and its members for free
const jsGlobalCompletions = javascriptLanguage.data.of({
  autocomplete: scopeCompletionSource(globalThis),
});
const jsSnippets = javascriptLanguage.data.of({ autocomplete: jsSnippetSource });

// Wrapping is plain EditorView.lineWrapping on purpose. A hanging indent via
// padding + negative text-indent decorations threw the selection highlight off
// the text, so wrapped lines start at column 0.

// Manual format only (Shift+Alt+F or the button), one undo step. No format on
// Enter or paste: reformatting behind the user's back made Enter feel broken.
// formatCode counts braces, so on Python it would wreck the indentation. No-op
// there until there's an indentation-aware formatter.
const dispatchPreservingFormat = (view: EditorView, language: string) => {
  if (language === Language.PYTHON) return;
  const current = view.state.doc.toString();
  const formatted = formatCode(current, language);
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

const CodeMirrorEditor = forwardRef<EditorHandle, EditorEngineProps>(
  ({ code, onChange, language, problemTitle }, ref) => {
    const viewRef = useRef<EditorView | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        format: () => {
          const view = viewRef.current;
          if (view) dispatchPreservingFormat(view, language);
          else if (language !== Language.PYTHON) onChange(formatCode(code, language));
        },
      }),
      [code, onChange, language],
    );

    // also runs on mount, the store may already hold non-default settings
    // (after switching engines, or the remount on problem switch)
    useEffect(() => {
      syncEditorSettings(viewRef.current);
      return subscribeEditorSettings(() => syncEditorSettings(viewRef.current));
    }, []);

    const extensions = useMemo(() => {
      // Python's lang package already indents properly, so no javaIndent there.
      // Java starters use 4 spaces and indentUnit defaults to 2, so without
      // the override new lines came out 2 deep next to 4-space starter code.
      let languageExtension;
      let languageFeatures: unknown[];
      if (language === Language.JAVA) {
        languageExtension = javaLanguage;
        languageFeatures = [
          javaCompletions,
          javaSnippets,
          javaComments,
          javaIndent,
          indentUnit.of('    '),
        ];
      } else if (language === Language.PYTHON) {
        languageExtension = python();
        languageFeatures = [indentUnit.of('    ')];
      } else {
        languageExtension = javascript({ jsx: false });
        languageFeatures = [jsGlobalCompletions, jsSnippets, indentUnit.of('  ')];
      }

      return [
        languageExtension,
        ...languageFeatures,
        autocompletion({ activateOnTyping: true }),
        closeBrackets(),
        disableGrammarly,
        // Alt+Click multi-cursor like VSCode, Ctrl+Click clashes with the browser
        EditorView.clickAddsSelectionRange.of((event) => event.altKey),
        ...settingsCompartments,
        keymap.of([
          {
            key: 'Shift-Alt-f',
            run: (view) => {
              dispatchPreservingFormat(view, language);
              return true;
            },
          },
          ...vscodeKeymap,
        ]),
      ];
    }, [language]);

    return (
      <CodeMirror
        value={code}
        height="380px"
        theme={paperEditorTheme}
        extensions={extensions}
        // @uiw adds indentWithTab ahead of our extensions, which would shadow vscodeTab
        indentWithTab={false}
        basicSetup={{
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          foldGutter: true,
          lineNumbers: true,
          // its highlight looks almost the same as a real selection
          highlightSelectionMatches: false,
        }}
        onChange={onChange}
        onCreateEditor={(view) => {
          viewRef.current = view;
          syncEditorSettings(view);
        }}
        onUpdate={(update) => {
          viewRef.current = update.view;
        }}
        aria-label={`Code editor for ${problemTitle}`}
      />
    );
  },
);

CodeMirrorEditor.displayName = 'CodeMirrorEditor';

export default CodeMirrorEditor;
