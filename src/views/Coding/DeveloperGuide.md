# Coding Page Developer Guide

## High-Level Flow

1. [`Coding`](index.tsx) loads challenge metadata via [`getAllProblems`](problems.ts) and restores saved code with [`ProblemStorage.loadProblemState`](utils/problemStorage.ts).
2. Sidebar (`ProblemList`) swaps the active problem, rehydrating starter code and clearing results.
3. Editor (`CodeEditor`) captures user changes and persists them through [`ProblemStorage.saveProblemState`](utils/problemStorage.ts).
4. Running samples/tests calls [`CodeRunner.executeForOutput`](CodeRunner.ts) and [`CodeRunner.execute`](CodeRunner.ts), feeding the UI (`ResultsPanel`, `TestResults`).

## Modules & Responsibilities

### Data & Types

- [`problems`](problems.ts): Challenge registry (id, description, starterCode, tests, metadata).
- [`types`](types/index.ts): `Problem`, `TestCase`, `ProblemExample` interfaces. `constants/enums.ts` holds `ProblemDifficulty` and `TestStatus`.
- [`ProblemStorage`](utils/problemStorage.ts): LocalStorage isolation per problem (keys: `code`, `results`, `functionName`, `methodName`, `lastModified`).

### Core Execution (`CodeRunner`)

All user code runs on the main thread via the `Function` constructor (no Web Worker) - there is no sandboxing beyond `"use strict"`, so a problem with an infinite loop will hang the tab.

- [`CodeRunner.isEqual`](CodeRunner.ts): Deep comparison for primitives, arrays, objects, trimmed strings.
- [`CodeRunner.formatValue`](CodeRunner.ts): Normalizes values for display, falling back to `String`.
- [`CodeRunner.extractErrorInfo`](CodeRunner.ts): Parses stacks for approximate line numbers (offset by wrapper).
- [`CodeRunner.createConsoleProxy`](CodeRunner.ts): Captures `log/info/warn/error` with emojis and JSON serialization.
- [`CodeRunner.getUserCallable`](CodeRunner.ts): Wraps user code, returning the function/class by name; throws descriptive errors.
- [`CodeRunner.executeForOutput`](CodeRunner.ts): Runs a single invocation (sample preview). Injects proxy console, captures return value/logs/errors.
- [`CodeRunner.execute`](CodeRunner.ts): Orchestrates full test run. For each test it:
  1. Creates fresh console proxy and `Function`-constructor wrapper.
  2. Obtains callable via `Function` constructor.
  3. Dispatches to [`CodeRunner.runFunctionTestWithOutput`](CodeRunner.ts) or [`CodeRunner.runClassTestWithOutput`](CodeRunner.ts).
  4. Aggregates pass/fail plus captured logs.
- Legacy helpers ([`CodeRunner.runFunctionTest`](CodeRunner.ts), [`CodeRunner.runClassTest`](CodeRunner.ts)) retained for backward compatibility.

User code must define a plain top-level `function <functionName>(...)` (or a class named `<functionName>` when `methodName` is set) - `typeof <functionName> === 'function'` is checked directly. This is not a `module.exports` style convention.

### UI Components

- [`ProblemList`](components/ProblemList.tsx): Lists challenges, highlights active entry, invokes `onProblemSelect`.
- [`ProblemDetails`](components/ProblemDetails.tsx): Renders description, constraints, examples.
- [`CodeEditor`](components/CodeEditor.tsx): CodeMirror-based editor (`@uiw/react-codemirror`, Tokyo Night theme), mounted with `dynamic({ ssr: false })` from `index.tsx` since CodeMirror crashes on SSR. Emits `onChange`.
- [`ResultsPanel`](components/ResultsPanel.tsx): Displays run status, tone badge, reset workflow (`handleReset` toggles safety prompt).
- [`TestResults`](components/TestResults.tsx): Shows per-test pass/fail, expected vs. actual, console logs (via `ResizableTerminal`).

### State & Actions (`Coding` component)

- `activeProblemId`: `ProblemList` selection.
- `code`: Bound to editor; persisted via `ProblemStorage`.
- `results`: Populated from `CodeRunner.execute`.
- `isRunning`: Guards concurrent runs.
- `editorKey`: Forces `CodeEditor` remount (fresh CodeMirror instance, including undo/redo history) on problem switch and reset.

Key callbacks:

- `handleProblemSelect(id)`: Saves current state if dirty, clears in-memory code/results, switches to new problem.
- `handleCodeChange(nextCode)`: Updates `code` state; a separate debounced effect persists it via `ProblemStorage.debouncedSave`.
- `handleRunTests()`: Runs `CodeRunner.execute`, guards against a stale response landing after the user switched problems mid-run.
- `handleReset()`: Immediately resets code to `starterCode` and clears saved storage. `ResultsPanel` requires two clicks within 3 seconds before invoking it, purely as a UI confirmation step - both clicks call the same `onReset` handler.

## Extending Challenges

1. Add new entry to [`problems`](problems.ts):
   - Provide `id`, `title`, `difficulty`, `functionName` (and `methodName` for class tasks).
   - Supply `starterCode` template (a plain `function`/`class` declaration, not `module.exports`) and `tests` array (`name`, `args`, `expected`).
   - Optionally include `examples`, `constraints`, `hints`.
2. Ensure unique `functionName`/`methodName` to avoid collisions when user code runs inside the shared scope.
3. Consider `CodeRunner.isEqual` constraints when designing expectations (e.g., order-sensitive arrays, trimmed strings).

## Debugging Tips

- Console output from user solutions appears inside each test result (thanks to `consoleProxy`).
- Runtime errors include approximate line numbers derived by `extractErrorInfo`; align starter templates to keep offsets stable.
- For class problems, remember tests instantiate with spread `args`; constructor signature should accept the provided tuple.
