import SkeletonLoader from '@/components/ui/SkeletonLoader';

export default function HomeLoading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 pt-20">
      <SkeletonLoader count={5} />
    </div>
  );
}
