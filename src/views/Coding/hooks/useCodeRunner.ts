import { useCallback, useEffect, useState } from 'react';
import { holdCodeRunner, requestCodeRunnerSession } from '@/api';
import type { CodeRunnerStatus } from '@/api';
import { useAppSelector } from '@/store/hooks';

// A start from off takes about a minute, so the first check waits a little
// and later ones are spaced out. A whole class can sit behind one school IP,
// and every one of these requests counts toward that IP's rate limit.
const FIRST_POLL_MS = 15000;
const POLL_MS = 10000;
const MAX_POLLS = 30;

const isSettled = (status: CodeRunnerStatus) =>
  status.state === 'ready' || status.state === 'offline' || status.dailyLimitReached;

// The Java/Python runner is a VM that is switched off while nobody uses it.
// While `enabled`, this asks the backend to switch it on and follows it until
// it is ready. `status` stays null when the backend can't be asked (logged
// out, network error); the Run button then behaves as it always has and the
// server has the final say.
export const useCodeRunner = (enabled: boolean) => {
  const token = useAppSelector((state) => state.user.token);
  const [status, setStatus] = useState<CodeRunnerStatus | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled || !token) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let polls = 0;

    const poll = async () => {
      const next = await requestCodeRunnerSession().catch(() => null);
      if (cancelled) return;
      setStatus(next);
      if (!next || isSettled(next)) return;

      polls += 1;
      if (polls >= MAX_POLLS) {
        setTimedOut(true);
        return;
      }
      timer = setTimeout(poll, polls === 1 ? FIRST_POLL_MS : POLL_MS);
    };

    setTimedOut(false);
    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, token, attempt]);

  const wake = useCallback(() => setAttempt((n) => n + 1), []);

  const hold = useCallback(
    async (minutes: number) => {
      setStatus(await holdCodeRunner(minutes));
      wake();
    },
    [wake],
  );

  return { status: enabled ? status : null, timedOut, wake, hold };
};
