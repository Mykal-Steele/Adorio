import React, { useEffect, useRef } from 'react';

/**
 * Output Terminal Component
 * Shows console output and return values from code execution
 */
const OutputTerminal = ({ output, isRunning }) => {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (scrollRef.current && output?.logs?.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

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
        Output Terminal
      </div>
      <div
        ref={scrollRef}
        className='font-mono text-sm text-gray-300 min-h-[80px] max-h-40 overflow-y-auto'
      >
        {!output ? (
          <div className='text-gray-500 italic'>
            No output yet. Run your code to see results.
          </div>
        ) : output.logs.length > 0 ? (
          <div className='space-y-1'>
            {output.logs.map((log, index) => (
              <div
                key={index}
                className='border-b border-gray-800/30 pb-1 last:border-none'
              >
                {log}
              </div>
            ))}
          </div>
        ) : (
          <div className='text-gray-500 italic'>No output generated</div>
        )}
      </div>
    </div>
  );
};

export default OutputTerminal;
