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
        // Fire well before the sentinel actually reaches the viewport, so the next
        // page is loading while there's still a few posts of scroll room left
        // instead of the user hitting a dead stop at the bottom of the page.
        { rootMargin: '0px 0px 1200px 0px' },
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, onLoadMore],
  );

  return [lastPostRef];
};

export default useInfiniteScroll;
