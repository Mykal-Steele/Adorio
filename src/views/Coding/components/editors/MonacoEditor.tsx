import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { definePaperMonacoTheme, PAPER_MONACO_THEME_NAME } from '../../constants/monacoTheme';
import { registerJavaCompletions } from '../../constants/javaCompletionsMonaco';
import { registerSnippets } from '../../constants/monacoSnippets';
import { formatCode } from '../../utils/formatCode';
import {
  changeFontSize,
  getEditorSettings,
  subscribeEditorSettings,
  toggleWrap,
} from '../../utils/editorSettingsStore';
import { Language } from '../../types';
import type { EditorEngineProps, EditorHandle } from './types';

type IStandaloneCodeEditor = Monaco.editor.IStandaloneCodeEditor;

// Providers are global to the monaco module, not per editor. Practice.tsx
// remounts this on every problem/language switch (`editorKey`), so without
// this guard the suggestions pile up as duplicates.
let providersRegistered = false;

const registerProvidersOnce = (monaco: typeof Monaco) => {
  if (providersRegistered) return;
  providersRegistered = true;

  registerJavaCompletions(monaco);
  registerSnippets(monaco, 'java');
  registerSnippets(monaco, 'javascript');

  // Same formatCode as CodeMirror so both engines format the same. One edit
  // per changed line, not a whole-doc replace, so Monaco keeps the cursor put.
  const formattingProvider: Monaco.languages.DocumentFormattingEditProvider = {
    provideDocumentFormattingEdits(model) {
      const current = model.getValue();
      // registered for both java and javascript, so read the model's language
      const formatted = formatCode(current, model.getLanguageId());
      if (formatted === current) return [];
      const oldLines = current.split('\n');
      const newLines = formatted.split('\n');
      const edits: Monaco.languages.TextEdit[] = [];
      for (let i = 0; i < oldLines.length; i++) {
        if (oldLines[i] !== newLines[i]) {
          edits.push({
            range: {
              startLineNumber: i + 1,
              startColumn: 1,
              endLineNumber: i + 1,
              endColumn: oldLines[i].length + 1,
            },
            text: newLines[i],
          });
        }
      }
      return edits;
    },
  };
  monaco.languages.registerDocumentFormattingEditProvider('java', formattingProvider);
  monaco.languages.registerDocumentFormattingEditProvider('javascript', formattingProvider);
};

const MONACO_LANGUAGE_ID: Record<string, string> = {
  [Language.JAVA]: 'java',
  [Language.PYTHON]: 'python',
  [Language.JAVASCRIPT]: 'javascript',
};

const applySettings = (editor: IStandaloneCodeEditor) => {
  const settings = getEditorSettings();
  editor.updateOptions({
    wordWrap: settings.wrap ? 'on' : 'off',
    fontSize: settings.fontSize,
  });
};

// Java/Python starters use 4 spaces, JS uses 2. A fixed 2 made new Java
// blocks drift out of line with the 4-space starter code.
const TAB_SIZE: Record<string, number> = {
  [Language.JAVA]: 4,
  [Language.PYTHON]: 4,
  [Language.JAVASCRIPT]: 2,
};

const MonacoEditor = forwardRef<EditorHandle, EditorEngineProps>(
  ({ code, onChange, language, problemTitle }, ref) => {
    const editorRef = useRef<IStandaloneCodeEditor | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        format: () => {
          editorRef.current?.getAction('editor.action.formatDocument')?.run();
        },
      }),
      [],
    );

    useEffect(() => {
      return subscribeEditorSettings(() => {
        if (editorRef.current) applySettings(editorRef.current);
      });
    }, []);

    const handleMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      registerProvidersOnce(monaco);
      applySettings(editor);

      // Monaco measures char width on mount. If the web font hasn't swapped in
      // yet it caches the fallback font's metrics and the indent guides drift
      // off the text, so measure again once fonts are loaded.
      document.fonts.ready.then(() => monaco.editor.remeasureFonts());

      // VSCode binds these (Alt+Z wrap, Ctrl+=/- zoom), Monaco doesn't
      editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyZ, () => toggleWrap());
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal, () => changeFontSize(1));
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, () => changeFontSize(-1));

      editor.updateOptions({
        tabSize: TAB_SIZE[language] ?? 2,
        insertSpaces: true,
        // tabSize is already right for this language (remounted per switch),
        // detection would override it from the starter code's whitespace
        detectIndentation: false,
        autoClosingBrackets: 'always',
        bracketPairColorization: { enabled: true },
        minimap: { enabled: false },
        renderLineHighlight: 'all',
        fontLigatures: false,
        fontFamily: 'var(--font-courier), monospace',
        scrollBeyondLastLine: false,
        automaticLayout: true,
      });
    };

    return (
      <Editor
        height="380px"
        language={MONACO_LANGUAGE_ID[language] ?? 'javascript'}
        value={code}
        theme={PAPER_MONACO_THEME_NAME}
        beforeMount={definePaperMonacoTheme}
        onMount={handleMount}
        onChange={(value) => onChange(value ?? '')}
        options={{ ariaLabel: `Code editor for ${problemTitle}` }}
        loading={
          <div className="flex h-full w-full items-center justify-center bg-[#211d17] text-sm text-[#6b6252]">
            Loading editor…
          </div>
        }
      />
    );
  },
);

MonacoEditor.displayName = 'MonacoEditor';

export default MonacoEditor;
