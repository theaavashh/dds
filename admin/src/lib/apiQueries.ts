import { apiRequest, getApiBaseUrl } from '@/lib/api';

// Auth API functions
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiRequest(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  },

  getCurrentUser: async () => {
    const response = await apiRequest(`${getApiBaseUrl()}/auth/me`, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch user');
    }

    return response.json();
  },

  logout: async () => {
    const response = await apiRequest(`${getApiBaseUrl()}/auth/logout`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Logout failed');
    }

    return response.json();
  },

  sendOtp: async (email: string) => {
    const response = await apiRequest(`${getApiBaseUrl()}/auth/send-otp`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to send OTP');
    }

    return response.json();
  },

  verifyOtp: async (email: string, otp: string) => {
    const response = await apiRequest(`${getApiBaseUrl()}/auth/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Invalid OTP');
    }

    return response.json();
  },
};

// Categories API functions
export const categoriesApi = {
  getCategories: async () => {
    const response = await apiRequest(`${getApiBaseUrl()}/categories`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch categories');
    }

    return response.json();
  },

  getCategory: async (id: string) => {
    const response = await apiRequest(`${getApiBaseUrl()}/api/categories/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch category');
    }

    return response.json();
  },

  createCategory: async (categoryData: any) => {
    const response = await apiRequest(`${getApiBaseUrl()}/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create category');
    }

    return response.json();
  },

  updateCategory: async (id: string, categoryData: any) => {
    const response = await apiRequest(`${getApiBaseUrl()}/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update category');
    }

    return response.json();
  },

  deleteCategory: async (id: string) => {
    const response = await apiRequest(`${getApiBaseUrl()}/api/categories/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete category');
    }

    return response.json();
  },
};

// Products API functions
export const productsApi = {
  getProducts: async (params?: { page?: number; limit?: number; category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);

    const url = `${getApiBaseUrl()}/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const response = await apiRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch products');
    }

    return response.json();
  },

  getProduct: async (id: string) => {
    const response = await apiRequest(`${getApiBaseUrl()}/api/products/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch product');
    }

    return response.json();
  },

  createProduct: async (productData: FormData) => {
    const response = await fetch(`${getApiBaseUrl()}/products`, {
      method: 'POST',
      body: productData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create product');
    }

    return response.json();
  },

  updateProduct: async (id: string, productData: FormData) => {
    const response = await fetch(`${getApiBaseUrl()}/products/${id}`, {
      method: 'PUT',
      body: productData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update product');
    }

    return response.json();
  },

  deleteProduct: async (id: string) => {
    const response = await apiRequest(`${getApiBaseUrl()}/api/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete product');
    }

    return response.json();
  },
};