import { serverFetch } from '@/lib/serverFetch';
import Home from '@/views/Home';
import type { Post } from '@/types';

export default async function PostsLoader() {
  let initialPosts: Post[] = [];
  let initialHasMore = true;

  try {
    const data = await serverFetch<{ posts: Post[]; hasMore: boolean }>(
      '/api/posts?page=1&limit=3',
      { cache: 'no-store' },
    );
    initialPosts = data.posts ?? [];
    initialHasMore = data.hasMore ?? true;
  } catch {
    // SSR fetch failed — Home will fetch client-side as fallback
  }

  return <Home initialPosts={initialPosts} initialHasMore={initialHasMore} />;
}
