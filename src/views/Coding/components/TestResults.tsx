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

  return (
    <div
      className={`rounded-[3px] border-[1.5px] p-4 ${
        isSuccess ? 'border-[#4f6b2b] bg-[#eef3e3]' : 'border-[#8d3a33] bg-[#f8ece9]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`text-sm font-bold ${isSuccess ? 'text-[#3c5220]' : 'text-[#7a2f29]'}`}>
          {isSuccess ? '✓ Passed' : '✗ Failed'} — {test.name}
        </span>
        <span className="font-paper-mono text-xs text-[var(--paper-muted-2)]">
          {formatDuration(test.duration)}
        </span>
      </div>

      {test.kind === 'stdio' ? (
        <div className="mt-2.5 space-y-2.5">
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
        <dl className="mt-2.5 space-y-1 font-paper-mono text-[13px] leading-[1.6]">
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
