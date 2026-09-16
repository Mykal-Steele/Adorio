# Coding Page Developer Guide

## High-Level Flow

1. [`pages/ClassCatalog.tsx`](pages/ClassCatalog.tsx) (mounted at `/coding`) lists the classes from [`constants/classes.ts`](constants/classes.ts), each with its solved count via [`isProblemSolved`](utils/progress.ts).
2. Picking a class routes to `/coding/[classId]`, which mounts [`pages/Practice.tsx`](pages/Practice.tsx) with that `classId`. `Practice` loads the class's problems via [`getProblemsByClass`](problems.ts), restoring the last-visited problem and any saved code/results via [`utils/progress.ts`](utils/progress.ts).
3. `ProblemList` (scoped to the class) switches the active problem; picking a problem with no saved draft loads its starter code for the first language it defines. `LanguagePicker` (inside `CodeEditor`) switches between a problem's available languages when it defines more than one.
4. `CodeEditor` (CodeMirror, themed by [`constants/editorTheme.ts`](constants/editorTheme.ts)) captures edits and autosaves the draft (debounced) via `progress.ts` — the last run's results stay on screen while editing until the next run press, and a problem's persisted "solved" status only changes on the next actual run or an explicit reset. The editor auto-formats on every newline insert (plus a Format button and Shift+Alt+F) via [`utils/formatCode.ts`](utils/formatCode.ts).
5. Running tests dispatches on the active language variant's `kind`: `'call'` variants run in-browser via [`CodeRunner.execute`](CodeRunner.ts); `'stdio'` variants POST to `runCodingSubmission` (`src/api/coding.ts` → `POST /api/coding/run`), which the backend grades against a self-hosted Piston instance. Both feed the same `ResultsPanel` and `TestResults`.

## Modules & Responsibilities

### Data & Types

- [`problems.ts`](problems.ts): the problem registry. Each `Problem` has an `id`, `classId`, description/difficulty/examples/constraints, and a `languages` map keyed by language id (`'javascript'`, `'java'`). `getProblemsByClass`, `getAllProblems`, and `getProblem` read from it; `getSortedProblems` orders a list by difficulty.
- [`constants/classes.ts`](constants/classes.ts): the class registry (`Algorithms`, `Java Fundamentals`) — add a new entry here, then tag problems with its `classId`, to introduce a new category of exercises.
- [`types/index.ts`](types/index.ts): `Problem`, `ProblemClass`, and the two language-variant shapes. A `CallLanguageVariant` (`kind: 'call'`) has `functionName` (plus `methodName` for class-based problems), `starterCode`, and `TestCase[]` (`args`/`expected`) — run entirely client-side. A `StdioLanguageVariant` (`kind: 'stdio'`) has `starterCode` and `StdioTestCase[]` (`stdin`/`expectedOutput`) — run server-side through Piston. A problem's `languages` map can mix both kinds (e.g. a JS `call` variant and a Java `stdio` variant on the same problem).
- [`utils/progress.ts`](utils/progress.ts): localStorage persistence, keyed per `problemId:language` — `saveCode`/`saveCodeDebounced` (draft only, preserves the last run's results), `saveRunResult` (code + results together, right after a run), `loadProgress`, `clearProgress`, `isProblemSolved` (true if any language variant of a problem has a stored `success` result), and the last-active problem pointer per class.

### Core Execution

- **`'call'` variants** — [`CodeRunner.execute`](CodeRunner.ts) wraps the user's JavaScript in a `new Function(...)`, resolves the named function/class directly (no separate lookup step), and for each test dispatches to `runFunctionTestWithOutput` or `runClassTestWithOutput`, aggregating pass/fail plus captured console logs. `CodeRunner.isEqual` does the pass/fail comparison (deep equality for arrays/objects, trimmed string compare); `extractErrorInfo` parses stack traces for approximate line numbers.
- **`'stdio'` variants** — `runCodingSubmission` posts `{ problemId, language, code, tests }` to the backend. `backend/services/codingService.js` submits each test's `stdin` to Piston, compares normalized stdout against `expectedOutput` (trims blank lines and trailing whitespace, same rule the practice repo's own `MainTest.java` uses), and returns a `TestRunResult[]` shaped the same as the client-side runner's output so `TestResults` doesn't need to know which path produced it.

### UI Components

- `ProblemList`: lists the active class's problems, sortable by difficulty, marks the active one and any solved ones.
- `ProblemDetails`: renders description, constraints, examples.
- `CodeEditor`: CodeMirror wrapper; renders `LanguagePicker` when a problem defines more than one language and emits `onChange`/`onLanguageChange`. Editing keys mirror VSCode (`utils/editorKeys.ts`: mid-line Tab inserts spaces, Ctrl+/ comments, Ctrl+Shift+K deletes a line, Alt+Up/Down moves lines, Shift+Alt+Up/Down duplicates, Alt+Z toggles wrap). IntelliSense is static lists, not a language server: Java keywords/types/dot-members (`constants/javaCompletions.ts`) plus snippet templates for both languages (`constants/snippets.ts`). The gear button (`components/EditorSettings.tsx`) exposes wrap/format/font-size toggles (shared store in `utils/editorKeys.ts`, applied via compartments so the editor never rebuilds) alongside the shortcut list.
- `ResultsPanel`: run/reset controls and the pass/fail summary.
- `TestResults`: per-test pass/fail; renders `args`/`expected`/`output` for `'call'` results or `stdin`/`expected`/`output` for `'stdio'` results, plus captured console output (via `ConsoleOutput`).

### State & Actions (`Practice` component)

- `activeProblemId` / `language`: current selection; `language` resets to the problem's first available language whenever the problem changes.
- `code`: bound to the editor, persisted via `progress.ts`.
- `results`: populated from whichever runner `handleRunTests` dispatched to; kept while the code is edited so it survives until the next run press (the persisted draft always keeps the latest code alongside the last results).
- `solvedIds`: recomputed from persisted progress after every run and reset — not live "does the current code pass" state.
- An internal execution id (bumped on every edit, reset, problem switch, and language switch) guards `handleRunTests`: if anything invalidates the run before it resolves, its result is discarded instead of overwriting newer state.
- `editorKey`: forces a fresh CodeMirror instance (clean undo history) on problem switch or reset.

## Extending Challenges

1. To add a new class: add an entry to `constants/classes.ts`.
2. To add a new problem: add an entry to `problems.ts` with a unique `id`, the `classId` it belongs to, and a `languages` map. For a `'call'` variant: `functionName` (plus `methodName` for class-based problems), `starterCode`, and a `tests` array (`name`, `args`, `expected`). For a `'stdio'` variant: `starterCode` and a `tests` array (`name`, `stdin`, `expectedOutput`). `examples`/`constraints` are optional but recommended.
3. Keep `functionName`/`methodName` unique per problem for `'call'` variants — user code runs inside a shared scope per test.
4. A `'stdio'` variant's `tests` are sent to the backend as-is and graded there — don't rely on anything client-side to validate them.

## Debugging Tips

- Console output from `'call'` solutions appears inside each test result.
- Runtime errors on `'call'` variants include line numbers mapped back onto the user's code by `extractErrorInfo`, which derives the wrapper offset from the actual wrapper text — no manual offset upkeep needed.
- Class-based `'call'` problems instantiate with spread `args`; the constructor signature should accept the provided tuple.
- `'stdio'` failures surface Piston's `stderr` (or a signal/exit-code message) as `error`; compilation failures short-circuit the whole submission with `status: 'error'` before any test runs.
