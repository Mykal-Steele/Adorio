import { useEffect, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setUser, setAuthLoaded } from '../store/userSlice';
import { fetchUserData, refreshAccessToken } from '../api';
import { getToken, getRefreshToken, setToken, clearAuthTokens } from '../utils/tokenStorage';

const useAuthBootstrap = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const hydrateUser = async () => {
      const storedToken = getToken();

      if (!storedToken) {
        if (isActive) {
          dispatch(setAuthLoaded());
          setIsLoading(false);
        }
        return;
      }

      try {
        const userData = await fetchUserData();
        if (isActive) {
          dispatch(setUser({ user: userData, token: storedToken }));
        }
      } catch (error) {
        const storedRefreshToken = getRefreshToken();
        if (storedRefreshToken) {
          try {
            const { token: newToken } = await refreshAccessToken(storedRefreshToken);
            setToken(newToken);
            const userData = await fetchUserData();
            if (isActive) {
              dispatch(setUser({ user: userData, token: newToken }));
            }
            return;
          } catch {
            // fall through to clearAuthTokens() below
          }
        }
        clearAuthTokens();
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Failed to fetch user data:', error);
        }
      } finally {
        if (isActive) {
          dispatch(setAuthLoaded());
          setIsLoading(false);
        }
      }
    };

    hydrateUser();

    return () => {
      isActive = false;
    };
  }, [dispatch]);

  return isLoading;
};

export default useAuthBootstrap;
