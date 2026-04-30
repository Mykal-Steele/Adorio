interface SkeletonLoaderProps {
  count?: number;
  className?: string;
}

const SkeletonLoader = ({ count = 1, className = '' }: SkeletonLoaderProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-gray-900/50 rounded-lg border border-gray-800/40 p-4 sm:p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gray-800/60 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-800/60 rounded w-1/4" />
              <div className="h-3 bg-gray-800/40 rounded w-1/6" />
            </div>
          </div>

          <div className="h-5 bg-gray-800/60 rounded w-3/4 mb-3" />

          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-800/40 rounded" />
            <div className="h-4 bg-gray-800/40 rounded w-5/6" />
            <div className="h-4 bg-gray-800/40 rounded w-4/6" />
          </div>

          {index % 3 === 0 && <div className="h-48 bg-gray-800/40 rounded-lg mb-4" />}

          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="h-8 w-16 bg-gray-800/40 rounded" />
              <div className="h-8 w-20 bg-gray-800/40 rounded" />
            </div>
            <div className="h-8 w-12 bg-gray-800/40 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
