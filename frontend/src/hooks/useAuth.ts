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
      // Use the API URL from environment variables or default to /api
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/distributors/profile`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
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
      }
      // For other status codes (like 500, network errors), don't clear the user
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
      // Use the API URL from environment variables or default to /api
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      await fetch(`${apiUrl}/api/distributors/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(clearUser());
    }
  };

  return { distributor, isAuthenticated, loading, error, logout };
};