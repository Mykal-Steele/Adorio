// infinite scroll hook i stole from a youtube tutorial and tweaked
import { useEffect, useRef, useCallback } from "react";

const useInfiniteScroll = ({ loading, hasMore, onLoadMore }) => {
  const observer = useRef();

  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, onLoadMore]
  );

  return [lastPostRef];
};

export default useInfiniteScroll;
