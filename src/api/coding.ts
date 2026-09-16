import API, { request } from './index';
import type { ExecuteResult } from '../views/Coding/CodeRunner';
import type { StdioTestCase } from '../views/Coding/types';

export const runCodingSubmission = (
  problemId: string,
  language: string,
  code: string,
  tests: StdioTestCase[],
): Promise<ExecuteResult> =>
  request(API.post('/coding/run', { problemId, language, code, tests }, { timeout: 30000 }));
