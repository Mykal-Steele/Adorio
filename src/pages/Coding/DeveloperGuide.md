# Coding Page Developer Guide

## High-Level Flow

1. [`Coding`](index.jsx) loads challenge metadata via [`getAllProblems`](problems.js) and restores saved code with [`ProblemStorage.loadProblemState`](utils/problemStorage.js).
2. Sidebar (`ProblemList`) swaps the active problem, rehydrating starter code and clearing results.
3. Editor (`CodeEditor`) captures user changes and persists them through [`ProblemStorage.saveProblemState`](utils/problemStorage.js).
4. Running samples/tests calls [`CodeRunner.executeForOutput`](CodeRunner.js) and [`CodeRunner.execute`](CodeRunner.js), feeding the UI (`ResultsPanel`, `TestResults`).

## Modules & Responsibilities

### Data & Types

- [`problems`](problems.js): Challenge registry (id, description, starterCode, tests, metadata).
- [`types`](types.js): Enums for `ProblemDifficulty`, `TestStatus` plus documentation of the problem schema.
- [`ProblemStorage`](utils/problemStorage.js): LocalStorage isolation per problem (keys: `code`, `timestamp`, etc.).

### Core Execution (`CodeRunner`)

- [`CodeRunner.isEqual`](CodeRunner.js): Deep comparison for primitives, arrays, objects, trimmed strings.
- [`CodeRunner.formatValue`](CodeRunner.js): Normalizes values for display, falling back to `String`.
- [`CodeRunner.extractErrorInfo`](CodeRunner.js): Parses stacks for approximate line numbers (offset by wrapper).
- [`CodeRunner.createConsoleProxy`](CodeRunner.js): Captures `log/info/warn/error` with emojis and JSON serialization.
- [`CodeRunner.getUserCallable`](CodeRunner.js): Wraps user code, returning the function/class by name; throws descriptive errors.
- [`CodeRunner.executeForOutput`](CodeRunner.js): Runs a single invocation (sample preview). Injects proxy console, captures return value/logs/errors.
- [`CodeRunner.execute`](CodeRunner.js): Orchestrates full test run. For each test it:
  1. Creates fresh console proxy and VM wrapper.
  2. Obtains callable via `Function` constructor.
  3. Dispatches to [`CodeRunner.runFunctionTestWithOutput`](CodeRunner.js) or [`CodeRunner.runClassTestWithOutput`](CodeRunner.js).
  4. Aggregates pass/fail plus captured logs.
- Legacy helpers ([`CodeRunner.runFunctionTest`](CodeRunner.js), [`CodeRunner.runClassTest`](CodeRunner.js)) retained for backward compatibility.

### UI Components

- [`ProblemList`](components/ProblemList.jsx): Lists challenges, highlights active entry, invokes `onProblemSelect`.
- [`ProblemDetails`](components/ProblemDetails.jsx): Renders description, constraints, examples.
- [`CodeEditor`](components/CodeEditor.jsx): Monaco-based editor (see file for theme/setup) emitting `onChange`.
- [`ResultsPanel`](components/ResultsPanel.jsx): Displays run status, tone badge, reset workflow (`handleReset` toggles safety prompt).
- [`TestResults`](components/TestResults.jsx): Shows per-test pass/fail, expected vs. actual, console logs.

### State & Actions (`Coding` component)

- `activeProblemId`: `ProblemList` selection.
- `code`: Bound to editor; persisted via `ProblemStorage`.
- `results`: Populated from `CodeRunner.execute`.
- `isRunning`: Guards concurrent runs.
- `editorKey`: Forces editor remount on reset for fresh Monaco instance.

Key callbacks:

- `handleProblemSelect(id)`: Loads problem meta, code, clears results.
- `handleCodeChange(nextCode)`: Updates state + storage debounce (see component file for implementation details).
- `handleRunTests()`: Defensive checks (empty code, missing function), triggers `execute`.
- `handleReset()`: Two-step reset (first click resets to starter, second removes saved code from storage).

## CSP & Backend URL Notes

[`vite.config.js`](../../vite.config.js) injects a runtime-configurable backend URL with per-build nonce. Ensures the coding sandbox still allows `'unsafe-eval'` while maintaining CSP integrity.

## Extending Challenges

1. Add new entry to [`problems`](problems.js):
   - Provide `id`, `title`, `difficulty`, `functionName` (and `methodName` for class tasks).
   - Supply `starterCode` template and `tests` array (`name`, `args`, `expected`).
   - Optionally include `examples`, `constraints`, `hints`.
2. Ensure unique `functionName`/`methodName` to avoid collisions when user code runs inside the shared scope.
3. Consider `CodeRunner.isEqual` constraints when designing expectations (e.g., order-sensitive arrays, trimmed strings).

## Debugging Tips

- Console output from user solutions appears inside each test result (thanks to `consoleProxy`).
- Runtime errors include approximate line numbers derived by `extractErrorInfo`; align starter templates to keep offsets stable.
- For class problems, remember tests instantiate with spread `args`; constructor signature should accept the provided tuple.
