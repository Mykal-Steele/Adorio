'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import AdSenseScript from '@/components/AdSenseScript';
import PaperTornEdge from '@/components/PaperTornEdge';
import { runCodingSubmission } from '@/api';
import ProblemList from '../components/ProblemList';
import ProblemDetails from '../components/ProblemDetails';
import ResultsPanel from '../components/ResultsPanel';
import TestResults from '../components/TestResults';
import RunnerStatus from '../components/RunnerStatus';
import { getProblemsByClass } from '../problems';
import { getClass } from '../constants/classes';
import { CodeRunner, type ExecuteResult } from '../CodeRunner';
import type { LanguageVariant } from '../types';
import { withFriendlyRetryNote } from '../utils/errorMessages';
import { useCodeRunner } from '../hooks/useCodeRunner';
import { useAppSelector } from '@/store/hooks';
import {
  loadProgress,
  saveCode,
  saveCodeDebounced,
  saveRunResult,
  clearProgress,
  isProblemSolved,
  getLastActiveProblem,
  setLastActiveProblem,
} from '../utils/progress';

const CodeEditor = dynamic(() => import('../components/CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] animate-pulse rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[#211d17]" />
  ),
});

interface PracticeProps {
  classId: string;
}

const Practice = ({ classId }: PracticeProps) => {
  const activeClass = getClass(classId);
  const classProblems = useMemo(() => getProblemsByClass(classId), [classId]);

  const [activeProblemId, setActiveProblemId] = useState(classProblems[0]?.id ?? null);
  const activeProblem = classProblems.find((p) => p.id === activeProblemId) ?? null;

  const availableLanguages = useMemo(
    () => (activeProblem ? Object.keys(activeProblem.languages) : []),
    [activeProblem],
  );
  const [language, setLanguage] = useState(availableLanguages[0] ?? '');
  const activeVariant: LanguageVariant | null = activeProblem?.languages[language] ?? null;

  const [code, setCode] = useState('');
  const [results, setResults] = useState<ExecuteResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => new Set());

  // JavaScript problems ('call') run in the browser. Only the Java/Python
  // ones ('stdio') need the server-side runner switched on.
  const isAdmin = useAppSelector((state) => Boolean(state.user.user?.isAdmin));
  const {
    status: runnerStatus,
    timedOut: runnerTimedOut,
    wake: wakeRunner,
    hold: holdRunner,
  } = useCodeRunner(activeVariant?.kind === 'stdio');
  // Pressing Run while the runner is still starting queues the run instead of
  // refusing it. It fires by itself the moment the runner is ready, so nobody
  // has to sit and watch for the button to come back.
  const [runQueued, setRunQueued] = useState(false);
  const runnerNotReady = Boolean(runnerStatus && runnerStatus.state !== 'ready');
  const runnerUnavailable =
    runnerNotReady &&
    (runnerStatus?.state === 'offline' || Boolean(runnerStatus?.dailyLimitReached));
  // Once the start has timed out, Run goes back to asking the server, which
  // retries the start and answers with the real state.
  const runnerStarting = runnerNotReady && !runnerUnavailable && !runnerTimedOut;
  const runnerReady = runnerStatus?.state === 'ready';
  const getRunBlockedLabel = () => {
    if (runnerUnavailable) return 'Runner offline';
    if (runnerStarting && runQueued) return 'Queued…';
    return null;
  };
  const runBlockedLabel = getRunBlockedLabel();

  // Any in-flight run is only allowed to write its results if nothing has
  // superseded it since — a code edit, a reset, or switching problem/language.
  // Bumping the id (and dropping isRunning) makes a stale run's eventual
  // resolution a no-op instead of a race that can clobber newer state.
  const executionIdRef = useRef(0);
  const invalidateActiveExecution = useCallback(() => {
    executionIdRef.current += 1;
    setIsRunning(false);
  }, []);

  const recomputeSolved = useCallback(() => {
    setSolvedIds(new Set(classProblems.filter(isProblemSolved).map((p) => p.id)));
  }, [classProblems]);

  // Restore the last-visited problem for this class after hydration — reading
  // localStorage during the initial render would make the server-rendered HTML
  // mismatch the client's.
  useEffect(() => {
    const lastProblemId = getLastActiveProblem(classId);
    const resolvedProblemId = classProblems.some((p) => p.id === lastProblemId)
      ? lastProblemId
      : (classProblems[0]?.id ?? null);
    setActiveProblemId(resolvedProblemId);
    recomputeSolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  // Reset to the problem's first available language whenever the problem changes.
  useEffect(() => {
    setLanguage(availableLanguages[0] ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProblem?.id]);

  useEffect(() => {
    invalidateActiveExecution();
    setRunQueued(false);
    if (!activeProblem || !activeVariant) return;
    setEditorKey((k) => k + 1);

    const saved = loadProgress(activeProblem.id, language);
    if (saved && saved.code.trim()) {
      setCode(saved.code);
      setResults(saved.results);
    } else {
      setCode(activeVariant.starterCode);
      setResults(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProblem, activeVariant, language]);

  const flushCurrentCode = useCallback(() => {
    if (activeProblem && activeVariant && code !== activeVariant.starterCode) {
      saveCodeDebounced.cancel();
      saveCode(activeProblem.id, language, code);
    }
  }, [activeProblem, activeVariant, language, code]);

  const flushCurrentCodeRef = useRef(flushCurrentCode);
  useEffect(() => {
    flushCurrentCodeRef.current = flushCurrentCode;
  }, [flushCurrentCode]);

  useEffect(() => {
    const handleBeforeUnload = () => flushCurrentCodeRef.current();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushCurrentCodeRef.current();
    };
  }, []);

  const handleProblemSelect = useCallback(
    (problemId: string) => {
      // A queued run belongs to the problem it was pressed on.
      setRunQueued(false);
      flushCurrentCode();
      setActiveProblemId(problemId);
      setLastActiveProblem(classId, problemId);
    },
    [flushCurrentCode, classId],
  );

  const handleLanguageChange = useCallback(
    (nextLanguage: string) => {
      setRunQueued(false);
      flushCurrentCode();
      setLanguage(nextLanguage);
    },
    [flushCurrentCode],
  );

  const handleCodeChange = useCallback(
    (nextCode: string) => {
      invalidateActiveExecution();
      setCode(nextCode);
      // Results intentionally stay on screen until the next Run press —
      // clearing them on every keystroke made the test output unusable.
      // The draft is still persisted on every edit (keeping the last run's
      // results alongside it) via saveCode below, so a reload restores the
      // latest code together with its last results.
      if (activeProblem && activeVariant && nextCode !== activeVariant.starterCode) {
        saveCodeDebounced(activeProblem.id, language, nextCode);
      } else {
        // Typed back to exactly the starter code before the debounce fired —
        // otherwise the stale queued save would still land and persist code
        // that's no longer on screen.
        saveCodeDebounced.cancel();
      }
    },
    [activeProblem, activeVariant, language, invalidateActiveExecution],
  );

  const handleRunTests = useCallback(async () => {
    if (!activeProblem || !activeVariant || isRunning || runBlockedLabel) return;
    if (runnerStarting) {
      setRunQueued(true);
      return;
    }

    const problemId = activeProblem.id;
    const runLanguage = language;
    const codeSnapshot = code;
    const executionId = ++executionIdRef.current;
    setIsRunning(true);

    let testResults: ExecuteResult;
    try {
      if (activeVariant.kind === 'call') {
        testResults = await CodeRunner.execute(
          codeSnapshot,
          activeVariant.functionName,
          activeVariant.tests,
          activeVariant.methodName ?? null,
        );
      } else {
        testResults = await runCodingSubmission(
          problemId,
          runLanguage,
          codeSnapshot,
          activeVariant.tests,
        );
      }
    } catch (err) {
      // verifyToken answers 403 for a bad/expired token (not 401), so both
      // mean "not logged in" here — anything else is a genuine run failure.
      const statusCode =
        err instanceof Error && 'statusCode' in err
          ? (err as { statusCode?: number }).statusCode
          : undefined;
      const isAuthError = statusCode === 401 || statusCode === 403;
      // 409 is the server saying the runner was off (it idled out while this
      // page sat open). The server has already started it; follow it again.
      if (statusCode === 409) wakeRunner();
      const rawMessage =
        err instanceof Error ? err.message : 'Failed to run your code. Please try again.';
      testResults = {
        status: 'error',
        error: isAuthError
          ? 'Please log in (or create an account) to run your code.'
          : withFriendlyRetryNote(rawMessage),
        tests: [],
      };
    }

    // Superseded by an edit, reset, or navigation while the run was in
    // flight — invalidateActiveExecution already reset isRunning, and this
    // result no longer describes the code currently on screen.
    if (executionIdRef.current !== executionId) return;

    setResults(testResults);
    saveRunResult(problemId, runLanguage, codeSnapshot, testResults);
    recomputeSolved();
    setIsRunning(false);
  }, [
    activeProblem,
    activeVariant,
    language,
    code,
    isRunning,
    runBlockedLabel,
    runnerStarting,
    wakeRunner,
    recomputeSolved,
  ]);

  const handleReset = useCallback(() => {
    if (!activeProblem || !activeVariant) return;
    invalidateActiveExecution();
    saveCodeDebounced.cancel();
    clearProgress(activeProblem.id, language);
    setCode(activeVariant.starterCode);
    setResults(null);
    setEditorKey((k) => k + 1);
    recomputeSolved();
  }, [activeProblem, activeVariant, language, recomputeSolved, invalidateActiveExecution]);

  const handleRunTestsRef = useRef(handleRunTests);
  useEffect(() => {
    handleRunTestsRef.current = handleRunTests;
  }, [handleRunTests]);

  // Declared after the ref sync above so the queued run uses the handler from
  // this render, the one that already sees the runner as ready.
  // Only a confirmed "ready" releases the queue. If the start stops being in
  // progress any other way (offline, timed out, status unknown) the queued
  // run is dropped rather than fired at a runner that may not be there.
  useEffect(() => {
    if (!runQueued) return;
    if (runnerReady) {
      setRunQueued(false);
      handleRunTestsRef.current();
    } else if (!runnerStarting) {
      setRunQueued(false);
    }
  }, [runQueued, runnerReady, runnerStarting]);

  // Ctrl/Cmd+Enter runs the tests from anywhere on the page — the standard
  // shortcut on LeetCode/HackerRank, so there's no mouse round-trip to Run.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunTestsRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const classSolvedCount = classProblems.filter((p) => solvedIds.has(p.id)).length;

  return (
    <div className="paper-theme min-h-screen">
      <AdSenseScript />
      <PaperTornEdge />

      <section className="relative -mt-4 bg-[var(--paper-hero)] px-4 pb-10 pt-10 sm:-mt-6 sm:px-8 sm:pb-12 sm:pt-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/coding"
            className="mb-3 inline-flex items-center gap-1.5 rounded-[3px] border-[1.5px] border-dashed border-[rgba(60,44,24,.5)] px-3.5 py-2 text-[13px] font-medium text-[var(--paper-muted)] transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to classes
          </Link>
          <p className="mb-2 font-paper-mono text-xs uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
            <Link href="/coding" className="hover:text-[var(--paper-accent)]">
              Practice problems
            </Link>{' '}
            / {activeClass?.name ?? classId}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h1 className="font-paper-serif text-[clamp(30px,4.4vw,44px)] font-bold leading-[1.05] tracking-[-.02em]">
              {activeClass?.name ?? 'Unknown class'}
            </h1>
            {classProblems.length > 0 && (
              <p className="relative whitespace-nowrap rounded-[2px] bg-[var(--paper-yellow)] px-4 py-2 font-paper-sans font-bold text-base leading-none rotate-[2deg] shadow-[1px_3px_9px_rgba(60,44,24,.22)]">
                {classSolvedCount}/{classProblems.length} solved
              </p>
            )}
          </div>
        </div>
      </section>

      <main className="px-4 pb-20 pt-9 sm:px-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-6xl">
          {!activeClass ? (
            <p className="mx-auto mt-12 max-w-md text-center font-paper-sans text-lg text-[var(--paper-muted)]">
              That class doesn&apos;t exist.{' '}
              <Link href="/coding" className="underline underline-offset-2">
                Back to practice problems
              </Link>
            </p>
          ) : !activeProblem || !activeVariant ? (
            <p className="mx-auto mt-12 max-w-md text-center font-paper-sans text-lg text-[var(--paper-muted)]">
              No problems in {activeClass.name} yet.
            </p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <aside>
                <ProblemList
                  classLabel={activeClass.name}
                  problems={classProblems}
                  activeProblemId={activeProblemId}
                  solvedIds={solvedIds}
                  onProblemSelect={handleProblemSelect}
                />
              </aside>

              <div className="min-w-0 space-y-6">
                <ProblemDetails problem={activeProblem} />

                <CodeEditor
                  key={`editor-${activeProblem.id}-${language}-${editorKey}`}
                  code={code}
                  onChange={handleCodeChange}
                  problemTitle={activeProblem.title}
                  language={language}
                  availableLanguages={availableLanguages}
                  onLanguageChange={handleLanguageChange}
                />

                <RunnerStatus
                  status={runnerStatus}
                  timedOut={runnerTimedOut}
                  isAdmin={isAdmin}
                  runQueued={runQueued}
                  onRetry={wakeRunner}
                  onHold={holdRunner}
                />

                <ResultsPanel
                  key={`${activeProblem.id}-${language}`}
                  results={results}
                  isRunning={isRunning}
                  onRunTests={handleRunTests}
                  onReset={handleReset}
                  runBlockedLabel={runBlockedLabel}
                />

                <TestResults results={results} isRunning={isRunning} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Practice;
