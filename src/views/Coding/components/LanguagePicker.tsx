import { useRef, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import useClickOutside from '@/hooks/useClickOutside';

const LANGUAGE_LABEL: Record<string, string> = {
  javascript: 'JavaScript',
  java: 'Java',
  python: 'Python',
};

interface LanguagePickerProps {
  languages: string[];
  activeLanguage: string;
  onSelect: (language: string) => void;
}

// A dropdown, not a row of pill buttons: a language list only grows over
// time (JS → +Java → +Python → ...), and a segmented control that adds a
// button per option doesn't scale — it just crowds the header more with
// every addition, and reads ambiguously next to the engine toggle. A single
// button showing the current choice, opening a short list on click, is the
// pattern every real coding-practice site (LeetCode, HackerRank, CodeSignal)
// converges on for exactly this reason.
const LanguagePicker = ({ languages, activeLanguage, onSelect }: LanguagePickerProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setOpen(false));

  if (languages.length < 2) {
    return (
      <span className="font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
        {LANGUAGE_LABEL[activeLanguage] ?? activeLanguage}
      </span>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1 rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-2.5 py-1 font-paper-mono text-[11px] font-bold uppercase tracking-[.1em] text-[var(--paper-ink)] transition-transform hover:-translate-y-px"
      >
        {LANGUAGE_LABEL[activeLanguage] ?? activeLanguage}
        <ChevronDownIcon className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[140px] overflow-hidden rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] py-1 shadow-[3px_4px_0_rgba(60,44,24,.2)]"
        >
          {languages.map((language) => {
            const isActive = language === activeLanguage;
            return (
              <li key={language} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(language);
                    setOpen(false);
                  }}
                  className={`block w-full px-3.5 py-1.5 text-left font-paper-mono text-[12px] font-bold uppercase tracking-[.08em] transition-colors ${
                    isActive
                      ? 'bg-[var(--paper-yellow-soft)] text-[var(--paper-ink)]'
                      : 'text-[var(--paper-muted)] hover:bg-[rgba(60,44,24,.06)] hover:text-[var(--paper-ink)]'
                  }`}
                >
                  {LANGUAGE_LABEL[language] ?? language}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguagePicker;
