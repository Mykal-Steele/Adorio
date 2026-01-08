import React, { useState, useEffect, useCallback, useRef } from "react";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import AdSenseScript from "../../Components/AdSenseScript";

// Components
import ProblemList from "./components/ProblemList.jsx";
import ProblemDetails from "./components/ProblemDetails.jsx";
import CodeEditor from "./components/CodeEditor.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import TestResults from "./components/TestResults.jsx";

// Services and Data
import { getAllProblems, getProblem } from "./problems.js";
import { CodeRunner } from "./CodeRunner.js";
import { ProblemStorage } from "./utils/problemStorage.js";

const getProblemMeta = (problem) => ({
  functionName: problem?.functionName || null,
  methodName: problem?.methodName || null,
});

/**
 * Main Coding Challenge Page
 */
const Coding = () => {
  // State management with problem isolation
  const [activeProblemId, setActiveProblemId] = useState(null);
  const [code, setCode] = useState("");
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Force editor remount when switching problems
  const [editorKey, setEditorKey] = useState(0);

  // Track reset operations to prevent auto-save conflicts
  const isResetInProgress = useRef(false);
  const activeProblemIdRef = useRef(null);

  // Data
  const problems = getAllProblems();
  const activeProblem = getProblem(activeProblemId);

  useEffect(() => {
    if (activeProblemId && !activeProblem && problems.length > 0) {
      setActiveProblemId(problems[0].id);
    }
  }, [activeProblemId, activeProblem, problems]);

  useEffect(() => {
    activeProblemIdRef.current = activeProblem?.id || null;
  }, [activeProblem]);

  // Initialize with saved problem or first problem
  useEffect(() => {
    if (problems.length > 0 && !activeProblemId) {
      // Try to load the last active problem
      const savedActiveProblem = ProblemStorage.loadActiveProblem();

      if (savedActiveProblem && getProblem(savedActiveProblem)) {
        setActiveProblemId(savedActiveProblem);
      } else {
        // Fallback to first problem
        setActiveProblemId(problems[0].id);
      }
    }
  }, [problems, activeProblemId]);

  // Load saved state when problem changes with proper isolation
  useEffect(() => {
    if (activeProblem) {
      // Force editor remount to clear history
      setEditorKey((prev) => prev + 1);

      const savedState = ProblemStorage.loadProblemState(
        activeProblem.id,
        getProblemMeta(activeProblem)
      );

      if (savedState && savedState.code.trim()) {
        // Load saved code and results
        setCode(savedState.code);
        setResults(savedState.results);
      } else {
        // Use starter code for new problems
        setCode(activeProblem.starterCode);
        setResults(null);
      }
    }
  }, [activeProblem]);

  // Auto-save current state when code changes (debounced) with validation
  useEffect(() => {
    if (
      activeProblem &&
      code &&
      code !== activeProblem.starterCode &&
      !isResetInProgress.current
    ) {
      // Only save if code actually belongs to this problem and we're not in a reset
      const currentSavedState = ProblemStorage.loadProblemState(
        activeProblem.id,
        getProblemMeta(activeProblem)
      );
      const isCodeDifferent =
        !currentSavedState || currentSavedState.code !== code;

      if (isCodeDifferent) {
        ProblemStorage.debouncedSave(activeProblem.id, {
          code,
          results,
          ...getProblemMeta(activeProblem),
        });
      }
    }
  }, [code, results, activeProblem]);

  // Save state before page unload/component unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeProblem && code !== activeProblem.starterCode) {
        // Immediate save on page unload (no debouncing)
        ProblemStorage.saveProblemState(activeProblem.id, {
          code,
          results,
          ...getProblemMeta(activeProblem),
        });
      }
    };

    // Save on page unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to save on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (activeProblem && code !== activeProblem.starterCode) {
        ProblemStorage.saveProblemState(activeProblem.id, {
          code,
          results,
          ...getProblemMeta(activeProblem),
        });
      }
    };
  }, [activeProblem, code, results]);

  // Event handlers
  const handleProblemSelect = useCallback(
    (problemId) => {
      // Save current state before switching (immediate save)
      if (activeProblem && code && code !== activeProblem.starterCode) {
        ProblemStorage.saveProblemState(activeProblem.id, {
          code,
          results,
          ...getProblemMeta(activeProblem),
        });
      }

      // Clear current state to prevent contamination
      setCode("");
      setResults(null);
      setIsRunning(false);

      // Switch to new problem
      setActiveProblemId(problemId);
    },
    [activeProblem, code, results]
  );

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleRunTests = useCallback(async () => {
    if (!activeProblem) return;

    const problemId = activeProblem.id;
    const meta = getProblemMeta(activeProblem);
    const codeSnapshot = code;

    setIsRunning(true);

    // Run tests - now includes console output for each test case
    const testResults = await CodeRunner.execute(
      codeSnapshot,
      activeProblem.functionName,
      activeProblem.tests,
      activeProblem.methodName || null // Pass methodName if it exists
    );

    if (activeProblemIdRef.current !== problemId) {
      setIsRunning(false);
      return;
    }

    setResults(testResults);

    ProblemStorage.saveProblemState(problemId, {
      code: codeSnapshot,
      results: testResults,
      ...meta,
    });

    setIsRunning(false);
  }, [activeProblem, code]);

  const handleReset = useCallback(() => {
    if (activeProblem) {
      // Set reset flag to prevent auto-save during reset
      isResetInProgress.current = true;

      // Clear saved state FIRST before resetting UI state
      ProblemStorage.clearProblemState(activeProblem.id);

      // Reset UI state
      setCode(activeProblem.starterCode);
      setResults(null);
      setIsRunning(false);

      // Force editor remount to clear history AFTER state is reset
      setEditorKey((prev) => prev + 1);

      // Clear reset flag after a brief delay to ensure state updates are complete
      setTimeout(() => {
        isResetInProgress.current = false;
      }, 100);
    }
  }, [activeProblem]);

  // Loading state
  if (problems.length === 0) {
    return (
      <div className='min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <CodeBracketIcon className='h-10 w-10 text-purple-400 mx-auto mb-4' />
          <p className='text-lg'>No challenges available right now.</p>
          <p className='text-sm text-gray-400'>
            Check back later for new problems.
          </p>
        </div>
      </div>
    );
  }

  if (!activeProblem) {
    return (
      <div className='min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <CodeBracketIcon className='h-10 w-10 text-purple-400 mx-auto mb-4' />
          <p className='text-lg'>Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-950 text-gray-100 py-8 px-4'>
      <AdSenseScript />
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <header className='mb-8'>
          <div className='flex items-center gap-3'>
            <div className='p-3 rounded-xl bg-purple-600/20 border border-purple-500/40'>
              <CodeBracketIcon className='h-8 w-8 text-purple-300' />
            </div>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent'>
                Coding Challenges
              </h1>
              <p className='text-gray-400'>
                Practice JavaScript problem solving
              </p>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className='grid lg:grid-cols-[300px_1fr] gap-6'>
          {/* Sidebar */}
          <aside className='space-y-6'>
            <ProblemList
              problems={problems}
              activeProblemId={activeProblemId}
              onProblemSelect={handleProblemSelect}
            />
          </aside>

          {/* Main Content */}
          <main className='space-y-6'>
            <ProblemDetails problem={activeProblem} />

            <CodeEditor
              key={`editor-${activeProblem.id}-${editorKey}`}
              code={code}
              onChange={handleCodeChange}
            />

            <ResultsPanel
              results={results}
              isRunning={isRunning}
              onRunTests={handleRunTests}
              onReset={handleReset}
            />

            <TestResults results={results} isRunning={isRunning} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Coding;
