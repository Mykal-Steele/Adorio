import React from 'react';
import PropTypes from 'prop-types';

const SkeletonLoader = ({ count = 1, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className='animate-pulse bg-gray-900/50 rounded-lg border border-gray-800/40 p-4 sm:p-6'
        >
          {/* Header skeleton */}
          <div className='flex items-center space-x-3 mb-4'>
            <div className='h-10 w-10 bg-gray-800/60 rounded-full'></div>
            <div className='space-y-2 flex-1'>
              <div className='h-4 bg-gray-800/60 rounded w-1/4'></div>
              <div className='h-3 bg-gray-800/40 rounded w-1/6'></div>
            </div>
          </div>

          {/* Title skeleton */}
          <div className='h-5 bg-gray-800/60 rounded w-3/4 mb-3'></div>

          {/* Content skeleton */}
          <div className='space-y-2 mb-4'>
            <div className='h-4 bg-gray-800/40 rounded'></div>
            <div className='h-4 bg-gray-800/40 rounded w-5/6'></div>
            <div className='h-4 bg-gray-800/40 rounded w-4/6'></div>
          </div>

          {/* Image skeleton (sometimes) */}
          {index % 3 === 0 && (
            <div className='h-48 bg-gray-800/40 rounded-lg mb-4'></div>
          )}

          {/* Footer skeleton */}
          <div className='flex items-center justify-between'>
            <div className='flex space-x-4'>
              <div className='h-8 w-16 bg-gray-800/40 rounded'></div>
              <div className='h-8 w-20 bg-gray-800/40 rounded'></div>
            </div>
            <div className='h-8 w-12 bg-gray-800/40 rounded'></div>
          </div>
        </div>
      ))}
    </div>
  );
};

SkeletonLoader.propTypes = {
  count: PropTypes.number,
  className: PropTypes.string,
};

export default SkeletonLoader;
