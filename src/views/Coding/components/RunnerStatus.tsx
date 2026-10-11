import { useState } from 'react';
import type { CodeRunnerStatus } from '@/api';

type RunnerStatusProps = {
  status: CodeRunnerStatus | null;
  timedOut: boolean;
  isAdmin: boolean;
  onRetry: () => void;
  onHold: (minutes: number) => Promise<void>;
};

type Notice = { text: string; busy: boolean; canRetry: boolean };

const HOLD_HOURS = [1, 2, 3];

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
  return {
    text: 'Starting the code runner. This takes about 30 seconds, then you can run your code.',
    busy: true,
    canRetry: false,
  };
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const RunnerStatus = ({ status, timedOut, isAdmin, onRetry, onHold }: RunnerStatusProps) => {
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
      {notice && (
        <p role="status" className="flex flex-wrap items-center gap-2">
          {notice.busy && (
            <span
              aria-hidden="true"
              className="h-2 w-2 animate-pulse rounded-full bg-[var(--paper-accent-strong)]"
            />
          )}
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
