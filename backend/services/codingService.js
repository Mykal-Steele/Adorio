import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { codingRunSchema } from '../schemas/index.js';
import { environment } from '../config/environment.js';
import { prepareRunnerForSubmission } from './codeRunnerService.js';

const pistonHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Auth-Token': environment.piston.token,
});

// Piston can accept the connection and then never answer, and fetch has no
// timeout of its own. Kept well under the nginx sidecar's proxy_read_timeout
// (60s, infra/piston.bicep) so this fires first with a clean ApiError instead
// of tying up a concurrency slot forever.
const PISTON_TIMEOUT_MS = 30000;

// Set explicitly because Piston's defaults are undocumented, and a version bump
// could change how long a `while(true)` runs before the sandbox kills it.
// Our Piston caps run_timeout at 3000ms (PISTON_RUN_TIMEOUT, infra/piston.bicep)
// and answers 400 to anything higher, so raise that cap first.
const RUN_TIMEOUT_MS = 3000;
const COMPILE_TIMEOUT_MS = 10000;

// To add a language: an entry here (the id from Piston's /api/v2/runtimes and
// a file name, which Piston doesn't check for interpreted languages but keeps
// stack traces readable), install the package on the Piston VM
// (infra/piston.bicep), and add it to codingRunSchema's enum.
const LANGUAGE_CONFIG = {
  java: { pistonLanguage: 'java', fileName: 'Main.java' },
  python: { pistonLanguage: 'python', fileName: 'main.py' },
};

// Turns connection errors, non-2xx and bad JSON into ApiErrors so a raw
// rejection never reaches asyncHandler. Returns the parsed body.
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

// keyed by our language id, not Piston's, so two of ours sharing a Piston
// language can't collide
const versionCache = new Map();

const resolveVersion = async (language) => {
  if (versionCache.has(language)) return versionCache.get(language);

  const config = LANGUAGE_CONFIG[language];
  const runtimes = await pistonFetch('/api/v2/runtimes', { headers: pistonHeaders() });
  const match = runtimes.find((r) => r.language === config.pistonLanguage);
  if (!match) {
    throw ApiError.internalServerError(
      `${language} runtime is not installed on the execution service`,
    );
  }

  versionCache.set(language, match.version);
  return match.version;
};

// Max test cases from one submission running at once, so one run can't hog
// Piston while a whole class is submitting.
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

// Same as normalize() in the practice-question repo's MainTest.java files: unify
// line endings, drop leading/trailing blank lines, ignore trailing whitespace.
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

const submitOne = (config, version, code, stdin) =>
  pistonFetch('/api/v2/execute', {
    method: 'POST',
    headers: pistonHeaders(),
    body: JSON.stringify({
      language: config.pistonLanguage,
      version,
      files: [{ name: config.fileName, content: code }],
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

export const runSubmission = async ({ problemId, language, code, tests }, userId) => {
  const validated = validate(codingRunSchema, { problemId, language, code, tests });
  const config = LANGUAGE_CONFIG[validated.language];
  await prepareRunnerForSubmission(userId);
  const version = await resolveVersion(validated.language);

  const [firstTest, ...restTests] = validated.tests;
  const firstStart = Date.now();
  const firstSubmission = await submitOne(config, version, validated.code, firstTest.stdin);
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
    const submission = await submitOne(config, version, validated.code, test.stdin);
    return buildTestResult(test, submission, Date.now() - start);
  });

  const testResults = [buildTestResult(firstTest, firstSubmission, firstDuration), ...restResults];
  const allPassed = testResults.every((t) => t.passed);

  return {
    status: allPassed ? 'success' : 'failure',
    tests: testResults,
  };
};
