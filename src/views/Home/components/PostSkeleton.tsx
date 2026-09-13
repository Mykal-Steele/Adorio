interface PostSkeletonProps {
  count?: number;
}

const PostSkeleton = ({ count = 1 }: PostSkeletonProps) => {
  return (
    <div className="[column-gap:clamp(24px,3vw,38px)] [column-width:22rem]">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="mb-[clamp(24px,3vw,38px)] animate-pulse break-inside-avoid rounded-[3px] bg-[var(--paper-cream)] p-[clamp(22px,2.6vw,30px)] shadow-[0_16px_30px_-18px_rgba(60,44,24,.4)]"
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[rgba(60,44,24,.12)]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-[rgba(60,44,24,.12)]" />
              <div className="h-3 w-1/5 rounded bg-[rgba(60,44,24,.08)]" />
            </div>
          </div>

          <div className="mt-5 h-5 w-3/4 rounded bg-[rgba(60,44,24,.12)]" />

          <div className="mt-3 space-y-2">
            <div className="h-3.5 rounded bg-[rgba(60,44,24,.08)]" />
            <div className="h-3.5 w-5/6 rounded bg-[rgba(60,44,24,.08)]" />
          </div>

          {index % 2 === 0 && (
            <div className="mt-5 aspect-[16/10] rounded-[2px] bg-[rgba(60,44,24,.1)]" />
          )}

          <div className="mt-5 flex gap-6 border-t border-dashed border-[var(--paper-line)] pt-4">
            <div className="h-4 w-10 rounded bg-[rgba(60,44,24,.1)]" />
            <div className="h-4 w-14 rounded bg-[rgba(60,44,24,.1)]" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostSkeleton;
