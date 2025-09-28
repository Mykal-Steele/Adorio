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

  return <></>;
};

export default OutputTerminal;
