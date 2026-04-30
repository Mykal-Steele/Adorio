import { useEffect, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setUser, setAuthLoaded } from '../store/userSlice';
import { fetchUserData } from '../api';

const useAuthBootstrap = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const hydrateUser = async () => {
      const storedToken = localStorage.getItem('token');

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
        localStorage.removeItem('token');
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch user data:', error);
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
