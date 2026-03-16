import { QueryClient } from '@tanstack/react-query';

// Default options for all queries
export const queryOptions = {
  defaultOptions: {
    queries: {
      retry: (failureCount: number) => {
        // Retry failed requests up to 3 times
        return failureCount < 3;
      },
      retryDelay: (attemptIndex: number) => Math.pow(2, attemptIndex) * 1000, // Exponential backoff
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      refetchOnMount: false,
      refetchOnWindowFocus: true,
    },
  },
};

// Create a client
export const queryClient = new QueryClient(queryOptions);

// Fetch wrapper for API calls
export const fetchClient = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, {
      method: options?.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_FRONTEND_API_KEY || 'frontend_secure_key_2024_change_me',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};
