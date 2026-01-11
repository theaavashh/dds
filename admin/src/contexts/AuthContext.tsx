"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { fetchCsrfToken, refreshCsrfTokenIfNeeded, startCsrfTokenRefresh, stopCsrfTokenRefresh } from '@/lib/csrfClient';

interface User {
  id: string;
  email: string;
  username: string;
  fullname?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Base URL without /api - we'll add /api to each endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Fetch current user from server (validates cookie)
  const fetchCurrentUser = useCallback(async () => {
    try {
      console.log('Fetching current user from:', `${API_BASE_URL}/api/auth/me`);
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // Important: sends cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('User data received:', result);
        if (result.success && result.data) {
          setUser(result.data);
          return true;
        }
      } else {
        console.log('Failed to fetch user, status:', response.status);
        // Clear user state if not authenticated
        setUser(null);
      }
      return false;
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Clear user state on error
      setUser(null);
      return false;
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');
      setIsLoading(true);
      const success = await fetchCurrentUser();
      if (success) {
        // If user is authenticated, start CSRF token refresh
        startCsrfTokenRefresh();
      }
      setIsLoading(false);
      console.log('Authentication check completed');
    };

    checkAuth();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const loginUrl = `${API_BASE_URL}/api/auth/login`;
      console.log('Logging in to:', loginUrl);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include', // Important: receives and sends cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const statusMessages: Record<number, string> = {
          401: 'Invalid email or password',
          400: 'Invalid request. Please check your input.',
          403: 'Access denied. Account may be deactivated.',
          404: 'Login endpoint not found. Please check if the server is running.',
          500: 'Server error. Please try again later.',
        };

        let errorMessage = statusMessages[response.status] || 'Login failed';
        
        // For 404, provide more helpful message
        if (response.status === 404) {
          errorMessage = `Login endpoint not found. Please ensure the API server is running at ${API_BASE_URL}`;
        }

        // Try to get error message from response
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            if (errorData?.message) {
              errorMessage = errorData.message;
            }
          }
        } catch {
          // Use default error message
        }

        // Always show user-friendly message for 401
        if (response.status === 401) {
          errorMessage = 'Invalid email or password';
        }

        toast.error(errorMessage);
        setIsLoading(false);
        return false;
      }

      const result = await response.json();
      console.log('Login result:', result);

      if (result.success && result.data) {
        // Backend should set httpOnly cookie, we only store user data in state
        setUser(result.data.admin);
        
        // Fetch CSRF token after successful login
        await fetchCsrfToken();
        
        // Start periodic CSRF token refresh for authenticated users
        startCsrfTokenRefresh();
        
        setIsLoading(false);
        return true;
      }

      toast.error('Login failed. Please try again.');
      setIsLoading(false);
      return false;
    } catch (error: any) {
      setIsLoading(false);

      // Handle network errors
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        toast.error('Network error. Please check if the server is running.');
        return false;
      }

      toast.error('Login failed. Please try again.');
      return false;
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint to clear server-side session
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear client-side state
      setUser(null);
      
      // Stop CSRF token refresh
      stopCsrfTokenRefresh();
      
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  const refreshUser = async (): Promise<void> => {
    const success = await fetchCurrentUser();
    if (success) {
      // Refresh CSRF token when user session is validated
      await refreshCsrfTokenIfNeeded();
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};