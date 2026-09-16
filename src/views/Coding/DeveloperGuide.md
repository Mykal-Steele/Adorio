# Coding Page Developer Guide

## High-Level Flow

1. [`Coding`](index.tsx) loads the class list from [`constants/classes.ts`](constants/classes.ts) and that class's problems via [`getProblemsByClass`](problems.ts), restoring the last-visited class/problem and any saved code with [`utils/progress.ts`](utils/progress.ts).
2. `ClassTabs` switches the active class; `ProblemList` (scoped to that class) switches the active problem, rehydrating starter code or a saved draft and clearing results.
3. `CodeEditor` (CodeMirror, themed by [`constants/editorTheme.ts`](constants/editorTheme.ts)) captures edits and autosaves the draft (debounced) via `progress.ts` — editing after a run clears the on-screen results since they no longer describe the current code, but a problem's persisted "solved" status only changes on the next actual run or an explicit reset.
4. Running tests calls [`CodeRunner.execute`](CodeRunner.ts), feeding `ResultsPanel` and `TestResults`.

## Modules & Responsibilities

### Data & Types

- [`problems.ts`](problems.ts): the problem registry (id, classId, description, starterCode, tests, metadata).
- [`constants/classes.ts`](constants/classes.ts): the class registry (currently just `Algorithms`) — add a new entry here, then tag problems with its `classId`, to introduce a new category of exercises.
- [`types/index.ts`](types/index.ts): `Problem` and `ProblemClass` shapes.
- [`utils/progress.ts`](utils/progress.ts): localStorage persistence — `saveCode`/`saveCodeDebounced` (draft only, preserves the last run's results), `saveRunResult` (code + results together, right after a run), `loadProgress`, `clearProgress`, `isSolved`, and the last-active class/problem pointers.

### Core Execution (`CodeRunner`)

- `CodeRunner.isEqual`: deep comparison for primitives, arrays, objects, trimmed strings.
- `CodeRunner.formatValue`: normalizes values for display.
- `CodeRunner.extractErrorInfo`: parses stacks for approximate line numbers (offset by the execution wrapper).
- `CodeRunner.createConsoleProxy`: captures `log`/`info`/`warn`/`error` per test run.
- `CodeRunner.execute`: for each test, wraps the user's code, obtains the function/class via `getUserCallable`, and dispatches to `runFunctionTestWithOutput` or `runClassTestWithOutput`, aggregating pass/fail plus captured logs.

### UI Components

- `ClassTabs`: switches the active class.
- `ProblemList`: lists the active class's problems, sortable by difficulty, marks the active one and any solved ones.
- `ProblemDetails`: renders description, constraints, examples.
- `CodeEditor`: CodeMirror wrapper, emits `onChange`.
- `ResultsPanel`: run/reset controls and the pass/fail summary.
- `TestResults`: per-test pass/fail, expected vs. actual, console output (via `ConsoleOutput`).

### State & Actions (`Coding` component)

- `activeClassId` / `activeProblemId`: current selection.
- `code`: bound to the editor, persisted via `progress.ts`.
- `results`: populated from `CodeRunner.execute`; cleared whenever the code is edited so it never describes stale code.
- `solvedIds`: which problems currently pass, driven by the last run's stored result — updated on every run and on reset.
- `editorKey`: forces a fresh CodeMirror instance (clean undo history) on problem switch or reset.

## Extending Challenges

1. To add a new class: add an entry to `constants/classes.ts`.
2. To add a new problem: add an entry to `problems.ts` with a unique `id`, the `classId` it belongs to, `functionName` (plus `methodName` for class-based problems), `starterCode`, and a `tests` array (`name`, `args`, `expected`). `examples`/`constraints` are optional but recommended.
3. Keep `functionName`/`methodName` unique per problem — user code runs inside a shared scope per test.

## Debugging Tips

- Console output from user solutions appears inside each test result.
- Runtime errors include approximate line numbers derived by `extractErrorInfo`; align starter templates to keep offsets stable.
- Class-based problems instantiate with spread `args`; the constructor signature should accept the provided tuple.
