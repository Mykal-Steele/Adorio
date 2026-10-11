import { useEffect, useState } from 'react';
import type { CodeRunnerStatus } from '@/api';

type RunnerStatusProps = {
  status: CodeRunnerStatus | null;
  timedOut: boolean;
  isAdmin: boolean;
  // The user pressed Run while the runner was still starting.
  runQueued: boolean;
  onRetry: () => void;
  onHold: (minutes: number) => Promise<void>;
};

type Notice = { text: string; busy: boolean; canRetry: boolean };

const HOLD_HOURS = [1, 2, 3];

// Measured: 24 seconds from the start request until the runner takes code.
const START_SECONDS = 24;
const TICK_COUNT = 12;
const TICKS = Array.from({ length: TICK_COUNT }, (_, index) => index);

const getStartStep = (elapsed: number) => {
  if (elapsed < 8) return 'Waking the machine';
  if (elapsed < 18) return 'Loading Java and Python';
  return 'Almost ready';
};

// A wait with a number on it and something visibly moving feels shorter than
// the same wait behind a spinner, so this counts down from the measured start
// time and inks in one box every two seconds. The last box never fills on its
// own: it stays pulsing until the runner really is ready and this unmounts.
const StartingProgress = ({ runQueued }: { runQueued: boolean }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const remaining = Math.max(START_SECONDS - elapsed, 0);
  const filled = Math.min(Math.floor((elapsed / START_SECONDS) * TICK_COUNT), TICK_COUNT - 1);

  return (
    <div role="status" className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-medium">Starting the code runner. It takes {START_SECONDS} seconds.</p>
        <p className="font-paper-mono text-xs font-bold uppercase tracking-[.1em]">
          {remaining > 0 ? `${remaining}s left` : 'Any second now'}
        </p>
      </div>

      <div aria-hidden="true" className="flex gap-1">
        {TICKS.map((tick) => (
          <span
            key={tick}
            className={`h-2.5 flex-1 rounded-[2px] border-[1.5px] border-[var(--paper-ink)] transition-colors duration-300 ${
              tick < filled ? 'bg-[var(--paper-accent-strong)]' : 'bg-[var(--paper-cream)]'
            } ${tick === filled ? 'animate-pulse bg-[var(--paper-yellow)]' : ''}`}
          />
        ))}
      </div>

      <p className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-[var(--paper-muted)]">
        <span className="font-paper-mono text-xs uppercase tracking-[.1em]">
          {getStartStep(elapsed)}
        </span>
        <span>
          {runQueued
            ? 'Your run is queued. It starts by itself when the runner is up.'
            : 'Keep writing. Press Run now and it goes the moment the runner is up.'}
        </span>
      </p>
    </div>
  );
};

const getNotice = (status: CodeRunnerStatus, timedOut: boolean): Notice | null => {
  if (status.state === 'ready') return null;
  if (status.state === 'offline') {
    return {
      text: 'The code runner is offline right now because the main server is in maintenance. Please try again later.',
      busy: false,
      canRetry: true,
    };
  }
  if (status.dailyLimitReached) {
    return {
      text: 'The code runner has reached its limit for today. It will be back tomorrow.',
      busy: false,
      canRetry: false,
    };
  }
  if (timedOut) {
    return {
      text: 'The code runner is taking longer than usual to start.',
      busy: false,
      canRetry: true,
    };
  }
  return { text: '', busy: true, canRetry: false };
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const RunnerStatus = ({
  status,
  timedOut,
  isAdmin,
  runQueued,
  onRetry,
  onHold,
}: RunnerStatusProps) => {
  const [holdError, setHoldError] = useState<string | null>(null);
  const [isHolding, setIsHolding] = useState(false);

  if (!status) return null;

  const notice = getNotice(status, timedOut);
  const showAdmin = isAdmin && status.managed;
  if (!notice && !showAdmin) return null;

  const handleHold = async (hours: number) => {
    setIsHolding(true);
    setHoldError(null);
    try {
      await onHold(hours * 60);
    } catch (err) {
      setHoldError(err instanceof Error ? err.message : 'Could not keep the code runner on.');
    } finally {
      setIsHolding(false);
    }
  };

  const onUntil =
    status.keepUntil && new Date(status.keepUntil) > new Date()
      ? formatTime(status.keepUntil)
      : null;

  return (
    <div className="space-y-2.5 rounded-[3px] border-[1.5px] border-dashed border-[rgba(60,44,24,.5)] bg-[var(--paper-yellow-soft)] px-4 py-3 text-[13px] text-[var(--paper-accent-deep)]">
      {notice?.busy && <StartingProgress runQueued={runQueued} />}

      {notice && !notice.busy && (
        <p role="status" className="flex flex-wrap items-center gap-2">
          <span>{notice.text}</span>
          {notice.canRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="font-medium underline underline-offset-2"
            >
              Try again
            </button>
          )}
        </p>
      )}

      {showAdmin && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-paper-mono text-xs uppercase tracking-[.1em] text-[var(--paper-muted-2)]">
            Keep on for class
          </span>
          {HOLD_HOURS.map((hours) => (
            <button
              key={hours}
              type="button"
              disabled={isHolding}
              onClick={() => handleHold(hours)}
              className="rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] px-2.5 py-1 font-paper-mono text-xs font-bold transition-colors hover:bg-[var(--paper-yellow)] disabled:opacity-60"
            >
              {hours}h
            </button>
          ))}
          {onUntil && <span className="text-[var(--paper-muted)]">On until {onUntil}</span>}
          {holdError && <span className="text-[#7a2f29]">{holdError}</span>}
        </div>
      )}
    </div>
  );
};

export default RunnerStatus;
