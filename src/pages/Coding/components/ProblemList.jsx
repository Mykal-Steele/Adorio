import React, { useRef, useEffect, useState } from 'react';
import { ProblemStorage } from '../utils/problemStorage.js';
import { getSortedProblems } from '../problems.js';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Problem List Component
 * Single responsibility: Display and handle problem selection with sorting
 */
const ProblemList = ({ problems, activeProblemId, onProblemSelect }) => {
  const [sortHardestFirst, setSortHardestFirst] = useState(false); // false = easy to hard (default)

  // Get sorted problems - default is easiest to hardest
  const sortedProblems = getSortedProblems(sortHardestFirst);

  const toggleSort = () => {
    setSortHardestFirst(!sortHardestFirst);
  };

  return (
    <div className='bg-gray-900/70 border border-gray-800 rounded-xl p-4 shadow-lg'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold'>Problems</h2>

        {/* Sort toggle icon */}
        <button
          onClick={toggleSort}
          className='p-1 text-gray-400 hover:text-purple-300 transition-colors'
          title={
            sortHardestFirst
              ? 'Currently: Hard → Easy (click for Easy → Hard)'
              : 'Currently: Easy → Hard (click for Hard → Easy)'
          }
        >
          {sortHardestFirst ? (
            <ChevronDownIcon className='w-5 h-5' />
          ) : (
            <ChevronUpIcon className='w-5 h-5' />
          )}
        </button>
      </div>

      <div className='space-y-2'>
        {sortedProblems.map((problem) => (
          <ProblemItem
            key={problem.id}
            problem={problem}
            isActive={problem.id === activeProblemId}
            hasSavedProgress={ProblemStorage.hasSavedState(problem.id)}
            onProblemSelect={onProblemSelect}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual Problem Item with debounced click handling
 */
const ProblemItem = ({
  problem,
  isActive,
  hasSavedProgress,
  onProblemSelect,
}) => {
  const clickTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    // Prevent multiple rapid clicks and don't switch if already active
    if (isActive) return;

    // Clear any pending clicks
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Debounce the click to prevent double-click issues
    clickTimeoutRef.current = setTimeout(() => {
      onProblemSelect(problem.id);
    }, 150);
  };

  const activeClass = isActive
    ? 'border-purple-500/60 bg-purple-600/10'
    : 'border-gray-800 hover:border-purple-500/40 hover:bg-purple-600/5';

  // Add subtle left border for saved progress
  const progressIndicator = hasSavedProgress
    ? 'border-l-2 border-l-emerald-400/60'
    : '';

  return (
    <button
      onClick={handleClick}
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
