import axios from 'axios';
import { getApiBaseUrl } from './api';

let csrfToken: string | null = null;
let refreshTimer: NodeJS.Timeout | null = null;

/**
 * Fetch CSRF token from the server
 */
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const baseApi = getApiBaseUrl();
    const response = await axios.get(`${baseApi}/auth/csrf-token`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const result = response.data;
    if (result?.success && result?.data?.csrfToken) {
      csrfToken = result.data.csrfToken;
      return csrfToken;
    }
    console.error('Failed to fetch CSRF token:', response.status);
    return null;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching CSRF token:', typeof error.response?.data?.message === 'string' ? error.response.data.message : error.message);
    } else {
      console.error('Error fetching CSRF token:', error instanceof Error ? error.message : String(error));
    }
    return null;
  }
}

/**
 * Get the current CSRF token
 */
export function getCsrfToken(): string | null {
  return csrfToken;
}

/**
 * Set the CSRF token
 */
export function setCsrfToken(token: string): void {
  csrfToken = token;
}

/**
 * Clear the CSRF token
 */
export function clearCsrfToken(): void {
  csrfToken = null;
  
  // Clear any existing refresh timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

/**
 * Add CSRF token to request headers
 */
export function addCsrfToken(headers: Record<string, string> = {}): Record<string, string> {
  if (csrfToken) {
    return {
      ...headers,
      'x-csrf-token': csrfToken
    };
  }
  return headers;
}

/**
 * Refresh CSRF token if needed
 */
export async function refreshCsrfTokenIfNeeded(): Promise<void> {
  // In a more complex implementation, you could check token expiration
  // For now, we'll just fetch a new token
  await fetchCsrfToken();
}

/**
 * Start periodic CSRF token refresh
 * This will refresh the token every 10 hours (less than the 12-hour short token expiry)
 */
export function startCsrfTokenRefresh(): void {
  // Clear any existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }
  
  // Set up periodic refresh (every 10 hours)
  refreshTimer = setInterval(async () => {
    console.log('Refreshing CSRF token...');
    await fetchCsrfToken();
  }, 10 * 60 * 60 * 1000); // 10 hours
}

/**
 * Stop periodic CSRF token refresh
 */
export function stopCsrfTokenRefresh(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}
