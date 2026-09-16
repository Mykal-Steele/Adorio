import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';

// A warm, ink-and-parchment dark theme for the editor — same family of colors as
// the rest of the paper-craft site (amber, rust, olive, ink) instead of the
// generic blue/purple/pink of most off-the-shelf CodeMirror themes.
export const paperEditorTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#211d17',
    foreground: '#e8dfc9',
    caret: '#f2c744',
    selection: 'rgba(242, 199, 68, 0.25)',
    selectionMatch: 'rgba(242, 199, 68, 0.15)',
    lineHighlight: 'rgba(255, 255, 255, 0.05)',
    gutterBackground: '#1a1712',
    gutterForeground: '#6b6252',
    gutterActiveForeground: '#e8dfc9',
    gutterBorder: 'transparent',
    fontFamily: "'Courier Prime', 'JetBrains Mono', monospace",
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
    { tag: [t.meta, t.comment], color: '#6b6252', fontStyle: 'italic' },
    { tag: t.strong, fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.link, textDecoration: 'underline' },
    { tag: t.heading, fontWeight: 'bold', color: '#f0c987' },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#e8dfc9' },
    { tag: t.invalid, color: '#e07a68' },
    { tag: t.strikethrough, textDecoration: 'line-through' },
  ],
});
