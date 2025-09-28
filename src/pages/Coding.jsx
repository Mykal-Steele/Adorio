import React, { useEffect, useMemo, useState } from 'react';
import {
  CodeBracketIcon,
  CommandLineIcon,
  PlayIcon,
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const codingProblems = [
  {
    id: 'prime-generator',
    title: 'Prime Generator',
    difficulty: 'Beginner',
    summary: 'Generate all prime numbers between 2 and n (inclusive).',
    description:
      'Write a function `generatePrimes(n)` that returns an array of all prime numbers between 2 and n (inclusive). If n is less than 2, return an empty array. Your solution should run in better than O(n^2) time.',
    starterCode: `function generatePrimes(n) {
  if (typeof n !== "number") {
    throw new Error("n must be a number");
  }
  // write your solution here
}

module.exports = generatePrimes;`,
    examples: [
      {
        input: 'generatePrimes(10)',
        output: '[2, 3, 5, 7]',
        explanation: 'All prime numbers from 2 up to 10.',
      },
      {
        input: 'generatePrimes(1)',
        output: '[]',
        explanation: 'Returns an empty array because there are no primes <= 1.',
      },
    ],
    constraints: [
      '0 <= n <= 100000',
      'Input will always be a finite number',
      'Return a new array; do not mutate inputs',
    ],
    tests: [
      {
        name: 'basic range',
        args: [10],
        expected: [2, 3, 5, 7],
      },
      {
        name: 'smallest prime',
        args: [2],
        expected: [2],
      },
      {
        name: 'no primes',
        args: [1],
        expected: [],
      },
      {
        name: 'medium range',
        args: [30],
        expected: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29],
      },
    ],
  },
];

const deepEqual = (a, b) => {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  if (
    typeof a === 'object' &&
    a !== null &&
    typeof b === 'object' &&
    b !== null
  ) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(a[key], b[key]));
  }
  return false;
};

const formatValue = (value) => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const Coding = () => {
  const problems = useMemo(() => codingProblems, []);
  const [activeProblemId, setActiveProblemId] = useState(problems[0]?.id);
  const activeProblem = useMemo(
    () => problems.find((problem) => problem.id === activeProblemId),
    [problems, activeProblemId]
  );

  const [code, setCode] = useState(activeProblem?.starterCode || '');
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (activeProblem) {
      setCode(activeProblem.starterCode);
      setResults(null);
    }
  }, [activeProblem]);

  const runTests = () => {
    if (!activeProblem) return;
    setIsRunning(true);

    const logs = [];
    const module = { exports: {} };
    const exportsObj = module.exports;

    try {
      const sandboxConsole = {
        log: (...args) => logs.push(args.join(' ')),
        warn: (...args) => logs.push(args.join(' ')),
        error: (...args) => logs.push(args.join(' ')),
      };

      const executor = new Function(
        'module',
        'exports',
        'console',
        'require',
        `"use strict";\n${code}\nreturn module.exports || exports.default || (typeof generatePrimes !== 'undefined' ? generatePrimes : undefined);`
      );

      const exported = executor(module, exportsObj, sandboxConsole, () => {
        throw new Error('External modules are disabled in this environment.');
      });

      const solution =
        typeof exported === 'function'
          ? exported
          : typeof module.exports === 'function'
          ? module.exports
          : module.exports && typeof module.exports.default === 'function'
          ? module.exports.default
          : exported;

      if (typeof solution !== 'function') {
        throw new Error(
          'Make sure you export a function. Example: module.exports = generatePrimes;'
        );
      }

      const testResults = activeProblem.tests.map((test) => {
        const start = performance.now();
        let output;
        let passed = false;
        let error = null;

        try {
          output = solution(...test.args);
          passed = deepEqual(output, test.expected);
        } catch (err) {
          error = err;
        }

        const duration = performance.now() - start;

        return {
          name: test.name,
          args: test.args,
          expected: test.expected,
          output,
          passed,
          error,
          duration,
        };
      });

      const allPassed = testResults.every((test) => test.passed && !test.error);

      setResults({
        status: allPassed ? 'success' : 'fail',
        logs,
        tests: testResults,
      });
    } catch (error) {
      setResults({
        status: 'error',
        error: error.message || String(error),
        logs,
        tests: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (!activeProblem) {
    return (
      <div className='min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <SparklesIcon className='h-10 w-10 text-purple-400 mx-auto' />
          <p className='text-lg'>
            No coding challenges found. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-950 text-gray-100 py-10 px-4'>
      <div className='max-w-6xl mx-auto'>
        <header className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='p-3 rounded-xl bg-purple-600/20 border border-purple-500/40'>
                <CodeBracketIcon className='h-8 w-8 text-purple-300' />
              </div>
              <div>
                <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent'>
                  Coding Challenges
                </h1>
                <p className='text-gray-400'>
                  Practice JavaScript with curated interview-style problems.
                </p>
              </div>
            </div>
          </div>
          <div className='flex gap-3'>
            <button
              onClick={() => {
                setCode(activeProblem.starterCode);
                setResults(null);
              }}
              className='flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:border-purple-500/60 hover:bg-purple-600/10 transition-colors'
            >
              <ArrowPathIcon className='h-5 w-5' />
              Reset code
            </button>
            <button
              onClick={runTests}
              disabled={isRunning}
              className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50'
            >
              <PlayIcon className='h-5 w-5' />
              {isRunning ? 'Running...' : 'Run tests'}
            </button>
          </div>
        </header>

        <div className='grid lg:grid-cols-[320px_1fr] gap-6'>
          <aside className='space-y-4'>
            <div className='bg-gray-900/70 border border-gray-800 rounded-xl p-4 shadow-lg'>
              <div className='flex items-center gap-2 mb-4'>
                <CommandLineIcon className='h-5 w-5 text-purple-300' />
                <h2 className='text-lg font-semibold'>Problems</h2>
              </div>
              <div className='space-y-2'>
                {problems.map((problem) => {
                  const isActive = problem.id === activeProblem.id;
                  return (
                    <button
                      key={problem.id}
                      onClick={() => setActiveProblemId(problem.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isActive
                          ? 'border-purple-500/60 bg-purple-600/10'
                          : 'border-gray-800 hover:border-purple-500/40 hover:bg-purple-600/5'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <span className='font-medium text-gray-100'>
                          {problem.title}
                        </span>
                        <span className='text-xs uppercase tracking-wide text-purple-300'>
                          {problem.difficulty}
                        </span>
                      </div>
                      <p className='text-sm text-gray-400 mt-1'>
                        {problem.summary}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className='bg-gray-900/70 border border-gray-800 rounded-xl p-4 shadow-lg'>
              <h3 className='text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2'>
                How it works
              </h3>
              <ul className='text-sm text-gray-400 space-y-2 list-disc list-inside'>
                <li>Select a problem to view details.</li>
                <li>Write your solution in the editor.</li>
                <li>
                  Click <strong>Run tests</strong> to validate your code.
                </li>
                <li>
                  Use <strong>Reset code</strong> anytime to start over.
                </li>
              </ul>
            </div>
          </aside>

          <main className='space-y-6'>
            <section className='bg-gray-900/70 border border-gray-800 rounded-xl p-6 shadow-lg space-y-4'>
              <div className='flex flex-col gap-2'>
                <h2 className='text-2xl font-semibold text-gray-100'>
                  {activeProblem.title}
                </h2>
                <p className='text-gray-400'>{activeProblem.description}</p>
              </div>

              <div>
                <h3 className='text-sm font-semibold text-gray-300 uppercase tracking-wide mb-1'>
                  Constraints
                </h3>
                <ul className='list-disc list-inside text-sm text-gray-400 space-y-1'>
                  {activeProblem.constraints.map((constraint) => (
                    <li key={constraint}>{constraint}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className='text-sm font-semibold text-gray-300 uppercase tracking-wide mb-1'>
                  Examples
                </h3>
                <div className='space-y-3'>
                  {activeProblem.examples.map((example, index) => (
                    <div
                      key={index}
                      className='bg-gray-950/60 border border-gray-800 rounded-lg p-3 text-sm text-gray-300'
                    >
                      <p className='font-mono text-purple-200'>
                        Input:{' '}
                        <span className='text-gray-100'>{example.input}</span>
                      </p>
                      <p className='font-mono text-emerald-200'>
                        Output:{' '}
                        <span className='text-gray-100'>{example.output}</span>
                      </p>
                      <p className='text-gray-400 mt-1'>
                        {example.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className='bg-gray-900/70 border border-gray-800 rounded-xl shadow-lg overflow-hidden'>
              <div className='border-b border-gray-800 px-4 py-3 flex items-center justify-between'>
                <h3 className='text-sm font-semibold text-gray-300 uppercase tracking-wide'>
                  Editor
                </h3>
                <span className='text-xs text-gray-500'>JavaScript</span>
              </div>
              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                className='w-full min-h-[320px] bg-gray-950/80 text-gray-100 font-mono text-sm p-4 outline-none resize-y'
              />
            </section>

            <section className='bg-gray-900/70 border border-gray-800 rounded-xl shadow-lg p-6 space-y-4'>
              <div className='flex items-center gap-2'>
                <SparklesIcon className='h-5 w-5 text-purple-300' />
                <h3 className='text-lg font-semibold text-gray-100'>Results</h3>
              </div>

              {!results && (
                <p className='text-sm text-gray-400'>
                  Write a solution and run the tests to see feedback.
                </p>
              )}

              {results?.status === 'error' && (
                <div className='p-4 bg-red-900/30 border border-red-600/40 rounded-lg'>
                  <p className='text-red-300 font-semibold'>Runtime Error</p>
                  <p className='text-sm text-red-200 mt-1'>{results.error}</p>
                </div>
              )}

              {results?.tests?.length > 0 && (
                <div className='space-y-3'>
                  {results.tests.map((test) => (
                    <div
                      key={test.name}
                      className={`p-3 rounded-lg border text-sm ${
                        test.passed && !test.error
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-red-500/40 bg-red-500/10'
                      }`}
                    >
                      <div className='flex justify-between items-center'>
                        <p className='font-medium text-gray-100'>{test.name}</p>
                        <span className='text-xs text-gray-300'>
                          {test.duration.toFixed(2)} ms
                        </span>
                      </div>
                      <p className='text-gray-300 mt-2'>
                        <span className='font-semibold text-gray-100'>
                          Input:
                        </span>{' '}
                        <span className='font-mono text-purple-200'>
                          {formatValue(test.args)}
                        </span>
                      </p>
                      <p className='text-gray-300 mt-1'>
                        <span className='font-semibold text-gray-100'>
                          Expected:
                        </span>{' '}
                        <span className='font-mono text-emerald-200'>
                          {formatValue(test.expected)}
                        </span>
                      </p>
                      {test.error ? (
                        <p className='text-red-200 mt-1'>
                          Error: {test.error.message || String(test.error)}
                        </p>
                      ) : (
                        <p className='text-gray-300 mt-1'>
                          <span className='font-semibold text-gray-100'>
                            Your Output:
                          </span>{' '}
                          <span className='font-mono text-indigo-200'>
                            {formatValue(test.output)}
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {results?.logs?.length > 0 && (
                <div className='bg-gray-950/60 border border-gray-800 rounded-lg p-3'>
                  <p className='text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2'>
                    Console Output
                  </p>
                  <div className='space-y-2 text-sm font-mono text-gray-300 max-h-40 overflow-y-auto'>
                    {results.logs.map((log, index) => (
                      <div
                        key={index}
                        className='border-b border-gray-800/60 pb-1 last:border-none'
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Coding;
