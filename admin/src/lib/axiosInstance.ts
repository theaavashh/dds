import axios from 'axios';
import { getCsrfToken, setCsrfToken } from './csrfClient';

// Normalize base URL to avoid double /api
const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const normalizedBase = rawBase.replace(/\/api\/?$/, '');

// Create an axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: normalizedBase,
  withCredentials: true, // Include cookies in requests
  headers: {},
});

// Request interceptor to add CSRF token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get CSRF token from the CSRF client library
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common error cases
axiosInstance.interceptors.response.use(
  (response) => {
    // Return only the data part of the response
    return response.data;
  },
  async (error) => {
    // Handle CSRF token expiration
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      // Refresh CSRF token and retry the request
      try {
        await refreshCsrfToken();
        // Retry the original request with the new token
        const originalRequest = error.config;
        const csrfToken = getCsrfToken();
        originalRequest.headers['x-csrf-token'] = csrfToken;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      redirectToLogin();
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get cookie by name
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Helper function to refresh CSRF token
async function refreshCsrfToken(): Promise<void> {
  try {
    type CsrfResponse = { success?: boolean; data?: { csrfToken?: string } } | { csrfToken?: string };
    const response = (await axiosInstance.get('/api/auth/csrf-token')) as CsrfResponse;
    const csrfToken = (('data' in response ? response.data?.csrfToken : (response as { csrfToken?: string }).csrfToken) ?? null);
    if (csrfToken) {
      setCsrfToken(csrfToken);
      document.cookie = `csrfToken=${csrfToken}; path=/; SameSite=Strict`;
    }
  } catch (error) {
    console.error('Failed to refresh CSRF token:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Helper function to redirect to login
function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

export default axiosInstance;
