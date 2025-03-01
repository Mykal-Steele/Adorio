import React from "react";

const SkeletonLoader = ({ count = 1 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="w-full max-w-2xl mx-auto p-4 space-y-4 animate-pulse"
        >
          {/* Header Skeleton */}
          <div className="flex items-center space-x-4">
            {/* Avatar Skeleton */}
            <div className="h-10 w-10 bg-gray-800 rounded-full"></div>
            {/* Username and Timestamp Skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-800 rounded w-full"></div>
            <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            <div className="h-4 bg-gray-800 rounded w-4/6"></div>
          </div>

          {/* Image Skeleton */}
          <div className="h-48 bg-gray-800 rounded-lg"></div>

          {/* Actions Skeleton (e.g., Like, Comment, Share) */}
          <div className="flex items-center space-x-6">
            <div className="h-6 w-6 bg-gray-800 rounded-full"></div>
            <div className="h-6 w-6 bg-gray-800 rounded-full"></div>
            <div className="h-6 w-6 bg-gray-800 rounded-full"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
