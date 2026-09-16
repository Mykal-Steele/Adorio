import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { codingRunSchema } from '../schemas/index.js';
import { environment } from '../config/environment.js';

const pistonHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Auth-Token': environment.piston.token,
});

// A Piston connection can succeed and then just never respond (no timeout of
// its own on the client side) — bounded well under the nginx sidecar's own
// proxy_read_timeout (60s, see infra/piston.bicep) so this fires first with a
// clean ApiError instead of leaving a concurrency slot tied up indefinitely.
const PISTON_TIMEOUT_MS = 30000;

// Piston has its own internal defaults for these, but relying on an
// undocumented default means a version bump could silently change how long
// a `while(true)` gets to run before the sandbox kills it. Setting them
// explicitly makes the infinite-loop protection a decision, not an accident.
const RUN_TIMEOUT_MS = 5000;
const COMPILE_TIMEOUT_MS = 10000;

// Wraps fetch (connection failures, non-2xx, and malformed JSON bodies) so
// every failure path here throws an ApiError like the rest of the service,
// instead of a raw rejection reaching asyncHandler. Returns the parsed body.
const pistonFetch = async (path, options) => {
  let res;
  try {
    res = await fetch(`${environment.piston.url}${path}`, {
      ...options,
      signal: AbortSignal.timeout(PISTON_TIMEOUT_MS),
    });
  } catch (error) {
    console.error('Piston fetch failed', { path, cause: error.cause?.code || error.message });
    throw ApiError.internalServerError('Could not reach the code execution service');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('Piston returned an error response', { path, status: res.status, body });
    throw ApiError.internalServerError('Could not reach the code execution service');
  }
  try {
    return await res.json();
  } catch (error) {
    console.error('Piston response was not valid JSON', { path, message: error.message });
    throw ApiError.internalServerError('Could not reach the code execution service');
  }
};

let javaVersionCache = null;

const resolveJavaVersion = async () => {
  if (javaVersionCache) return javaVersionCache;

  const runtimes = await pistonFetch('/api/v2/runtimes', { headers: pistonHeaders() });
  const match = runtimes.find((r) => r.language === 'java');
  if (!match)
    throw ApiError.internalServerError('Java runtime is not installed on the execution service');

  javaVersionCache = match.version;
  return javaVersionCache;
};

// Caps how many of one submission's test cases hit the execution service at
// once, so a single run doesn't monopolize capacity while other people's
// submissions are also in flight — relevant once many people are practicing
// at the same time (a class, not just everyday sparse traffic).
const TEST_CASE_CONCURRENCY = 4;

const mapWithConcurrency = async (items, limit, fn) => {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
};

// Mirrors the normalize() every MainTest.java in the source practice-question
// repo already implements: normalize line endings, drop leading/trailing blank
// lines, and ignore trailing whitespace on each remaining line.
const normalizeOutput = (output) => {
  const lines = output.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === '') start++;
  while (end > start && lines[end - 1].trim() === '') end--;
  return lines
    .slice(start, end)
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n');
};

const submitOne = (version, code, stdin) =>
  pistonFetch('/api/v2/execute', {
    method: 'POST',
    headers: pistonHeaders(),
    body: JSON.stringify({
      language: 'java',
      version,
      files: [{ name: 'Main.java', content: code }],
      stdin,
      run_timeout: RUN_TIMEOUT_MS,
      compile_timeout: COMPILE_TIMEOUT_MS,
    }),
  });

const buildTestResult = (test, submission, duration) => {
  const run = submission.run ?? {};
  const executionFailed = run.code !== 0 || Boolean(run.signal);
  const stdout = normalizeOutput(run.stdout ?? '');
  const expected = normalizeOutput(test.expectedOutput);
  const error = executionFailed
    ? (
        run.stderr ||
        (run.signal ? `Terminated by signal ${run.signal}` : `Exited with code ${run.code}`)
      ).trim()
    : undefined;

  return {
    name: test.name,
    kind: 'stdio',
    args: [],
    stdin: test.stdin,
    expected: test.expectedOutput,
    output: run.stdout ?? '',
    passed: !executionFailed && stdout === expected,
    duration,
    error,
    logs: [],
  };
};

export const runSubmission = async ({ problemId, language, code, tests }) => {
  const validated = validate(codingRunSchema, { problemId, language, code, tests });
  const version = await resolveJavaVersion();

  const [firstTest, ...restTests] = validated.tests;
  const firstStart = Date.now();
  const firstSubmission = await submitOne(version, validated.code, firstTest.stdin);
  const firstDuration = Date.now() - firstStart;

  if (firstSubmission.compile && firstSubmission.compile.code !== 0) {
    return {
      status: 'error',
      error: (
        firstSubmission.compile.stderr ||
        firstSubmission.compile.output ||
        'Compilation error'
      ).trim(),
      tests: [],
    };
  }

  const restResults = await mapWithConcurrency(restTests, TEST_CASE_CONCURRENCY, async (test) => {
    const start = Date.now();
    const submission = await submitOne(version, validated.code, test.stdin);
    return buildTestResult(test, submission, Date.now() - start);
  });

  const testResults = [buildTestResult(firstTest, firstSubmission, firstDuration), ...restResults];
  const allPassed = testResults.every((t) => t.passed);

  return {
    status: allPassed ? 'success' : 'failure',
    tests: testResults,
  };
};
