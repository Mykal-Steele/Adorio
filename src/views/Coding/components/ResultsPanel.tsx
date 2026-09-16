import { useState } from 'react';
import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import type { ExecuteResult } from '../CodeRunner';

interface ResultsPanelProps {
  results: ExecuteResult | null;
  isRunning: boolean;
  onRunTests: () => void;
  onReset: () => void;
}

type Tone = 'pass' | 'warn' | 'error';

const getSummary = (results: ExecuteResult | null): { label: string; tone: Tone } | null => {
  if (!results) return null;
  if (results.status === 'success') return { label: 'All tests passed', tone: 'pass' };
  if (results.status === 'failure') {
    const total = results.tests.length;
    const passed = results.tests.filter((t) => t.passed).length;
    return { label: `${passed}/${total} tests passed`, tone: 'warn' };
  }
  if (results.status === 'error') return { label: 'Runtime error', tone: 'error' };
  return null;
};

const TONE_CLASS: Record<Tone, string> = {
  pass: 'border-[#4f6b2b] bg-[#e7efd5] text-[#3c5220]',
  warn: 'border-[var(--paper-accent-strong)] bg-[var(--paper-yellow-soft)] text-[var(--paper-accent-deep)]',
  error: 'border-[#8d3a33] bg-[#f3ded9] text-[#7a2f29]',
};

const TONE_ICON: Record<Tone, string> = { pass: '✓', warn: '▲', error: '✗' };

const ResultsPanel = ({ results, isRunning, onRunTests, onReset }: ResultsPanelProps) => {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const summary = getSummary(results);

  const handleResetClick = () => {
    if (confirmingReset) {
      onReset();
      setConfirmingReset(false);
    } else {
      setConfirmingReset(true);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] px-4 py-3.5 shadow-[3px_4px_0_rgba(60,44,24,.16)]">
      <div aria-live="polite" className="flex min-h-[30px] items-center gap-2">
        {summary && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-[3px] border-[1.5px] px-3 py-1 text-[13px] font-bold ${TONE_CLASS[summary.tone]}`}
          >
            <span aria-hidden="true">{TONE_ICON[summary.tone]}</span>
            {summary.label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {confirmingReset ? (
          <>
            <span className="font-paper-mono text-xs uppercase tracking-[.1em] text-[var(--paper-muted-2)]">
              Reset to starter code?
            </span>
            <button
              onClick={handleResetClick}
              className="rounded-[3px] border-[1.5px] border-[#8d3a33] bg-[#f3ded9] px-3 py-1.5 text-[13px] font-bold text-[#7a2f29]"
            >
              Yes, reset
            </button>
            <button
              onClick={() => setConfirmingReset(false)}
              className="text-[13px] font-medium text-[var(--paper-muted)] underline underline-offset-2"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleResetClick}
            className="flex items-center gap-1.5 rounded-[3px] border-[1.5px] border-dashed border-[rgba(60,44,24,.5)] px-3.5 py-2 text-[13px] font-medium text-[var(--paper-muted)] transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Reset
          </button>
        )}

        <button
          onClick={onRunTests}
          disabled={isRunning}
          title="Run tests (Ctrl/⌘+Enter)"
          className="flex -rotate-[0.6deg] items-center gap-1.5 rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-5 py-2 font-paper-mono text-[13px] font-bold uppercase tracking-[.1em] shadow-[3px_4px_0_var(--paper-ink)] transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          <PlayIcon className="h-4 w-4" />
          {isRunning ? 'Running…' : 'Run tests'}
        </button>
      </div>
    </div>
  );
};

export default ResultsPanel;
