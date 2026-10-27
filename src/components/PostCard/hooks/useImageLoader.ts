import { useState, useRef, useEffect, useCallback } from 'react';

export function useImageLoader({ postImage, postId, instanceId }) {
  const isMounted = useRef(false);
  const preloadImageRef = useRef(null);

  const [imageState, setImageState] = useState({
    url: null,
    isLoading: false,
    hasError: false,
    isLoaded: false,
    postId: postId,
  });

  const loadImage = useCallback(() => {
    if (!isMounted.current) return;

    if (preloadImageRef.current) {
      preloadImageRef.current.onload = null;
      preloadImageRef.current.onerror = null;
      preloadImageRef.current = null;
    }

    setImageState((prev) => ({
      ...prev,
      isLoading: true,
      hasError: false,
      isLoaded: false,
    }));

    if (!postImage?.url) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[${instanceId}] No valid image for post ${postId}`);
      }
      setImageState((prev) => ({ ...prev, isLoading: false, hasError: true }));
      return;
    }

    try {
      // No cache-busting param: each upload gets its own Cloudinary public_id, so the URL
      // is already unique. A fresh timestamp on every load skipped the HTTP cache and
      // re-downloaded the image on every mount.
      const url = postImage.url;

      setImageState((prev) => ({ ...prev, url, postId }));

      const preloadImage = new Image();
      preloadImageRef.current = preloadImage;
      preloadImage.crossOrigin = 'anonymous';
      preloadImage.referrerPolicy = 'no-referrer';

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

      preloadImage.src = url;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[${instanceId}] Error loading image:`, error);
      }
      setImageState((prev) => ({
        ...prev,
        isLoading: false,
        hasError: true,
        url: null,
      }));
    }
  }, [postImage, postId, instanceId]);

  useEffect(() => {
    isMounted.current = true;
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

  return { imageState, loadImage };
}
