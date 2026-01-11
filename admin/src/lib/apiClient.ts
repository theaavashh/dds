// Utility functions for making authenticated API calls using cookies
import axios, { AxiosResponse } from 'axios';
import { getApiBaseUrl } from './api';
import type { Gallery, NewGallery } from '@/types';
import { addCsrfToken, fetchCsrfToken, refreshCsrfTokenIfNeeded, getCsrfToken } from './csrfClient';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Make an authenticated GET request
 */
export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.get(url, { withCredentials: true, headers });
    return handleAxiosResponse<T>(response);
  } catch (error: unknown) {
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : (error instanceof Error ? error.message : 'An unknown error occurred'),
      message: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : 'Network error'
    };
  }
}

/**
 * Make an authenticated POST request
 */
export async function apiPost<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  try {
    await fetchCsrfToken();
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...addCsrfToken() };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.post(url, data, { withCredentials: true, headers });
    return handleAxiosResponse<T>(response);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 403 && typeof error.response?.data?.message === 'string' && error.response.data.message.includes('CSRF')) {
      await refreshCsrfTokenIfNeeded();
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...addCsrfToken() };
      if (token) headers.Authorization = `Bearer ${token}`;
      const retryResponse = await axios.post(url, data, { withCredentials: true, headers });
      return handleAxiosResponse<T>(retryResponse);
    }
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : (error instanceof Error ? error.message : 'An unknown error occurred'),
      message: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : 'Network error'
    };
  }
}

/**
 * Make an authenticated POST request with FormData
 */
export async function apiPostFormData<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
  try {
    await fetchCsrfToken();
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
    const headers: Record<string, string> = { ...addCsrfToken() };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.post(url, formData, { withCredentials: true, headers });
    return handleAxiosResponse<T>(response);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 403 && typeof error.response?.data?.message === 'string' && error.response.data.message.includes('CSRF')) {
      await refreshCsrfTokenIfNeeded();
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
      const headers: Record<string, string> = { ...addCsrfToken() };
      if (token) headers.Authorization = `Bearer ${token}`;
      const retryResponse = await axios.post(url, formData, { withCredentials: true, headers });
      return handleAxiosResponse<T>(retryResponse);
    }
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : (error instanceof Error ? error.message : 'An unknown error occurred'),
      message: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : 'Network error'
    };
  }
}

/**
 * Make an authenticated PUT request
 */
export async function apiPut<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  try {
    await fetchCsrfToken();
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...addCsrfToken() };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.put(url, data, { withCredentials: true, headers });
    return handleAxiosResponse<T>(response);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 403 && typeof error.response?.data?.message === 'string' && error.response.data.message.includes('CSRF')) {
      await refreshCsrfTokenIfNeeded();
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...addCsrfToken() };
      if (token) headers.Authorization = `Bearer ${token}`;
      const retryResponse = await axios.put(url, data, { withCredentials: true, headers });
      return handleAxiosResponse<T>(retryResponse);
    }
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : (error instanceof Error ? error.message : 'An unknown error occurred'),
      message: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : 'Network error'
    };
  }
}

export async function apiPatch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  try {
    await fetchCsrfToken();
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...addCsrfToken() };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.patch(url, data, { withCredentials: true, headers });
    return handleAxiosResponse<T>(response);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 403 && typeof error.response?.data?.message === 'string' && error.response.data.message.includes('CSRF')) {
      await refreshCsrfTokenIfNeeded();
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...addCsrfToken() };
      if (token) headers.Authorization = `Bearer ${token}`;
      const retryResponse = await axios.patch(url, data, { withCredentials: true, headers });
      return handleAxiosResponse<T>(retryResponse);
    }
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : (error instanceof Error ? error.message : 'An unknown error occurred'),
      message: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : 'Network error'
    };
  }
}

/**
 * Make an authenticated PUT request with FormData
 */
export async function apiPutFormData<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
  try {
    await fetchCsrfToken();
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
    const headers: Record<string, string> = { ...addCsrfToken() };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.put(url, formData, { withCredentials: true, headers });
    return handleAxiosResponse<T>(response);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 403 && typeof error.response?.data?.message === 'string' && error.response.data.message.includes('CSRF')) {
      await refreshCsrfTokenIfNeeded();
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
      const headers: Record<string, string> = { ...addCsrfToken() };
      if (token) headers.Authorization = `Bearer ${token}`;
      const retryResponse = await axios.put(url, formData, { withCredentials: true, headers });
      return handleAxiosResponse<T>(retryResponse);
    }
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : (error instanceof Error ? error.message : 'An unknown error occurred'),
      message: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : 'Network error'
    };
  }
}

/**
 * Make an authenticated DELETE request
 */
export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  try {
    await fetchCsrfToken();
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...addCsrfToken() };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.delete(url, { withCredentials: true, headers });
    return handleAxiosResponse<T>(response);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 204) {
      return { success: true, message: 'Deleted successfully' };
    }
    if (axios.isAxiosError(error) && error.response?.status === 403 && typeof error.response?.data?.message === 'string' && error.response.data.message.includes('CSRF')) {
      await refreshCsrfTokenIfNeeded();
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...addCsrfToken() };
      if (token) headers.Authorization = `Bearer ${token}`;
      const retryResponse = await axios.delete(url, { withCredentials: true, headers });
      return handleAxiosResponse<T>(retryResponse);
    }
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : (error instanceof Error ? error.message : 'An unknown error occurred'),
      message: axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === 'string' ? error.response.data.message : 'Network error')
        : 'Network error'
    };
  }
}

/**
 * Handle API response
 */
function handleAxiosResponse<T>(response: AxiosResponse<unknown>): ApiResponse<T> {
  const result = (response.data ?? {}) as { message?: string; data?: T };
  if (response.status < 200 || response.status >= 300) {
    return {
      success: false,
      error: result.message || 'Request failed',
      message: result.message || 'Request failed'
    };
  }
  return {
    success: true,
    data: result.data,
    message: result.message
  };
}

/**
 * Handle authentication errors and redirect to login if needed
 */
export function handleAuthError(message: string | undefined): boolean {
  if (message === 'Access denied. No token provided.' || 
      message?.includes('Session expired') || 
      message?.includes('Invalid token') ||
      message?.includes('Unauthorized')) {
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return true;
  }
  return false;
}

export const apiService = {
  get: async <T>(path: string): Promise<ApiResponse<T>> => {
    const base = getApiBaseUrl();
    const normalizedPath = path.replace(/^\/api(\/|$)/, '/');
    const result = await apiGet<T>(`${base}${normalizedPath}`);
    return result;
  },
  post: async <T>(path: string, data?: unknown, _config?: unknown): Promise<ApiResponse<T>> => {
    const base = getApiBaseUrl();
    const normalizedPath = path.replace(/^\/api(\/|$)/, '/');
    const url = `${base}${normalizedPath}`;
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      const result = await apiPostFormData<T>(url, data);
      return result;
    }
    const result = await apiPost<T>(url, data);
    return result;
  },
  put: async <T>(path: string, data?: unknown, _config?: unknown): Promise<ApiResponse<T>> => {
    const base = getApiBaseUrl();
    const normalizedPath = path.replace(/^\/api(\/|$)/, '/');
    const url = `${base}${normalizedPath}`;
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      const result = await apiPutFormData<T>(url, data);
      return result;
    }
    const result = await apiPut<T>(url, data);
    return result;
  },
  patch: async <T>(path: string, data?: unknown, _config?: unknown): Promise<ApiResponse<T>> => {
    const base = getApiBaseUrl();
    const normalizedPath = path.replace(/^\/api(\/|$)/, '/');
    const result = await apiPatch<T>(`${base}${normalizedPath}`, data);
    return result;
  },
  delete: async <T>(path: string): Promise<ApiResponse<T>> => {
    const base = getApiBaseUrl();
    const normalizedPath = path.replace(/^\/api(\/|$)/, '/');
    const result = await apiDelete<T>(`${base}${normalizedPath}`);
    return result;
  }
};

export const galleryApi = {
  async getGalleriesAdmin(): Promise<ApiResponse<Gallery[]>> {
    const base = getApiBaseUrl();
    return apiGet<Gallery[]>(`${base}/galleries/admin`);
  },
  async createGallery(data: Omit<NewGallery, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Gallery>> {
    const base = getApiBaseUrl();
    return apiPost<Gallery>(`${base}/galleries`, data);
  },
  async updateGallery(id: string, data: Omit<NewGallery, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Gallery>> {
    const base = getApiBaseUrl();
    return apiPut<Gallery>(`${base}/galleries/${id}`, data);
  },
  async deleteGallery(id: string): Promise<ApiResponse<void>> {
    const base = getApiBaseUrl();
    return apiDelete<void>(`${base}/galleries/${id}`);
  },
  async toggleGalleryStatus(id: string): Promise<ApiResponse<Gallery>> {
    const base = getApiBaseUrl();
    return apiPatch<Gallery>(`${base}/galleries/${id}/toggle`);
  }
};
