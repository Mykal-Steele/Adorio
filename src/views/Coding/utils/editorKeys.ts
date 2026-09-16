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
let wrapOn = true;

const toggleWrap: StateCommand = ({ state, dispatch }) => {
  wrapOn = !wrapOn;
  dispatch(
    state.update({
      effects: [wrapCompartment.reconfigure(wrapOn ? EditorView.lineWrapping : [])],
    }),
  );
  return true;
};

export const wrapToggle = wrapCompartment.of(EditorView.lineWrapping);

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
];
