import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { javascript, javascriptLanguage, scopeCompletionSource } from '@codemirror/lang-javascript';
import { StreamLanguage } from '@codemirror/language';
import { java } from '@codemirror/legacy-modes/mode/clike';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { paperEditorTheme } from '../constants/editorTheme';
import { javaCompletionSource } from '../constants/javaCompletions';
import { Language } from '../types';
import LanguagePicker from './LanguagePicker';

const javaLanguage = StreamLanguage.define(java);
// .data.of(...) only builds the extension — it still has to be in the
// editor's `extensions` array below to actually take effect.
const javaCompletions = javaLanguage.data.of({ autocomplete: javaCompletionSource });

// globalThis introspection gets JS completions for every real built-in
// (Array, Object, Math, console, JSON, ...) and their members, not a
// hand-maintained list — this is what "knows the standard library" actually
// looks like when the runtime can be introspected directly, unlike Java.
const jsGlobalCompletions = javascriptLanguage.data.of({
  autocomplete: scopeCompletionSource(globalThis),
});

// Grammarly (and similar extensions) treat CodeMirror's contenteditable
// surface as a normal text field and inject its own UI into it, which reads
// user code as prose and clutters the editor. These are Grammarly's own
// documented opt-out attributes, applied directly to the editable DOM node.
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
  const extensions = useMemo(
    () => [
      language === Language.JAVA ? javaLanguage : javascript({ jsx: false }),
      language === Language.JAVA ? javaCompletions : jsGlobalCompletions,
      autocompletion({ activateOnTyping: true }),
      closeBrackets(),
      disableGrammarly,
      // Without this, a long line pushes the scroller (and its parent card)
      // wider instead of wrapping, so the page grows sideways past the fold.
      EditorView.lineWrapping,
      // Tab isn't bound to indentation by default — CodeMirror leaves it free
      // for accessibility (focus can Tab away). Opting in here is fine since
      // this is a dedicated code editor, not a form field.
      keymap.of([indentWithTab]),
    ],
    [language],
  );

  return (
    <section
      aria-labelledby="editor-h"
      className="relative rotate-[0.3deg] rounded-[3px] bg-[var(--paper-cream)] p-[clamp(16px,2vw,22px)] shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)]"
    >
      <span
        aria-hidden="true"
        className="absolute -top-3 right-9 h-[24px] w-20 rotate-[3deg] border-x border-dashed border-[rgba(60,44,24,.3)] bg-[rgba(242,199,68,.7)] shadow-[0_1px_3px_rgba(60,44,24,.2)]"
      />
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="editor-h" className="font-paper-hand text-2xl text-[var(--paper-accent)]">
          your solution
        </h2>
        <LanguagePicker
          languages={availableLanguages}
          activeLanguage={language}
          onSelect={onLanguageChange}
        />
      </div>
      <div className="overflow-hidden rounded-[2px] border-[1.5px] border-[var(--paper-ink)]">
        <CodeMirror
          value={code}
          height="380px"
          theme={paperEditorTheme}
          extensions={extensions}
          basicSetup={{
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            foldGutter: true,
            lineNumbers: true,
          }}
          onChange={onChange}
          aria-label={`Code editor for ${problemTitle}`}
        />
      </div>
    </section>
  );
};

export default CodeEditor;
