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

export class CodeRunner {
  // deep compare for arrays/objects, strings compare trimmed
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

  static formatValue(value) {
    if (typeof value === 'undefined') return 'undefined';
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  // User code runs inside a `new Function` body under "use strict" and the
  // console proxy prelude, so stack line numbers point into the wrapper.
  // The offset comes from the real wrapper text, not a hardcoded number, so
  // editing the wrapper doesn't shift every reported line.
  static extractErrorInfo(error, code, wrappedCode = null) {
    let message = error.message || String(error);
    let lineInfo = '';

    if (error.stack) {
      const stackPatterns = [
        /<anonymous>:(\d+):\d+/, // Chrome/V8
        /eval.*:(\d+):\d+/, // Firefox eval
        /Function.*:(\d+):\d+/,
      ];

      for (const pattern of stackPatterns) {
        const match = error.stack.match(pattern);
        if (match) {
          const reportedLine = parseInt(match[1]);
          // first user line is one past "use strict" plus the wrapper lines above it
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
            // fresh console per test so logs don't bleed between cases
            const { proxy: consoleProxy, logs } = this.createConsoleProxy();
            let wrappedCode: string | null = null;

            try {
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
        logs: [...logs],
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

      const output = instance[methodName]();

      return {
        name: test.name || `Test ${index + 1}`,
        args: test.args,
        expected: test.expected,
        output,
        passed: this.isEqual(output, test.expected),
        duration: performance.now() - start,
        error: null,
        logs: [...logs],
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
