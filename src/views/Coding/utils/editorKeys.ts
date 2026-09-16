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

// VSCode's Tab: with a selection (or the cursor sitting in the line's
// leading whitespace) it indents the whole line; mid-line it just inserts
// spaces up to the next tab stop at the cursor. CodeMirror's stock
// indentWithTab always does the former, which is why Tab "tabbed the whole
// line" no matter where the cursor was.
const vscodeTab: StateCommand = ({ state, dispatch }) => {
  if (state.readOnly) return false;
  const { from, to } = state.selection.main;
  if (from !== to) return indentMore({ state, dispatch });

  const line = state.doc.lineAt(from);
  if (/^\s*$/.test(line.text.slice(0, from - line.from))) {
    return indentMore({ state, dispatch });
  }

  const unit = getIndentUnit(state);
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

// Single source of truth for editor preferences, shared by the keyboard
// shortcuts above and the settings panel (which subscribes via
// useSyncExternalStore). Everything is applied through compartments, so
// toggling never rebuilds the editor or loses undo history.
export interface EditorSettings {
  wrap: boolean;
  formatOnNewline: boolean;
  fontSize: number;
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  wrap: true,
  formatOnNewline: true,
  fontSize: 16,
};

export const MIN_FONT_SIZE = 11;
export const MAX_FONT_SIZE = 24;

let settings: EditorSettings = { ...DEFAULT_EDITOR_SETTINGS };
const settingsListeners = new Set<() => void>();

export const subscribeEditorSettings = (listener: () => void) => {
  settingsListeners.add(listener);
  return () => {
    settingsListeners.delete(listener);
  };
};

export const getEditorSettings = () => settings;

const patchSettings = (patch: Partial<EditorSettings>) => {
  settings = { ...settings, ...patch };
  settingsListeners.forEach((listener) => listener());
};

const fontSizeTheme = (size: number) => EditorView.theme({ '&': { fontSize: `${size}px` } });

const settingsEffects = () => [
  wrapCompartment.reconfigure(settings.wrap ? EditorView.lineWrapping : []),
  fontSizeCompartment.reconfigure(fontSizeTheme(settings.fontSize)),
];

// Initial compartment values for the editor's extension list.
export const settingsCompartments = [
  wrapCompartment.of(EditorView.lineWrapping),
  fontSizeCompartment.of(fontSizeTheme(DEFAULT_EDITOR_SETTINGS.fontSize)),
];

// Re-applies every compartment setting to a live view (used by the settings
// panel, which has the view but no transaction of its own).
export const syncEditorSettings = (view: EditorView | null) => {
  view?.dispatch({ effects: settingsEffects() });
};

export const setWrap = (view: EditorView | null, wrap: boolean) => {
  patchSettings({ wrap });
  syncEditorSettings(view);
};

export const setFormatOnNewline = (formatOnNewline: boolean) => {
  // No view sync needed — the format listener reads this flag live.
  patchSettings({ formatOnNewline });
};

export const setFontSize = (view: EditorView | null, fontSize: number) => {
  patchSettings({
    fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(fontSize))),
  });
  syncEditorSettings(view);
};

export const resetEditorSettings = (view: EditorView | null) => {
  patchSettings({ ...DEFAULT_EDITOR_SETTINGS });
  syncEditorSettings(view);
};

const toggleWrap: StateCommand = ({ state, dispatch }) => {
  patchSettings({ wrap: !settings.wrap });
  dispatch(state.update({ effects: settingsEffects() }));
  return true;
};

const changeFontSize = (delta: number): StateCommand => {
  return ({ state, dispatch }) => {
    const next = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, settings.fontSize + delta));
    if (next === settings.fontSize) return false;
    patchSettings({ fontSize: next });
    dispatch(state.update({ effects: settingsEffects() }));
    return true;
  };
};

// While a snippet is active, Tab/Shift-Tab jump between its placeholders
// and Escape cancels it — returning false falls through to the bindings
// below when no snippet is active.
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

// VSCode's editing shortcuts, in one keymap. `Mod` is Ctrl on Win/Linux and
// Cmd on macOS, matching VSCode on each platform. Tab is deliberately NOT
// indentWithTab (see vscodeTab above).
export const vscodeKeymap: KeyBinding[] = [
  ...snippetNavigation,
  { key: 'Tab', run: vscodeTab, shift: indentLess },
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
