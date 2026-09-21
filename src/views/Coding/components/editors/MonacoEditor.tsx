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

// registerCompletionItemProvider/registerDocumentFormattingEditProvider are
// global to the monaco module, not per-editor-instance — Practice.tsx
// remounts this component on every problem/language switch (see `editorKey`
// in Practice.tsx), so registering again on every mount would stack up
// duplicate suggestions. Monaco itself (the loaded module) is a singleton
// across the page, so a module-level guard is the right scope here.
let providersRegistered = false;

const registerProvidersOnce = (monaco: typeof Monaco) => {
  if (providersRegistered) return;
  providersRegistered = true;

  registerJavaCompletions(monaco);
  registerSnippets(monaco, 'java');
  registerSnippets(monaco, 'javascript');

  // Manual format only (Shift+Alt+F / Format button, Monaco's own default
  // binding for "Format Document") — same formatCode used by the CodeMirror
  // engine, so both produce identical output. Emits one edit per changed
  // line rather than a single whole-document replace so Monaco's own
  // edit-tracking keeps the cursor in place, matching the CodeMirror path's
  // cursor-preserving format.
  const formattingProvider: Monaco.languages.DocumentFormattingEditProvider = {
    provideDocumentFormattingEdits(model) {
      const current = model.getValue();
      const formatted = formatCode(current);
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

const applySettings = (editor: IStandaloneCodeEditor) => {
  const settings = getEditorSettings();
  editor.updateOptions({
    wordWrap: settings.wrap ? 'on' : 'off',
    fontSize: settings.fontSize,
  });
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

      // VSCode's own default: Alt+Z toggles word wrap, Ctrl+=/- zoom the
      // editor font. Monaco doesn't bind either out of the box.
      editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyZ, () => toggleWrap());
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal, () => changeFontSize(1));
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, () => changeFontSize(-1));

      editor.updateOptions({
        // Alt+Click multi-cursor and Ctrl+Space suggest are Monaco defaults
        // already — nothing to configure for those.
        tabSize: 2,
        insertSpaces: true,
        autoClosingBrackets: 'always',
        bracketPairColorization: { enabled: true },
        minimap: { enabled: false },
        renderLineHighlight: 'all',
        fontLigatures: false,
        fontFamily: "'Courier Prime', 'JetBrains Mono', monospace",
        scrollBeyondLastLine: false,
        automaticLayout: true,
      });
    };

    return (
      <Editor
        height="380px"
        language={language === Language.JAVA ? 'java' : 'javascript'}
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
