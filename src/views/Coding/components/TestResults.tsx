import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { CodeRunner } from '../CodeRunner';
import ConsoleOutput from './ConsoleOutput';
import { withFriendlyRetryNote } from '../utils/errorMessages';
import type { ExecuteResult, TestRunResult } from '../CodeRunner';

interface TestResultsProps {
  results: ExecuteResult | null;
  isRunning: boolean;
}

const formatDuration = (duration: number) => {
  if (typeof duration !== 'number' || Number.isNaN(duration)) return '<0.01ms';
  return `${Math.max(duration, 0.01).toFixed(2)}ms`;
};

const TestTicket = ({ test }: { test: TestRunResult }) => {
  const isSuccess = test.passed && !test.error;
  // A passing test's detail (input/expected/actual) is only useful for
  // double-checking, not for debugging — collapsed by default so a run with
  // a dozen passes isn't a dozen full cards to scroll through. A failure is
  // exactly what someone opened this panel to read, so it starts open.
  const [open, setOpen] = useState(!isSuccess);

  return (
    <div
      className={`rounded-[3px] border-[1.5px] ${
        isSuccess ? 'border-[#4f6b2b] bg-[#eef3e3]' : 'border-[#8d3a33] bg-[#f8ece9]'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left"
      >
        <span className="flex items-center gap-1.5">
          <ChevronDownIcon
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${isSuccess ? 'text-[#5c7a3a]' : 'text-[#a1493f]'} ${open ? 'rotate-180' : ''}`}
          />
          <span className={`text-sm font-bold ${isSuccess ? 'text-[#3c5220]' : 'text-[#7a2f29]'}`}>
            {isSuccess ? '✓ Passed' : '✗ Failed'} — {test.name}
          </span>
        </span>
        <span className="font-paper-mono text-xs text-[var(--paper-muted-2)]">
          {formatDuration(test.duration)}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4">
          {test.kind === 'stdio' ? (
            <div className="space-y-2.5">
              <div>
                <p className="mb-1 font-paper-mono text-[11px] uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                  stdin
                </p>
                <ConsoleOutput content={test.stdin ?? ''} minHeight={36} maxInitialHeight={120} />
              </div>
              <dl className="space-y-1 font-paper-mono text-[13px] leading-[1.6]">
                <div>
                  <dt className="inline text-[var(--paper-muted-2)]">expected </dt>
                  <dd className="inline whitespace-pre-wrap">{String(test.expected)}</dd>
                </div>
                {!test.error && (
                  <div>
                    <dt className="inline text-[var(--paper-muted-2)]">actual </dt>
                    <dd className="inline whitespace-pre-wrap">{String(test.output)}</dd>
                  </div>
                )}
              </dl>
            </div>
          ) : (
            <dl className="space-y-1 font-paper-mono text-[13px] leading-[1.6]">
              <div>
                <dt className="inline text-[var(--paper-muted-2)]">input </dt>
                <dd className="inline">{CodeRunner.formatValue(test.args)}</dd>
              </div>
              <div>
                <dt className="inline text-[var(--paper-muted-2)]">expected </dt>
                <dd className="inline">{CodeRunner.formatValue(test.expected)}</dd>
              </div>
              {!test.error && (
                <div>
                  <dt className="inline text-[var(--paper-muted-2)]">actual </dt>
                  <dd className="inline">{CodeRunner.formatValue(test.output)}</dd>
                </div>
              )}
            </dl>
          )}

          {test.logs && test.logs.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 font-paper-mono text-[11px] uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                console
              </p>
              <ConsoleOutput content={test.logs.join('\n')} />
            </div>
          )}

          {test.error && (
            <p className="mt-3 whitespace-pre-wrap rounded-[2px] border border-[#8d3a33] bg-[#f3ded9] p-2.5 font-paper-mono text-[13px] text-[#7a2f29]">
              {withFriendlyRetryNote(test.error)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const TestResults = ({ results, isRunning }: TestResultsProps) => {
  if (isRunning) {
    return (
      <p className="py-6 text-center font-paper-hand text-xl text-[var(--paper-muted)]">
        running your solution&hellip;
      </p>
    );
  }

  if (!results) {
    return (
      <p className="rounded-[3px] border border-dashed border-[var(--paper-line)] bg-[#f6f0df] px-4 py-5 text-center text-sm text-[var(--paper-muted)]">
        Write your solution and click &ldquo;Run tests&rdquo; to see results here.
      </p>
    );
  }

  if (results.status === 'error') {
    return (
      <div className="rounded-[3px] border-[1.5px] border-[#8d3a33] bg-[#f3ded9] p-4">
        <p className="font-paper-mono text-xs font-bold uppercase tracking-[.12em] text-[#7a2f29]">
          Error
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-[#7a2f29]">{results.error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {results.tests.map((test, index) => (
        <TestTicket key={`${test.name ?? 'test'}-${index}`} test={test} />
      ))}
    </div>
  );
};

export default TestResults;
