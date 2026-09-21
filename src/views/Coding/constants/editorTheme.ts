import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';

// The paper-craft palette itself — shared between the CodeMirror theme below
// and the Monaco theme (constants/monacoTheme.ts) so switching editor
// engines (see components/CodeEditor.tsx) doesn't also switch colors. Same
// warm ink-and-parchment family (amber, rust, olive, ink) as the rest of the
// site, instead of the generic blue/purple/pink of most editor themes.
export const PAPER_EDITOR_PALETTE = {
  background: '#211d17',
  foreground: '#e8dfc9',
  caret: '#f2c744',
  selection: 'rgba(242, 199, 68, 0.25)',
  lineHighlight: 'rgba(255, 255, 255, 0.05)',
  gutterBackground: '#1a1712',
  // #6b6252 (the original muted taupe) reads fine as body text on cream but
  // was only 2.79:1 against this dark editor background — below WCAG AA's
  // 4.5:1 for normal text. #948a76 keeps the same de-emphasized "dimmer than
  // the main foreground" role (line numbers/comments still read as secondary
  // next to #e8dfc9) while clearing 4.9:1.
  gutterForeground: '#948a76',
  gutterActiveForeground: '#e8dfc9',
  keyword: '#e0b64f',
  string: '#a3b565',
  functionName: '#f0c987',
  constant: '#c98a4b',
  number: '#c9784a',
  typeName: '#89a870',
  operator: '#b99a6b',
  comment: '#948a76',
  invalid: '#e07a68',
  fontFamily: "'Courier Prime', 'JetBrains Mono', monospace",
} as const;

export const paperEditorTheme = createTheme({
  theme: 'dark',
  settings: {
    background: PAPER_EDITOR_PALETTE.background,
    foreground: PAPER_EDITOR_PALETTE.foreground,
    caret: PAPER_EDITOR_PALETTE.caret,
    selection: PAPER_EDITOR_PALETTE.selection,
    selectionMatch: 'rgba(242, 199, 68, 0.15)',
    lineHighlight: PAPER_EDITOR_PALETTE.lineHighlight,
    gutterBackground: PAPER_EDITOR_PALETTE.gutterBackground,
    gutterForeground: PAPER_EDITOR_PALETTE.gutterForeground,
    gutterActiveForeground: PAPER_EDITOR_PALETTE.gutterActiveForeground,
    gutterBorder: 'transparent',
    fontFamily: PAPER_EDITOR_PALETTE.fontFamily,
  },
  styles: [
    { tag: t.keyword, color: '#e0b64f' },
    { tag: [t.name, t.deleted, t.character, t.macroName], color: '#e8dfc9' },
    { tag: t.propertyName, color: '#d99a5b' },
    { tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: '#a3b565' },
    { tag: [t.function(t.variableName), t.labelName], color: '#f0c987' },
    { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#c98a4b' },
    { tag: [t.definition(t.name), t.separator], color: '#e8dfc9' },
    { tag: t.className, color: '#e8dfc9' },
    { tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#c9784a' },
    { tag: t.typeName, color: '#89a870' },
    { tag: [t.operator, t.operatorKeyword], color: '#b99a6b' },
    { tag: [t.url, t.escape, t.regexp, t.link], color: '#8fae7a' },
    { tag: [t.meta, t.comment], color: '#948a76', fontStyle: 'italic' },
    { tag: t.strong, fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.link, textDecoration: 'underline' },
    { tag: t.heading, fontWeight: 'bold', color: '#f0c987' },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#e8dfc9' },
    { tag: t.invalid, color: '#e07a68' },
    { tag: t.strikethrough, textDecoration: 'line-through' },
  ],
});
