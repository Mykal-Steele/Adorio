import React from 'react';
import type { MentionCandidate } from '../hooks/useMentionAutocomplete';

interface MentionSuggestionsProps {
  suggestions: MentionCandidate[];
  activeIndex: number;
  onSelect: (candidate: MentionCandidate) => void;
  onHover: (index: number) => void;
}

const MentionSuggestions = ({
  suggestions,
  activeIndex,
  onSelect,
  onHover,
}: MentionSuggestionsProps) => {
  if (suggestions.length === 0) return null;
  return (
    <ul
      role="listbox"
      aria-label="Mention suggestions"
      className="absolute bottom-12 left-0 z-50 max-h-48 w-64 overflow-y-auto rounded-[3px] border border-[rgba(60,44,24,.3)] bg-[var(--paper-cream)] py-1 shadow-[3px_4px_0_var(--paper-ink)]"
    >
      {suggestions.map((candidate, index) => (
        <li key={candidate._id} role="option" aria-selected={index === activeIndex}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(candidate);
            }}
            onMouseEnter={() => onHover(index)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
              index === activeIndex ? 'bg-[var(--paper-yellow-soft)]' : ''
            }`}
          >
            <span
              aria-hidden="true"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full font-paper-serif text-[11px] font-bold text-[var(--paper-cream)]"
              style={{ backgroundColor: '#7a4f10' }}
            >
              {candidate.username.charAt(0).toUpperCase()}
            </span>
            <span className="truncate font-bold">@{candidate.username}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default MentionSuggestions;
