import type * as Monaco from 'monaco-editor';
import { PAPER_EDITOR_PALETTE } from './editorTheme';

// Same palette as the CodeMirror theme (editorTheme.ts), translated to
// Monaco's IStandaloneThemeData shape (token names are Monaco/TextMate scope
// names, not Lezer tags — the categories don't map one-to-one, but the goal
// is the same page identity across engines, not pixel-perfect parity).
export const PAPER_MONACO_THEME_NAME = 'paper-dark';

const strip = (hex: string) => hex.replace('#', '');

export function definePaperMonacoTheme(monaco: typeof Monaco) {
  const p = PAPER_EDITOR_PALETTE;
  monaco.editor.defineTheme(PAPER_MONACO_THEME_NAME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: strip(p.keyword) },
      { token: 'keyword.java', foreground: strip(p.keyword) },
      { token: 'string', foreground: strip(p.string) },
      { token: 'string.java', foreground: strip(p.string) },
      { token: 'number', foreground: strip(p.number) },
      { token: 'number.java', foreground: strip(p.number) },
      { token: 'type', foreground: strip(p.typeName) },
      { token: 'type.identifier.java', foreground: strip(p.typeName) },
      { token: 'identifier', foreground: strip(p.foreground) },
      { token: 'delimiter', foreground: strip(p.operator) },
      { token: 'operator', foreground: strip(p.operator) },
      { token: 'comment', foreground: strip(p.comment), fontStyle: 'italic' },
      { token: 'comment.java', foreground: strip(p.comment), fontStyle: 'italic' },
      { token: 'annotation.java', foreground: strip(p.constant) },
      { token: 'invalid', foreground: strip(p.invalid) },
      { token: 'predefined', foreground: strip(p.functionName) },
      { token: 'constant', foreground: strip(p.constant) },
    ],
    colors: {
      'editor.background': p.background,
      'editor.foreground': p.foreground,
      'editorCursor.foreground': p.caret,
      'editor.selectionBackground': '#f2c74440',
      'editor.inactiveSelectionBackground': '#f2c74425',
      'editor.lineHighlightBackground': '#ffffff0d',
      'editorLineNumber.foreground': p.gutterForeground,
      'editorLineNumber.activeForeground': p.gutterActiveForeground,
      'editorGutter.background': p.gutterBackground,
      'editor.findMatchBackground': '#f2c74455',
      'editor.findMatchHighlightBackground': '#f2c74425',
    },
  });
}
