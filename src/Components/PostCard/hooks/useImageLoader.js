import { useState, useRef, useEffect, useCallback } from "react";

export function useImageLoader({ postImage, postId, instanceId }) {
  const isMounted = useRef(false);
  const preloadImageRef = useRef(null);

  // keeping track of the image state
  const [imageState, setImageState] = useState({
    url: null,
    isLoading: false,
    hasError: false,
    isLoaded: false,
    postId: postId,
  });

  // function to load the image
  const loadImage = useCallback(() => {
    if (!isMounted.current) return; // don't do anything if unmounted

    // clean up old image stuff
    if (preloadImageRef.current) {
      preloadImageRef.current.onload = null;
      preloadImageRef.current.onerror = null;
      preloadImageRef.current = null;
    }

    // reset the state before loading
    setImageState((prev) => ({
      ...prev,
      isLoading: true,
      hasError: false,
      isLoaded: false,
    }));

    // check if we actually have an image
    if (!postImage?.url) {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[${instanceId}] No valid image for post ${postId}`);
      }
      setImageState((prev) => ({ ...prev, isLoading: false, hasError: true }));
      return;
    }

    try {
      // make a unique url so we don't get cached images
      const baseUrl = postImage.url.split("?")[0];
      const uniqueUrl = `${baseUrl}?postId=${postId}&instance=${instanceId}&t=${Date.now()}&r=${Math.random()
        .toString(36)
        .slice(2)}`;

      // update the url in state
      setImageState((prev) => ({ ...prev, url: uniqueUrl, postId }));

      // preload the image
      const preloadImage = new Image();
      preloadImageRef.current = preloadImage;
      preloadImage.crossOrigin = "anonymous";
      preloadImage.referrerPolicy = "no-referrer";

      // what to do when image loads
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

      // what to do when image fails
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
      if (process.env.NODE_ENV !== "production") {
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

  // load image when component mounts
  useEffect(() => {
    isMounted.current = true; // gotta mark this as mounted or we get weird bugs
    loadImage();

    // gotta cleanup or we get memory leaks everywhere
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
