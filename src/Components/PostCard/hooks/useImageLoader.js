import { useState, useRef, useEffect, useCallback } from "react";

export function useImageLoader({ postImage, postId, instanceId }) {
  const isMounted = useRef(true);
  const preloadImageRef = useRef(null);

  // Image loading state
  const [imageState, setImageState] = useState({
    url: null,
    isLoading: false,
    hasError: false,
    isLoaded: false,
    postId: postId,
  });

  // Image loading function
  const loadImage = useCallback(() => {
    if (!isMounted.current) return;

    // Clean up previous image
    if (preloadImageRef.current) {
      preloadImageRef.current.onload = null;
      preloadImageRef.current.onerror = null;
      preloadImageRef.current = null;
    }

    // Reset state
    setImageState((prev) => ({
      ...prev,
      isLoading: true,
      hasError: false,
      isLoaded: false,
    }));

    // Validate image
    if (!postImage?.url) {
      console.log(`[${instanceId}] No valid image for post ${postId}`);
      setImageState((prev) => ({ ...prev, isLoading: false, hasError: true }));
      return;
    }

    try {
      // Create unique URL with cache-busting
      const baseUrl = postImage.url.split("?")[0];
      const uniqueUrl = `${baseUrl}?postId=${postId}&instance=${instanceId}&t=${Date.now()}&r=${Math.random()
        .toString(36)
        .slice(2)}`;

      // Update URL in state
      setImageState((prev) => ({ ...prev, url: uniqueUrl, postId }));

      // Preload image
      const preloadImage = new Image();
      preloadImageRef.current = preloadImage;
      preloadImage.crossOrigin = "anonymous";
      preloadImage.referrerPolicy = "no-referrer";

      // Handle load/error events
      preloadImage.onload = () => {
        if (isMounted.current) {
          setImageState((prev) => ({
            ...prev,
            isLoading: false,
            isLoaded: true,
            hasError: false,
          }));
        }
      };

      preloadImage.onerror = () => {
        if (isMounted.current) {
          setImageState((prev) => ({
            ...prev,
            isLoading: false,
            isLoaded: false,
            hasError: true,
            url: null,
          }));
        }
      };

      preloadImage.src = uniqueUrl;
    } catch (error) {
      console.error(`[${instanceId}] Error loading image:`, error);
      setImageState((prev) => ({
        ...prev,
        isLoading: false,
        hasError: true,
        url: null,
      }));
    }
  }, [postImage, postId, instanceId]);

  // Load image on mount
  useEffect(() => {
    loadImage();
    return () => {
      isMounted.current = false;
      if (preloadImageRef.current) {
        preloadImageRef.current.onload = null;
        preloadImageRef.current.onerror = null;
        preloadImageRef.current = null;
      }
    };
  }, [loadImage]);

  // Return the image state and loader
  return { imageState, loadImage };
}
