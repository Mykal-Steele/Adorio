const deepEqual = (a, b) => {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
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
    for (const key of aKeys) {
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
};

const toLogString = (value) => {
  if (typeof value === 'string') return value;
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  ) {
    return String(value);
  }
  if (typeof value === 'undefined') return 'undefined';
  if (typeof value === 'function') return value.toString();
  try {
    return JSON.stringify(value);
  } catch (error) {
    return Object.prototype.toString.call(value);
  }
};

const cloneValue = (value) => {
  try {
    // structuredClone is widely available in modern browsers
    return typeof structuredClone === 'function'
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  } catch (error) {
    if (typeof value === 'function') {
      return value.toString();
    }
    if (value && typeof value === 'object') {
      return Object.prototype.toString.call(value);
    }
    return value;
  }
};

const resetGlobals = () => {
  delete globalThis.__runnerModule;
  delete globalThis.__runnerRequire;
  delete globalThis.__consoleProxy;
};

self.onmessage = (event) => {
  const { code, tests } = event.data;

  const logs = [];
  const consoleProxy = ['log', 'info', 'warn', 'error'].reduce(
    (proxy, method) => {
      proxy[method] = (...args) => {
        logs.push(args.map(toLogString).join(' '));
      };
      return proxy;
    },
    {}
  );

  const module = { exports: {} };
  const require = () => {
    throw new Error('External modules are disabled in this environment.');
  };
  const console = consoleProxy;

  try {
    // Use Function constructor to evaluate code safely in the worker
    const evalCode = new Function(
      'module',
      'exports',
      'require',
      'console',
      `"use strict";\n${code}\nreturn module.exports || (typeof generatePrimes !== 'undefined' ? generatePrimes : null);`
    );

    const solution = evalCode(module, module.exports, require, console);

    if (typeof solution !== 'function') {
      throw new Error(
        'Make sure you export a function. Example: module.exports = generatePrimes;'
      );
    }

    const testResults = tests.map((test) => {
      const start = performance.now();
      let output;
      let passed = false;
      let errorDetail = null;

      try {
        output = solution(...test.args);
        passed = deepEqual(output, test.expected);
      } catch (error) {
        errorDetail = {
          message: error?.message || String(error),
          stack: error?.stack || null,
        };
      }

      const duration = performance.now() - start;

      return {
        name: test.name,
        args: cloneValue(test.args),
        expected: cloneValue(test.expected),
        output: cloneValue(output),
        passed: Boolean(passed && !errorDetail),
        error: errorDetail,
        duration,
      };
    });

    const allPassed =
      testResults.length === 0 || testResults.every((test) => test.passed);

    self.postMessage({
      status: allPassed ? 'success' : 'fail',
      logs,
      tests: testResults,
    });
  } catch (error) {
    self.postMessage({
      status: 'error',
      error: error?.message || String(error),
      logs,
      tests: [],
    });
  }
};

self.onerror = (event) => {
  event.preventDefault();
  self.postMessage({
    status: 'error',
    error:
      event?.message || 'An unknown error occurred while executing the code.',
    logs: [],
    tests: [],
  });
};
