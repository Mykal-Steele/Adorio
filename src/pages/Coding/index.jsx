import React, { useState, useEffect, useCallback } from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

// Components
import ProblemList from './components/ProblemList.jsx';
import ProblemDetails from './components/ProblemDetails.jsx';
import CodeEditor from './components/CodeEditor.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import TestResults from './components/TestResults.jsx';
import OutputTerminal from './components/OutputTerminal.jsx';

// Services and Data
import { getAllProblems, getProblem } from './problems.js';
import { CodeRunner } from './CodeRunner.js';
import { ProblemStorage } from './utils/problemStorage.js';

/**
 * Main Coding Challenge Page
 * Follows Single Responsibility Principle - orchestrates components
 * Easy to extend with new problems by adding to problems.js
 */
const Coding = () => {
  // State management
  const [activeProblemId, setActiveProblemId] = useState(null);
  const [code, setCode] = useState('');
  const [results, setResults] = useState(null);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Data
  const problems = getAllProblems();
  const activeProblem = getProblem(activeProblemId);

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

  // Load saved state when problem changes
  useEffect(() => {
    if (activeProblem) {
      const savedState = ProblemStorage.loadProblemState(activeProblem.id);

      if (savedState && savedState.code.trim()) {
        // Load saved code and results
        setCode(savedState.code);
        setResults(savedState.results);
      } else {
        // Use starter code for new problems
        setCode(activeProblem.starterCode);
        setResults(null);
      }

      setOutput(null);
    }
  }, [activeProblem]);

  // Auto-save current state when code changes (debounced)
  useEffect(() => {
    if (activeProblem && code !== activeProblem.starterCode) {
      ProblemStorage.debouncedSave(activeProblem.id, {
        code,
        results,
      });
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
        });
      }
    };

    // Save on page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function to save on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (activeProblem && code !== activeProblem.starterCode) {
        ProblemStorage.saveProblemState(activeProblem.id, {
          code,
          results,
        });
      }
    };
  }, [activeProblem, code, results]);

  // Event handlers
  const handleProblemSelect = useCallback(
    (problemId) => {
      // Save current state before switching
      if (activeProblem && code !== activeProblem.starterCode) {
        ProblemStorage.saveProblemState(activeProblem.id, {
          code,
          results,
        });
      }

      setActiveProblemId(problemId);
    },
    [activeProblem, code, results]
  );

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleRunTests = useCallback(async () => {
    if (!activeProblem) return;

    setIsRunning(true);

    // Run tests - now includes console output for each test case
    const testResults = await CodeRunner.execute(
      code,
      activeProblem.functionName,
      activeProblem.tests,
      activeProblem.methodName || null // Pass methodName if it exists
    );

    setResults(testResults);
    setOutput(null); // No longer need separate output since each test shows its output
    setIsRunning(false);

    // Save state after running tests
    ProblemStorage.saveProblemState(activeProblem.id, {
      code,
      results: testResults,
    });
  }, [activeProblem, code]);

  const handleReset = useCallback(() => {
    if (activeProblem) {
      setCode(activeProblem.starterCode);
      setResults(null);
      setOutput(null);

      // Clear saved state for this problem
      ProblemStorage.clearProblemState(activeProblem.id);
    }
  }, [activeProblem]);

  // Loading state
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
          <aside>
            <ProblemList
              problems={problems}
              activeProblemId={activeProblemId}
              onProblemSelect={handleProblemSelect}
            />
          </aside>

          {/* Main Content */}
          <main className='space-y-6'>
            <ProblemDetails problem={activeProblem} />

            <CodeEditor code={code} onChange={handleCodeChange} />

            <ResultsPanel
              results={results}
              isRunning={isRunning}
              onRunTests={handleRunTests}
              onReset={handleReset}
            />

            <OutputTerminal output={output} isRunning={isRunning} />

            <TestResults results={results} isRunning={isRunning} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Coding;
