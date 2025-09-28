import React from 'react';
import { CodeRunner } from '../CodeRunner.js';

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
    <div className='space-y-3'>
      {results.tests.map((test, index) => (
        <TestCase key={index} test={test} />
      ))}
    </div>
  );
};

/**
 * Individual Test Case Display
 */
const TestCase = ({ test }) => {
  const isSuccess = test.passed && !test.error;
  const bgClass = isSuccess
    ? 'border-emerald-500/40 bg-emerald-500/10'
    : 'border-red-500/40 bg-red-500/10';

  return (
    <div className={`p-3 rounded-lg border text-sm ${bgClass}`}>
      <div className='space-y-1'>
        <div>
          <span className='font-semibold text-gray-100'>Input: </span>
          <span className='font-mono text-purple-200'>
            {CodeRunner.formatValue(test.args)}
          </span>
        </div>

        <div>
          <span className='font-semibold text-gray-300'>Expected: </span>
          <span className='font-mono text-emerald-200'>
            {CodeRunner.formatValue(test.expected)}
          </span>
        </div>

        {test.error ? (
          <div className='text-red-200'>Error: {test.error}</div>
        ) : (
          <div
            className={`text-sm font-medium ${
              isSuccess ? 'text-emerald-300' : 'text-red-300'
            }`}
          >
            {isSuccess ? '✓ Passed' : '✗ Failed'}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResults;
