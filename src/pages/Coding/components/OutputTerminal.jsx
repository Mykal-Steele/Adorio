import React, { useEffect, useRef } from 'react';

/**
 * Output Terminal Component
 * Now shows information about where to find console output
 */
const OutputTerminal = ({ output, isRunning }) => {
  if (isRunning) {
    return (
      <div className='bg-gray-950/60 border border-gray-800 rounded-lg p-4'>
        <div className='text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2'>
          Output Terminal
        </div>
        <div className='text-sm text-gray-400 font-mono'>Running code...</div>
      </div>
    );
  }

  return (
    <div className='bg-gray-950/60 border border-gray-800 rounded-lg p-4'>
      <div className='text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2'>
        Console Output
      </div>
      <div className='font-mono text-sm text-gray-300 min-h-[80px]'>
        <div className='text-gray-400 italic'>
          Console output (console.log, etc.) is now shown for each individual
          test case below.
        </div>
        <div className='text-gray-500 text-xs mt-2'>
          💡 Look at the "Output" section in each test case to see what your
          code printed.
        </div>
      </div>
    </div>
  );
};

export default OutputTerminal;
