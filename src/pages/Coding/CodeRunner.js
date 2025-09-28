/**
 * Code execution service - handles running user code safely
 */
export class CodeRunner {
  // Compare two values for equality (with string trimming and deep object/array comparison)
  static isEqual(a, b) {
    if (Object.is(a, b)) return true;

    if (Array.isArray(a) && Array.isArray(b)) {
      return (
        a.length === b.length && a.every((item, i) => this.isEqual(item, b[i]))
      );
    }

    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      return (
        keysA.length === keysB.length &&
        keysA.every((key) => this.isEqual(a[key], b[key]))
      );
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

  // Create console proxy to capture all console output
  static createConsoleProxy() {
    const logs = [];

    const proxy = {
      log: (...args) =>
        logs.push(
          args
            .map((arg) =>
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            )
            .join(' ')
        ),
      info: (...args) =>
        logs.push(
          args
            .map((arg) =>
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            )
            .join(' ')
        ),
      warn: (...args) =>
        logs.push(
          '⚠️ ' +
            args
              .map((arg) =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              )
              .join(' ')
        ),
      error: (...args) =>
        logs.push(
          '❌ ' +
            args
              .map((arg) =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              )
              .join(' ')
        ),
    };

    return { proxy, logs };
  }

  // Get user function/class from code
  static getUserCallable(code, functionName, consoleProxy = null) {
    const wrappedCode = `
      ${code}
      if (typeof ${functionName} === 'function') {
        return ${functionName};
      } else {
        throw new Error('Please define a ${
          consoleProxy ? 'function or class' : 'function'
        } named ${functionName}');
      }
    `;

    if (consoleProxy) {
      return new Function('console', `"use strict";\n${wrappedCode}`)(
        consoleProxy
      );
    }
    return new Function(`"use strict";\n${wrappedCode}`)();
  }

  // Execute code and capture output for terminal display
  static async executeForOutput(
    code,
    functionName,
    sampleArgs = [],
    methodName = null
  ) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { proxy: consoleProxy, logs } = this.createConsoleProxy();

        try {
          const userCallable = this.getUserCallable(
            code,
            functionName,
            consoleProxy
          );

          if (typeof userCallable !== 'function') {
            logs.push(
              `❌ Error: Please define a ${
                methodName ? 'class' : 'function'
              } named ${functionName}`
            );
            return resolve({ status: 'error', logs, returnValue: null });
          }

          let returnValue = null;
          if (sampleArgs.length > 0) {
            try {
              if (methodName) {
                // Class execution
                const instance = new userCallable(...sampleArgs);
                if (typeof instance[methodName] === 'function') {
                  returnValue = instance[methodName]();
                  logs.push(`Return: ${this.formatValue(returnValue)}`);
                } else {
                  logs.push(
                    `❌ Error: Method ${methodName} not found in class`
                  );
                }
              } else {
                // Function execution
                returnValue = userCallable(...sampleArgs);
                logs.push(`Return: ${this.formatValue(returnValue)}`);
              }
            } catch (error) {
              logs.push(`❌ Runtime Error: ${error.message}`);
            }
          }

          resolve({ status: 'success', logs, returnValue });
        } catch (error) {
          logs.push(`❌ Error: ${error.message || String(error)}`);
          resolve({ status: 'error', logs, returnValue: null });
        }
      }, 50);
    });
  }

  // Execute user code and run tests
  static async execute(code, functionName, tests, methodName = null) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const userCallable = this.getUserCallable(code, functionName);

          if (typeof userCallable !== 'function') {
            return resolve({
              status: 'error',
              error: `Please define a ${
                methodName ? 'class' : 'function'
              } named ${functionName}`,
              tests: [],
            });
          }

          const testResults = tests.map((test) =>
            methodName
              ? this.runClassTest(userCallable, test, methodName)
              : this.runFunctionTest(userCallable, test)
          );

          const allPassed = testResults.every((result) => result.passed);
          resolve({
            status: allPassed ? 'success' : 'failure',
            tests: testResults,
          });
        } catch (error) {
          resolve({
            status: 'error',
            error: error.message || String(error),
            tests: [],
          });
        }
      }, 50);
    });
  }

  // Run a single test for a function
  static runFunctionTest(fn, test) {
    const start = performance.now();

    try {
      const output = fn(...test.args);
      return {
        args: test.args,
        expected: test.expected,
        output,
        passed: this.isEqual(output, test.expected),
        duration: performance.now() - start,
        error: null,
      };
    } catch (error) {
      return {
        args: test.args,
        expected: test.expected,
        output: undefined,
        passed: false,
        duration: performance.now() - start,
        error: error.message || String(error),
      };
    }
  }

  // Run a single test for a class method
  static runClassTest(ClassConstructor, test, methodName) {
    const start = performance.now();

    try {
      const instance = new ClassConstructor(...test.args);

      if (typeof instance[methodName] !== 'function') {
        return {
          args: test.args,
          expected: test.expected,
          output: undefined,
          passed: false,
          duration: performance.now() - start,
          error: `Method ${methodName} not found in class`,
        };
      }

      const output = instance[methodName]();
      return {
        args: test.args,
        expected: test.expected,
        output,
        passed: this.isEqual(output, test.expected),
        duration: performance.now() - start,
        error: null,
      };
    } catch (error) {
      return {
        args: test.args,
        expected: test.expected,
        output: undefined,
        passed: false,
        duration: performance.now() - start,
        error: error.message || String(error),
      };
    }
  }
}
