import { Suspense } from 'react';
import type { Metadata } from 'next';
import SkeletonLoader from '@/Components/SkeletonLoader';
import PostsLoader from './PostsLoader';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Recent posts from the Adorio community. Share thoughts, projects, and ideas.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Suspense
        fallback={
          <div className="container mx-auto max-w-2xl px-4 py-8 pt-20">
            <SkeletonLoader count={5} />
          </div>
        }
      >
        <PostsLoader />
      </Suspense>
    </div>
  );
}
