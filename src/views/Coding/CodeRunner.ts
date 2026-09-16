import type { TestCase } from './types';

export interface TestRunResult {
  name: string;
  kind?: 'call' | 'stdio';
  args: unknown[];
  stdin?: string;
  expected: unknown;
  output: unknown;
  passed: boolean;
  duration: number;
  error?: string;
  logs: string[];
}

export interface ExecuteResult {
  status: string;
  tests: TestRunResult[];
  error?: string;
}

/**
 * Code execution service - handles running user code safely
 */
export class CodeRunner {
  // Compare two values for equality (with string trimming and deep object/array comparison)
  static isEqual(a, b) {
    if (Object.is(a, b)) return true;

    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((item, i) => this.isEqual(item, b[i]));
    }

    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      return keysA.length === keysB.length && keysA.every((key) => this.isEqual(a[key], b[key]));
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return a.trim() === b.trim();
    }

    return false;
  }

  // Format values for display in output
  static formatValue(value) {
    if (typeof value === 'undefined') return 'undefined';
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  // Extract line number from error, mapped back onto the user's own code.
  // User code runs inside a `new Function` body with wrapper lines above it
  // ("use strict" plus the console-proxy prelude), so a stack-trace line
  // number points into the wrapper. The offset is derived from the actual
  // wrapper text instead of hardcoded, so wrapper edits can't silently shift
  // every reported line number.
  static extractErrorInfo(error, code, wrappedCode = null) {
    let message = error.message || String(error);
    let lineInfo = '';

    // Try to extract line number from error stack or message
    if (error.stack) {
      // Look for line number in stack trace patterns
      const stackPatterns = [
        /<anonymous>:(\d+):\d+/, // Chrome/V8
        /eval.*:(\d+):\d+/, // Firefox eval
        /Function.*:(\d+):\d+/, // General function pattern
      ];

      for (const pattern of stackPatterns) {
        const match = error.stack.match(pattern);
        if (match) {
          const reportedLine = parseInt(match[1]);
          // The user's first line sits one past "use strict" plus every line
          // of the wrapper that precedes their code.
          const userFirstLine = wrappedCode ? wrappedCode.split(code)[0].split('\n').length + 1 : 5;
          const lineNum = reportedLine - userFirstLine + 1;

          const codeLines = code.split('\n');
          if (lineNum > 0 && lineNum <= codeLines.length) {
            lineInfo = ` (line ${lineNum})`;
            break;
          }
        }
      }
    }

    return message + lineInfo;
  }

  // Create console proxy to capture all console output
  static createConsoleProxy() {
    const logs = [];

    const proxy = {
      log: (...args) =>
        logs.push(
          args
            .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
            .join(' '),
        ),
      info: (...args) =>
        logs.push(
          args
            .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
            .join(' '),
        ),
      warn: (...args) =>
        logs.push(
          '⚠️ ' +
            args
              .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
              .join(' '),
        ),
      error: (...args) =>
        logs.push(
          '❌ ' +
            args
              .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
              .join(' '),
        ),
    };

    return { proxy, logs };
  }

  // Execute user code and run tests - now captures output for each test case
  static async execute(
    code: string,
    functionName: string,
    tests: TestCase[],
    methodName: string | null = null,
  ): Promise<ExecuteResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const testResults = tests.map((test, index) => {
            // Create a fresh console proxy for each test case
            const { proxy: consoleProxy, logs } = this.createConsoleProxy();
            let wrappedCode: string | null = null;

            try {
              // Inject console proxy into the code execution for each test
              wrappedCode = `
                const console = arguments[0];
                ${code}
                if (typeof ${functionName} === 'function') {
                  return ${functionName};
                } else {
                  throw new Error('Please define a ${
                    methodName ? 'class' : 'function'
                  } named ${functionName}');
                }
              `;

              // Get a fresh instance of the function/class for each test
              const userCallable = new Function(`"use strict";\n${wrappedCode}`)(consoleProxy);

              if (typeof userCallable !== 'function') {
                return {
                  name: test.name || `Test ${index + 1}`,
                  args: test.args,
                  expected: test.expected,
                  output: undefined,
                  passed: false,
                  duration: 0,
                  error: `Please define a ${
                    methodName ? 'class' : 'function'
                  } named ${functionName}`,
                  logs: [],
                };
              }

              return methodName
                ? this.runClassTestWithOutput(
                    userCallable,
                    test,
                    methodName,
                    consoleProxy,
                    logs,
                    index,
                    code,
                    wrappedCode,
                  )
                : this.runFunctionTestWithOutput(
                    userCallable,
                    test,
                    consoleProxy,
                    logs,
                    index,
                    code,
                    wrappedCode,
                  );
            } catch (error) {
              return {
                name: test.name || `Test ${index + 1}`,
                args: test.args,
                expected: test.expected,
                output: undefined,
                passed: false,
                duration: 0,
                error: this.extractErrorInfo(error, code, wrappedCode),
                logs: [],
              };
            }
          });

          const allPassed = testResults.every((result) => result.passed);
          resolve({
            status: allPassed ? 'success' : 'failure',
            tests: testResults,
          });
        } catch (error) {
          resolve({
            status: 'error',
            error: this.extractErrorInfo(error, code),
            tests: [],
          });
        }
      }, 50);
    });
  }

  // Run a single test for a function with output capture
  static runFunctionTestWithOutput(fn, test, consoleProxy, logs, index, code, wrappedCode) {
    const start = performance.now();

    try {
      const output = fn(...test.args);
      return {
        name: test.name || `Test ${index + 1}`,
        args: test.args,
        expected: test.expected,
        output,
        passed: this.isEqual(output, test.expected),
        duration: performance.now() - start,
        error: null,
        logs: [...logs], // Capture console output for this test case
      };
    } catch (error) {
      return {
        name: test.name || `Test ${index + 1}`,
        args: test.args,
        expected: test.expected,
        output: undefined,
        passed: false,
        duration: performance.now() - start,
        error: this.extractErrorInfo(error, code, wrappedCode),
        logs: [...logs],
      };
    }
  }

  // Run a single test for a class method with output capture
  static runClassTestWithOutput(
    ClassConstructor,
    test,
    methodName,
    consoleProxy,
    logs,
    index,
    code,
    wrappedCode,
  ) {
    const start = performance.now();

    try {
      // Create a fresh instance for each test case
      const instance = new ClassConstructor(...test.args);

      if (typeof instance[methodName] !== 'function') {
        return {
          name: test.name || `Test ${index + 1}`,
          args: test.args,
          expected: test.expected,
          output: undefined,
          passed: false,
          duration: performance.now() - start,
          error: `Method ${methodName} not found in class`,
          logs: [...logs],
        };
      }

      // Execute the method and capture its return value
      const output = instance[methodName]();

      return {
        name: test.name || `Test ${index + 1}`,
        args: test.args,
        expected: test.expected,
        output,
        passed: this.isEqual(output, test.expected),
        duration: performance.now() - start,
        error: null,
        logs: [...logs], // Capture console output for this test case
      };
    } catch (error) {
      return {
        name: test.name || `Test ${index + 1}`,
        args: test.args,
        expected: test.expected,
        output: undefined,
        passed: false,
        duration: performance.now() - start,
        error: this.extractErrorInfo(error, code, wrappedCode),
        logs: [...logs],
      };
    }
  }
}
