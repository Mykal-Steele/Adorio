import React from 'react';

/**
 * Problem Details Component
 * Single responsibility: Display problem information
 */
const ProblemDetails = ({ problem }) => {
  return (
    <div className='bg-gray-900/70 border border-gray-800 rounded-xl p-6 shadow-lg space-y-4'>
      <div>
        <h2 className='text-2xl font-semibold text-gray-100 mb-2'>
          {problem.title}
        </h2>
        <p className='text-gray-400'>{problem.description}</p>
      </div>

      {problem.constraints && (
        <div>
          <h3 className='text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2'>
            Constraints
          </h3>
          <ul className='list-disc list-inside text-sm text-gray-400 space-y-1'>
            {problem.constraints.map((constraint, index) => (
              <li key={index}>{constraint}</li>
            ))}
          </ul>
        </div>
      )}

      {problem.examples && (
        <div>
          <h3 className='text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2'>
            Examples
          </h3>
          <div className='space-y-3'>
            {problem.examples.map((example, index) => (
              <div
                key={index}
                className='bg-gray-950/60 border border-gray-800 rounded-lg p-3 text-sm'
              >
                <div className='font-mono text-purple-200'>
                  Input: <span className='text-gray-100'>{example.input}</span>
                </div>
                <div className='font-mono text-emerald-200'>
                  Output:{' '}
                  <span className='text-gray-100'>{example.output}</span>
                </div>
                {example.explanation && (
                  <div className='text-gray-400 mt-1'>
                    {example.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDetails;
