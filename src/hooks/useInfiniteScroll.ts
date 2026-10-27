// infinite scroll hook i stole from a youtube tutorial and tweaked
import { useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const useInfiniteScroll = ({ loading, hasMore, onLoadMore }: UseInfiniteScrollOptions) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostRef = useCallback(
    (node: Element | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        // Fire well before the sentinel is on screen, so the next page loads while there
        // are still a few posts to scroll instead of hitting a dead stop at the bottom
        { rootMargin: '0px 0px 1200px 0px' },
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, onLoadMore],
  );

  return [lastPostRef];
};

export default useInfiniteScroll;
