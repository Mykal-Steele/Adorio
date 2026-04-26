// infinite scroll hook i stole from a youtube tutorial and tweaked
import { useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const useInfiniteScroll = ({
  loading,
  hasMore,
  onLoadMore,
}: UseInfiniteScrollOptions) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostRef = useCallback(
    (node: Element | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, onLoadMore],
  );

  return [lastPostRef];
};

export default useInfiniteScroll;
