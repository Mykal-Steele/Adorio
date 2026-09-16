const LANGUAGE_LABEL: Record<string, string> = {
  javascript: 'JavaScript',
  java: 'Java',
};

interface LanguagePickerProps {
  languages: string[];
  activeLanguage: string;
  onSelect: (language: string) => void;
}

const LanguagePicker = ({ languages, activeLanguage, onSelect }: LanguagePickerProps) => {
  if (languages.length < 2) {
    return (
      <span className="font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
        {LANGUAGE_LABEL[activeLanguage] ?? activeLanguage}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language">
      {languages.map((language) => {
        const isActive = language === activeLanguage;
        return (
          <button
            key={language}
            onClick={() => onSelect(language)}
            aria-pressed={isActive}
            className={`rounded-[2px] px-[9px] py-[3px] font-paper-mono text-[11px] font-bold uppercase tracking-[.1em] transition-colors ${
              isActive
                ? 'border border-[var(--paper-ink)] bg-[var(--paper-yellow)] text-[var(--paper-ink)]'
                : 'border border-transparent text-[var(--paper-muted-2)] hover:text-[var(--paper-ink)]'
            }`}
          >
            {LANGUAGE_LABEL[language] ?? language}
          </button>
        );
      })}
    </div>
  );
};

export default LanguagePicker;
