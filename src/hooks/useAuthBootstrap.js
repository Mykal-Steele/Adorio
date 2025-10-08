import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { fetchUserData } from '../api';

// Initializes auth state from persisted storage and ensures ancillary client setup.
const ensureInstagramHandle = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const INSTAGRAM_KEY = 'instagram';
  if (!localStorage.getItem(INSTAGRAM_KEY)) {
    localStorage.setItem(INSTAGRAM_KEY, 'kruskal.oakar');
  }
};

/**
 * Bootstraps authenticated user context from persisted tokens on initial load.
 * Keeps component logic slim and makes the login flow easier to reason about.
 * Optimized to prevent multiple authentication calls.
 */
const useAuthBootstrap = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Prevent multiple initialization calls
    if (hasInitialized) {
      return;
    }

    let isActive = true;

    const hydrateUser = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        if (isActive) {
          setIsLoading(false);
          setHasInitialized(true);
        }
        return;
      }

      try {
        const userData = await fetchUserData();
        if (isActive) {
          dispatch(setUser({ user: userData, token: storedToken }));
        }
      } catch (error) {
        localStorage.removeItem('token');
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch user data:', error);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
          setHasInitialized(true);
        }
      }
    };

    ensureInstagramHandle();
    hydrateUser();

    return () => {
      isActive = false;
    };
  }, [dispatch, hasInitialized]);

  return isLoading;
};

export default useAuthBootstrap;
