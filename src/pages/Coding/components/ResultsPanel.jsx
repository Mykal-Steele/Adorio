import React, { useState } from 'react';
import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * Results Panel Component
 * Single responsibility: Handle test execution and display results
 */
const ResultsPanel = ({ results, isRunning, onRunTests, onReset }) => {
  const [resetClicked, setResetClicked] = useState(false);

  const handleReset = () => {
    if (!resetClicked) {
      // First click - send reset signal AND show feedback
      onReset();
      setResetClicked(true);
      // Reset the state after 3 seconds if not clicked again
      setTimeout(() => {
        setResetClicked(false);
      }, 3000);
    } else {
      // Second click - send reset signal again
      onReset();
      setResetClicked(false);
    }
  };
  const getResultSummary = () => {
    if (!results) return null;
    if (results.status === 'success')
      return { label: 'All tests passed', tone: 'success' };
    if (results.status === 'failure') {
      const total = results.tests.length;
      const passed = results.tests.filter((test) => test.passed).length;
      return { label: `${passed}/${total} tests passed`, tone: 'warning' };
    }
    if (results.status === 'error')
      return { label: 'Runtime error', tone: 'error' };
    return null;
  };

  const summary = getResultSummary();
  const badgeClasses = {
    success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    error: 'border-red-500/40 bg-red-500/10 text-red-300',
  };

  return (
    <div className='bg-gray-900/70 border border-gray-800 rounded-xl shadow-lg p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h3 className='text-lg font-semibold text-gray-100'>Results</h3>
          {summary && (
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border ${
                badgeClasses[summary.tone]
              }`}
            >
              {summary.label}
            </span>
          )}
        </div>

        <div className='flex gap-2 items-center'>
          <span className='text-xs text-gray-500 mr-2'>
            {resetClicked
              ? 'Press again to wipe saved code'
              : 'First: reset editor, second: wipe saved code'}
          </span>
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
              resetClicked
                ? 'border-amber-500/60 bg-amber-600/10 text-amber-300 hover:bg-amber-600/20'
                : 'border-gray-700 hover:border-purple-500/60 hover:bg-purple-600/10'
            }`}
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${resetClicked ? 'animate-pulse' : ''}`}
            />
            {resetClicked ? 'Wipe Memory' : 'Reset'}
          </button>

          <button
            onClick={onRunTests}
            disabled={isRunning}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <PlayIcon className='h-4 w-4' />
            {isRunning ? 'Running...' : 'Run Tests'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
