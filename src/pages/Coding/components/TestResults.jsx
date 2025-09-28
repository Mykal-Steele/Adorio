import React from 'react';
import { CodeRunner } from '../CodeRunner.js';
import ResizableTerminal from './ResizableTerminal.jsx';

/**
 * Test Results Display Component
 * Single responsibility: Display test execution results
 */
const TestResults = ({ results, isRunning }) => {
  if (isRunning) {
    return (
      <div className='text-center py-8'>
        <div className='text-sm text-gray-400'>Running tests...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className='text-sm text-gray-400'>
        Write your solution and click "Run Tests" to see results.
      </div>
    );
  }

  if (results.status === 'error') {
    return (
      <div className='p-4 bg-red-900/30 border border-red-600/40 rounded-lg'>
        <div className='text-red-300 font-semibold'>Error</div>
        <div className='text-sm text-red-200 mt-1'>{results.error}</div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {results.tests.map((test, index) => (
        <TestCase key={index} test={test} />
      ))}
    </div>
  );
};

/**
 * Individual Test Case Display - Clean design matching page style
 */
const TestCase = ({ test }) => {
  const isSuccess = test.passed && !test.error;
  const bgClass = isSuccess
    ? 'border-emerald-500/40 bg-emerald-500/10'
    : 'border-red-500/40 bg-red-500/10';

  // Format duration consistently
  const formatDuration = (duration) => {
    if (typeof duration !== 'number' || isNaN(duration)) {
      return '<0.01ms';
    }
    
    // If duration is 0 or very close to 0, show as less than 0.01ms
    if (duration < 0.01) {
      return '<0.01ms';
    }
    
    // For very small durations, round to 0.01ms minimum
    const roundedDuration = Math.max(duration, 0.01);
    
    // Ensure we always have at least 2 decimal places
    return `${roundedDuration.toFixed(2)}ms`;
  };

  return (
    <div className={`p-4 rounded-lg border ${bgClass}`}>
      <div className='space-y-3'>
        {/* Status indicator */}
        <div className='flex items-center justify-between'>
          <span
            className={`text-sm font-medium ${
              isSuccess ? 'text-emerald-300' : 'text-red-300'
            }`}
          >
            {isSuccess ? '✓ Passed' : '✗ Failed'}
          </span>
          <span className='text-xs text-gray-400 font-mono'>
            {formatDuration(test.duration)}
          </span>
        </div>

        {/* Input */}
        <div>
          <span className='text-gray-300 text-sm font-medium'>Input: </span>
          <span className='font-mono text-purple-200'>
            {CodeRunner.formatValue(test.args)}
          </span>
        </div>

        {/* Console Output */}
        {test.logs && test.logs.length > 0 && (
          <div>
            <span className='text-gray-300 text-sm font-medium'>Output: </span>
            <div className='mt-1'>
              <ResizableTerminal
                content={test.logs.join('\n')}
                minHeight={60}
                maxInitialHeight={250}
                maxHeight={800}
              />
            </div>
          </div>
        )}

        {/* Expected and Actual */}
        <div className='space-y-2'>
          <div>
            <span className='text-gray-300 text-sm font-medium'>
              Expected:{' '}
            </span>
            <span className='font-mono text-emerald-200'>
              {CodeRunner.formatValue(test.expected)}
            </span>
          </div>

          {!test.error && (
            <div>
              <span className='text-gray-300 text-sm font-medium'>
                Actual:{' '}
              </span>
              <span
                className={`font-mono ${
                  isSuccess ? 'text-emerald-200' : 'text-red-200'
                }`}
              >
                {CodeRunner.formatValue(test.output)}
              </span>
            </div>
          )}
        </div>

        {/* Error message if any */}
        {test.error && (
          <div className='text-red-200 font-mono text-sm bg-red-900/20 p-3 rounded border border-red-600/30'>
            <span className='font-medium'>Runtime Error: </span>
            {test.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResults;
