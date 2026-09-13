import { Suspense } from 'react';
import type { Metadata } from 'next';
import PostSkeleton from '@/views/Home/components/PostSkeleton';
import PostsLoader from './PostsLoader';

export const metadata: Metadata = {
  title: 'Social',
  description: 'Recent posts from the Adorio community. Share thoughts, projects, and ideas.',
};

export default function SocialPage() {
  return (
    <div className="paper-theme min-h-screen">
      <Suspense
        fallback={
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
            <PostSkeleton count={3} />
          </div>
        }
      >
        <PostsLoader />
      </Suspense>
    </div>
  );
}
