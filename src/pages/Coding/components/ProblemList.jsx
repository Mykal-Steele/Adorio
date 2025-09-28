import React from 'react';
import { ProblemStorage } from '../utils/problemStorage.js';

/**
 * Problem List Component
 * Single responsibility: Display and handle problem selection
 */
const ProblemList = ({ problems, activeProblemId, onProblemSelect }) => {
  return (
    <div className='bg-gray-900/70 border border-gray-800 rounded-xl p-4 shadow-lg'>
      <h2 className='text-lg font-semibold mb-4'>Problems</h2>
      <div className='space-y-2'>
        {problems.map((problem) => (
          <ProblemItem
            key={problem.id}
            problem={problem}
            isActive={problem.id === activeProblemId}
            hasSavedProgress={ProblemStorage.hasSavedState(problem.id)}
            onClick={() => onProblemSelect(problem.id)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual Problem Item
 */
const ProblemItem = ({ problem, isActive, hasSavedProgress, onClick }) => {
  const activeClass = isActive
    ? 'border-purple-500/60 bg-purple-600/10'
    : 'border-gray-800 hover:border-purple-500/40 hover:bg-purple-600/5';

  // Add subtle left border for saved progress
  const progressIndicator = hasSavedProgress
    ? 'border-l-2 border-l-emerald-400/60'
    : '';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all ${activeClass} ${progressIndicator}`}
      title={
        hasSavedProgress
          ? `${problem.title} - Has saved progress`
          : problem.title
      }
    >
      <div className='flex items-center justify-between'>
        <span className='font-medium text-gray-100'>{problem.title}</span>
        <span className='text-xs uppercase tracking-wide text-purple-300'>
          {problem.difficulty}
        </span>
      </div>
    </button>
  );
};

export default ProblemList;
