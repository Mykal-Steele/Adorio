import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { StreamLanguage } from '@codemirror/language';
import { java } from '@codemirror/legacy-modes/mode/clike';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { paperEditorTheme } from '../constants/editorTheme';
import { Language } from '../types';
import LanguagePicker from './LanguagePicker';

const javaLanguage = StreamLanguage.define(java);

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
      autocompletion({ activateOnTyping: true }),
      closeBrackets(),
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
