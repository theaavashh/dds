import { apiService } from './apiClient';

export interface Distributor {
  id: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  registrationDate: string;
  totalOrders: number;
  totalRevenue: number;
  lastLogin: string;
}

export interface DistributorListResponse {
  success: boolean;
  data: Distributor[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DistributorStats {
  totalDistributors: number;
  activeDistributors: number;
  pendingApplications: number;
  thisMonthNewDistributors: number;
  topPerformers: Distributor[];
  recentApplications: Distributor[];
}

export const distributorApi = {
  // Get all distributors with pagination and filtering
  async getDistributors(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<DistributorListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const url = `/distributors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<Distributor[]>(url);
    
    return {
      success: response.success,
      data: response.data || [],
      count: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      limit: response.pagination?.limit || 10,
      totalPages: response.pagination?.totalPages || 1
    };
  },

  // Get distributor by ID
  async getDistributorById(id: string): Promise<{ success: boolean; data?: Distributor; message?: string }> {
    return await apiService.get<Distributor>(`/distributors/${id}`);
  },

  // Update distributor status
  async updateDistributorStatus(id: string, status: string): Promise<{ success: boolean; data?: Distributor; message?: string }> {
    return await apiService.patch<Distributor>(`/distributors/${id}/status`, { status });
  },

  // Get distributor statistics
  async getDistributorStats(): Promise<{ success: boolean; data?: DistributorStats; message?: string }> {
    try {
      // Get all distributors to calculate stats
      const allDistributors = await this.getDistributors({ limit: 1000 });
      
      if (!allDistributors.success || !allDistributors.data) {
        return {
          success: false,
          message: 'Failed to fetch distributor data'
        };
      }

      const distributors = allDistributors.data;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // Calculate statistics
      const totalDistributors = distributors.length;
      const activeDistributors = distributors.filter(d => d.status === 'approved').length;
      const pendingApplications = distributors.filter(d => d.status === 'pending').length;
      
      // Calculate new distributors this month
      const thisMonthNewDistributors = distributors.filter(d => {
        const registrationDate = new Date(d.registrationDate);
        return registrationDate.getMonth() === currentMonth && 
               registrationDate.getFullYear() === currentYear;
      }).length;

      // Get top performers (approved distributors sorted by total revenue)
      const topPerformers = distributors
        .filter(d => d.status === 'approved' && d.totalRevenue > 0)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5)
        .map(d => ({
          ...d,
          // Add commission calculation (25% of revenue)
          commission: Math.round(d.totalRevenue * 0.25)
        }));

      // Get recent applications (pending distributors sorted by registration date)
      const recentApplications = distributors
        .filter(d => d.status === 'pending')
        .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
        .slice(0, 10)
        .map(d => ({
          ...d,
          // Add documents array (placeholder for now)
          documents: ['Business License', 'Address Proof', 'ID Proof']
        }));

      const stats: DistributorStats = {
        totalDistributors,
        activeDistributors,
        pendingApplications,
        thisMonthNewDistributors,
        topPerformers,
        recentApplications
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error calculating distributor stats:', error);
      return {
        success: false,
        message: 'Error calculating distributor statistics'
      };
    }
  },

  // Approve distributor application
  async approveDistributor(id: string): Promise<{ success: boolean; data?: Distributor; message?: string }> {
    return await this.updateDistributorStatus(id, 'approved');
  },

  // Reject distributor application
  async rejectDistributor(id: string): Promise<{ success: boolean; data?: Distributor; message?: string }> {
    return await this.updateDistributorStatus(id, 'rejected');
  },

  // Block distributor
  async blockDistributor(id: string): Promise<{ success: boolean; data?: Distributor; message?: string }> {
    return await this.updateDistributorStatus(id, 'blocked');
  }
};