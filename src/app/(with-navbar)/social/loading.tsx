import PostSkeleton from '@/views/Home/components/PostSkeleton';

export default function HomeLoading() {
  return (
    <div className="paper-theme min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
        <PostSkeleton count={3} />
      </div>
    </div>
  );
}
