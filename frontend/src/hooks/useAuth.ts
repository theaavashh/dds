import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { setUser, clearUser, setLoading, setError } from '../store/userSlice';
import { Distributor } from '../store/userSlice';

interface DistributorData {
  distributor: Distributor;
}

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userState: any = useSelector((state: RootState) => state.user);
  const distributor = userState.distributor;
  const isAuthenticated = userState.isAuthenticated;
  const loading = userState.loading;
  const error = userState.error;

  // Check if user is authenticated on mount
  useEffect(() => {
  const checkAuthStatus = async () => {
    dispatch(setLoading(true));
    try {
      // Use the API proxy (handled by Next.js rewrites)
      const apiKey = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || 'frontend_secure_key_2024_change_me';
      const response = await fetch(`/api/distributors/profile`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      });

      if (response.ok) {
        const data: DistributorData = await response.json();
        if (data.distributor) {
          dispatch(setUser(data.distributor));
        } else {
          dispatch(clearUser());
        }
      } else if (response.status === 401) {
        // Only clear the user if the server explicitly says the token is invalid
        dispatch(clearUser());
      } else {
        // For other HTTP errors, log but don't clear the user
        console.warn(`Auth check failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't clear the user on network errors - maintain existing state
    } finally {
      dispatch(setLoading(false));
    }
  };

  checkAuthStatus();
}, [dispatch]);


  const logout = async () => {
    try {
      // Use the API proxy (handled by Next.js rewrites)
      const apiKey = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || 'frontend_secure_key_2024_change_me';
      await fetch(`/api/distributors/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-api-key': apiKey,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(clearUser());
    }
  };

  return { distributor, isAuthenticated, loading, error, logout };
};