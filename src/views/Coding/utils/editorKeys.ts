import type { StateCommand } from '@codemirror/state';
import {
  copyLineDown,
  copyLineUp,
  deleteLine,
  indentLess,
  indentMore,
  moveLineDown,
  moveLineUp,
  toggleComment,
} from '@codemirror/commands';
import {
  clearSnippet,
  hasNextSnippetField,
  hasPrevSnippetField,
  nextSnippetField,
  prevSnippetField,
} from '@codemirror/autocomplete';
import { getIndentUnit } from '@codemirror/language';
import { Compartment } from '@codemirror/state';
import type { KeyBinding } from '@codemirror/view';
import { EditorView } from '@codemirror/view';
import {
  DEFAULT_EDITOR_SETTINGS,
  getEditorSettings,
  changeFontSize as storeChangeFontSize,
  toggleWrap as storeToggleWrap,
} from './editorSettingsStore';

// Like VSCode: Tab with no selection inserts spaces to the next tab stop and
// never re-indents the whole line. Only a selection indents. Shift-Tab still
// outdents.
const vscodeTab: StateCommand = ({ state, dispatch }) => {
  if (state.readOnly) return false;
  const { from, to } = state.selection.main;
  if (from !== to) return indentMore({ state, dispatch });

  const unit = getIndentUnit(state);
  const line = state.doc.lineAt(from);
  const insert = ' '.repeat(unit - ((from - line.from) % unit));
  dispatch(
    state.update({
      changes: { from, insert },
      selection: { anchor: from + insert.length },
      userEvent: 'input',
    }),
  );
  return true;
};

const wrapCompartment = new Compartment();
const fontSizeCompartment = new Compartment();

const fontSizeTheme = (size: number) => EditorView.theme({ '&': { fontSize: `${size}px` } });

const settingsEffects = () => {
  const settings = getEditorSettings();
  return [
    wrapCompartment.reconfigure(settings.wrap ? EditorView.lineWrapping : []),
    fontSizeCompartment.reconfigure(fontSizeTheme(settings.fontSize)),
  ];
};

export const settingsCompartments = [
  wrapCompartment.of(EditorView.lineWrapping),
  fontSizeCompartment.of(fontSizeTheme(DEFAULT_EDITOR_SETTINGS.fontSize)),
];

// also called on mount, the store may already hold non-default settings
// (e.g. after switching engines)
export const syncEditorSettings = (view: EditorView | null) => {
  view?.dispatch({ effects: settingsEffects() });
};

// only while a snippet is active, otherwise false falls through to the keys below
const snippetNavigation: KeyBinding[] = [
  { key: 'Tab', run: (target) => hasNextSnippetField(target.state) && nextSnippetField(target) },
  {
    key: 'Shift-Tab',
    run: (target) => hasPrevSnippetField(target.state) && prevSnippetField(target),
  },
  {
    key: 'Escape',
    run: (target) =>
      (hasNextSnippetField(target.state) || hasPrevSnippetField(target.state)) &&
      clearSnippet(target),
  },
];

// Don't dispatch here. The store notifies its subscriber synchronously and
// that already dispatches (syncEditorSettings), so a second dispatch would use
// this command's stale `state` and CodeMirror rejects it.
const toggleWrap: StateCommand = () => {
  storeToggleWrap();
  return true;
};

const changeFontSize = (delta: number): StateCommand => {
  return () => {
    const before = getEditorSettings().fontSize;
    storeChangeFontSize(delta);
    return getEditorSettings().fontSize !== before;
  };
};

// VSCode's shortcuts. `Mod` is Ctrl on Win/Linux, Cmd on macOS. Tab is
// vscodeTab, not indentWithTab.
export const vscodeKeymap: KeyBinding[] = [
  ...snippetNavigation,
  { key: 'Tab', run: vscodeTab, shift: indentLess },
  { key: 'Mod-]', run: indentMore },
  { key: 'Mod-[', run: indentLess },
  { key: 'Mod-/', run: toggleComment },
  { key: 'Shift-Mod-k', run: deleteLine },
  { key: 'Alt-ArrowUp', run: moveLineUp },
  { key: 'Alt-ArrowDown', run: moveLineDown },
  { key: 'Shift-Alt-ArrowUp', run: copyLineUp },
  { key: 'Shift-Alt-ArrowDown', run: copyLineDown },
  { key: 'Alt-z', run: toggleWrap },
  { key: 'Mod-=', run: changeFontSize(1) },
  { key: 'Mod--', run: changeFontSize(-1) },
];
