import React from "react";

const SkeletonLoader = ({ count = 1 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
