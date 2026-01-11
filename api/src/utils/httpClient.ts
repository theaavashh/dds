import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// This file is likely meant for frontend use, not backend
// For the backend API, we'll create a simplified version

// Create axios instance with default configuration
const createHttpClient = (baseURL?: string) => {
  // In a Node.js environment, we won't use localStorage or window
  // This file might be misplaced in the backend project
  return {
    get: () => {},
    post: () => {},
    put: () => {},
    delete: () => {},
    interceptors: {
      request: { use: () => {}, eject: () => {} },
      response: { use: () => {}, eject: () => {} }
    }
  };
};

// API Response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API methods
export class ApiClient {
  private client: any;

  constructor(baseURL?: string) {
    this.client = createHttpClient(baseURL);
  }

  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    // Implementation would go here
    return { data: {} as T, success: true };
  }

  async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    // Implementation would go here
    return { data: {} as T, success: true };
  }

  async put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    // Implementation would go here
    return { data: {} as T, success: true };
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    // Implementation would go here
    return { data: {} as T, success: true };
  }

  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    // Implementation would go here
    return { data: {} as T, success: true };
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Gallery-specific API client
export class GalleryApiClient extends ApiClient {
  private basePath = '/api/galleries';

  async getGalleries(query?: any) {
    return this.get(`${this.basePath}`, { params: query });
  }

  async getGallery(id: string) {
    return this.get(`${this.basePath}/${id}`);
  }

  async createGallery(data: any) {
    return this.post(`${this.basePath}`, data);
  }

  async updateGallery(id: string, data: any) {
    return this.put(`${this.basePath}/${id}`, data);
  }

  async deleteGallery(id: string) {
    return this.delete(`${this.basePath}/${id}`);
  }

  async toggleGalleryStatus(id: string) {
    return this.patch(`${this.basePath}/${id}/toggle`);
  }

  // Admin endpoints
  async getGalleriesAdmin(query?: any) {
    return this.get(`${this.basePath}/admin`, { params: query });
  }
}

// Export gallery API client
export const galleryApi = new GalleryApiClient();

// For server-side, we may not need the actual HTTP client
export default {};