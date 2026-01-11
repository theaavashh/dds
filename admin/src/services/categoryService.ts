import axiosInstance from '@/lib/axiosInstance';
import { fetchCsrfToken } from '@/lib/csrfClient';
import { Category, Subcategory } from '@/types/category';

// Define API response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  errors?: any[]; // Add this to capture validation errors
}

interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

// Category Service
export const categoryService = {
  // Fetch all categories with subcategories (admin)
  getAllCategories: async (): Promise<ApiResponse<CategoryWithSubcategories[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<CategoryWithSubcategories[]>>('/api/categories/admin/all');
      return response as any;
    } catch (error: any) {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
        const catsResp = await fetch(`${base}/api/categories`, { credentials: 'include' });
        const catsJson = await catsResp.json();
        const categories = (catsJson?.data || []) as Category[];

        const withSubs: CategoryWithSubcategories[] = [];
        for (const cat of categories) {
          try {
            const subsResp = await fetch(`${base}/api/categories/${cat.id}/subcategories`, { credentials: 'include' });
            const subsJson = await subsResp.json();
            const subcategories = subsJson?.data || [];
            withSubs.push({ ...(cat as any), subcategories });
          } catch {
            withSubs.push({ ...(cat as any), subcategories: [] });
          }
        }

        return {
          success: true,
          data: withSubs
        };
      } catch (fallbackErr: any) {
        return {
          success: false,
          error: fallbackErr.message || error.message || 'Failed to fetch categories',
          message: fallbackErr.message || error.message || 'Failed to fetch categories'
        };
      }
    }
  },

  // Create category with subcategories
  createCategory: async (formData: FormData): Promise<ApiResponse<CategoryWithSubcategories>> => {
    try {
      await fetchCsrfToken();
      // Log the form data being sent
      console.log('Sending form data:');
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }
      const response = await axiosInstance.post<ApiResponse<CategoryWithSubcategories>>(
        '/api/categories/with-subcategories',
        formData
      );
      return response as any;
    } catch (error: any) {
      // Log the full error for debugging
      console.error('Category creation error:', error);
      
      // Extract validation errors if they exist
      let errorMessage = 'Failed to create category';
      let validationErrors: any[] = [];
      
      if (error.response?.data) {
        console.log('Error response data:', error.response.data);
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.data.errors) {
          validationErrors = error.response.data.errors;
          // Add validation errors to the message
          errorMessage += ': ' + validationErrors.map(err => `${err.path}: ${err.message}`).join(', ');
        }
      }
      
      return {
        success: false,
        error: error.message || errorMessage,
        message: errorMessage,
        errors: validationErrors
      };
    }
  },

  // Update category
  updateCategory: async (id: string, formData: FormData): Promise<ApiResponse<Category>> => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.put<ApiResponse<Category>>(
        `/api/categories/${id}`,
        formData
      );
      return response as any;
    } catch (error: any) {
      // Log the full error for debugging
      console.error('Category update error:', error);
      
      // Extract validation errors if they exist
      let errorMessage = 'Failed to update category';
      let validationErrors: any[] = [];
      
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.data.errors) {
          validationErrors = error.response.data.errors;
          // Add validation errors to the message
          errorMessage += ': ' + validationErrors.map(err => `${err.path}: ${err.message}`).join(', ');
        }
      }
      
      return {
        success: false,
        error: error.message || errorMessage,
        message: errorMessage,
        errors: validationErrors
      };
    }
  },

  // Delete category
  deleteCategory: async (id: string): Promise<ApiResponse<{}>> => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.delete<ApiResponse<{}>>(`/api/categories/${id}`);
      return response as any;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete category',
        message: error.message || 'Failed to delete category'
      };
    }
  },

  // Toggle category status
  toggleCategoryStatus: async (id: string): Promise<ApiResponse<Category>> => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.patch<ApiResponse<Category>>(`/api/categories/${id}`);
      return response as any;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to toggle category status',
        message: error.message || 'Failed to toggle category status'
      };
    }
  },

  // Create subcategory
  createSubcategory: async (categoryId: string, data: Partial<Subcategory>): Promise<ApiResponse<Subcategory>> => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.post<ApiResponse<Subcategory>>(`/api/categories/${categoryId}/subcategories`, data);
      return response as any;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create subcategory',
        message: error.message || 'Failed to create subcategory'
      };
    }
  },

  // Update subcategory
  updateSubcategory: async (id: string, data: Partial<Subcategory>): Promise<ApiResponse<Subcategory>> => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.put<ApiResponse<Subcategory>>(`/api/categories/subcategories/${id}`, data);
      return response as any;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update subcategory',
        message: error.message || 'Failed to update subcategory'
      };
    }
  },

  // Delete subcategory
  deleteSubcategory: async (id: string): Promise<ApiResponse<{}>> => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.delete<ApiResponse<{}>>(`/api/categories/subcategories/${id}`);
      return response as any;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete subcategory',
        message: error.message || 'Failed to delete subcategory'
      };
    }
  },

  // Toggle subcategory status
  toggleSubcategoryStatus: async (id: string): Promise<ApiResponse<Subcategory>> => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.patch<ApiResponse<Subcategory>>(`/api/categories/subcategories/${id}`);
      return response as any;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to toggle subcategory status',
        message: error.message || 'Failed to toggle subcategory status'
      };
    }
  }
};
