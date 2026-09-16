import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { codingRunSchema } from '../schemas/index.js';
import { environment } from '../config/environment.js';

const pistonHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Auth-Token': environment.piston.token,
});

// Wraps fetch so a DNS/TLS/connection failure throws an ApiError like every
// other failure path here, instead of a raw rejection reaching asyncHandler.
const pistonFetch = async (path, options) => {
  let res;
  try {
    res = await fetch(`${environment.piston.url}${path}`, options);
  } catch {
    throw ApiError.internalServerError('Could not reach the code execution service');
  }
  if (!res.ok) throw ApiError.internalServerError('Could not reach the code execution service');
  return res;
};

let javaVersionCache = null;

const resolveJavaVersion = async () => {
  if (javaVersionCache) return javaVersionCache;

  const res = await pistonFetch('/api/v2/runtimes', { headers: pistonHeaders() });
  const runtimes = await res.json();
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

const submitOne = async (version, code, stdin) => {
  const res = await pistonFetch('/api/v2/execute', {
    method: 'POST',
    headers: pistonHeaders(),
    body: JSON.stringify({
      language: 'java',
      version,
      files: [{ name: 'Main.java', content: code }],
      stdin,
    }),
  });
  return res.json();
};

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
