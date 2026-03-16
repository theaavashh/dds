"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { fetchCsrfToken, refreshCsrfTokenIfNeeded, startCsrfTokenRefresh, stopCsrfTokenRefresh } from '@/lib/csrfClient';
import { authApi } from '@/lib/apiQueries';

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
  setUser: (user: User | null) => void;
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
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query for current user
  const { data: userResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const user = userResponse?.data || null;
  const isAuthenticated = !!user;

  // Check authentication on mount and setup CSRF
  useEffect(() => {
    const setupAuth = async () => {
      if (isAuthenticated) {
        startCsrfTokenRefresh();
      }
    };

    setupAuth();
  }, [isAuthenticated]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authApi.login(email, password);
      
      if (result.success && result.data) {
        setUser(result.data.admin);
        
        // Fetch CSRF token after successful login
        await fetchCsrfToken();
        
        // Start periodic CSRF token refresh for authenticated users
        startCsrfTokenRefresh();
        
        // Refetch current user
        refetch();
      }
      
      return result.success;
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      return false;
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      // Clear client-side state
      queryClient.setQueryData(['currentUser'], null);
      
      // Stop CSRF token refresh
      stopCsrfTokenRefresh();
      
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  const refreshUser = async (): Promise<void> => {
    await refetch();
    if (isAuthenticated) {
      await refreshCsrfTokenIfNeeded();
    }
  };

  const setUser = (userData: User | null) => {
    queryClient.setQueryData(['currentUser'], { success: true, data: userData });
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    setUser,
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