import API, { request } from './index';
import type { ExecuteResult } from '../views/Coding/CodeRunner';
import type { StdioTestCase } from '../views/Coding/types';

export type CodeRunnerState = 'ready' | 'starting' | 'stopping' | 'off' | 'offline';

export type CodeRunnerStatus = {
  state: CodeRunnerState;
  // False where the backend can only report on the runner, not start it (the
  // failover copy, local dev).
  managed: boolean;
  keepUntil: string | null;
  dailyLimitReached: boolean;
};

export const runCodingSubmission = (
  problemId: string,
  language: string,
  code: string,
  tests: StdioTestCase[],
): Promise<ExecuteResult> =>
  request(API.post('/coding/run', { problemId, language, code, tests }, { timeout: 30000 }));

// Keeps the runner on for another idle window and starts it if it is off.
export const requestCodeRunnerSession = (): Promise<CodeRunnerStatus> =>
  request(API.post('/coding/runner/sessions'));

export const holdCodeRunner = (minutes: number): Promise<CodeRunnerStatus> =>
  request(API.post('/coding/runner/holds', { minutes }));
