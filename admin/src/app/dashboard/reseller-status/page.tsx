'use client';

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Package, DollarSign, Star, MessageCircle, Clock, CheckCircle, XCircle, AlertCircle, BarChart3, Activity } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { distributorApi, type DistributorStats, type Distributor } from '@/lib/distributorApi';

interface ResellerStats {
  totalResellers: number;
  activeResellers: number;
  pendingApplications: number;
  thisMonthNewResellers: number;
  topPerformers: Array<{
    id: string;
    name: string;
    email: string;
    sales: number;
    commission: number;
    joinDate: string;
    status: 'active' | 'inactive' | 'pending';
  }>;
  recentApplications: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    businessName: string;
    appliedAt: string;
    status: 'pending' | 'approved' | 'rejected' | 'blocked';
    documents: string[];
  }>;
}

// Helper function to map distributor data to reseller interface
const mapDistributorToResellerStats = (distributorStats: DistributorStats): ResellerStats => {
  return {
    totalResellers: distributorStats.totalDistributors,
    activeResellers: distributorStats.activeDistributors,
    pendingApplications: distributorStats.pendingApplications,
    thisMonthNewResellers: distributorStats.thisMonthNewDistributors,
    topPerformers: distributorStats.topPerformers.map(distributor => ({
      id: distributor.id,
      name: `${distributor.firstName} ${distributor.lastName}`,
      email: distributor.email,
      sales: distributor.totalRevenue,
      commission: (distributor as any).commission || Math.round(distributor.totalRevenue * 0.25),
      joinDate: distributor.registrationDate,
      status: distributor.status === 'approved' ? 'active' : 
              distributor.status === 'blocked' ? 'inactive' : 
              distributor.status as 'active' | 'inactive' | 'pending'
    })),
    recentApplications: distributorStats.recentApplications.map(distributor => ({
      id: distributor.id,
      name: `${distributor.firstName} ${distributor.lastName}`,
      email: distributor.email,
      phone: distributor.phone,
      businessName: distributor.companyName,
      appliedAt: distributor.registrationDate,
      status: distributor.status,
      documents: (distributor as any).documents || ['Business License', 'Address Proof', 'ID Proof']
    }))
  };
};

export default function ResellerStatusPage() {
  const [stats, setStats] = useState<ResellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  useEffect(() => {
    fetchResellerStats();
  }, []);

  const fetchResellerStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await distributorApi.getDistributorStats();
      
      if (response.success && response.data) {
        const mappedStats = mapDistributorToResellerStats(response.data);
        setStats(mappedStats);
      } else {
        setError(response.message || 'Failed to fetch reseller statistics');
        // Fallback to empty stats
        setStats({
          totalResellers: 0,
          activeResellers: 0,
          pendingApplications: 0,
          thisMonthNewResellers: 0,
          topPerformers: [],
          recentApplications: []
        });
      }
    } catch (err) {
      console.error('Error fetching reseller stats:', err);
      setError('An error occurred while fetching reseller statistics');
      // Fallback to empty stats
      setStats({
        totalResellers: 0,
        activeResellers: 0,
        pendingApplications: 0,
        thisMonthNewResellers: 0,
        topPerformers: [],
        recentApplications: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const response = await distributorApi.approveDistributor(applicationId);
      
      if (response.success) {
        // Refresh the stats to show updated data
        await fetchResellerStats();
        // You could also show a success toast here
      } else {
        console.error('Failed to approve application:', response.message);
        // You could show an error toast here
      }
    } catch (err) {
      console.error('Error approving application:', err);
      // You could show an error toast here
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const response = await distributorApi.rejectDistributor(applicationId);
      
      if (response.success) {
        // Refresh the stats to show updated data
        await fetchResellerStats();
        // You could also show a success toast here
      } else {
        console.error('Failed to reject application:', response.message);
        // You could show an error toast here
      }
    } catch (err) {
      console.error('Error rejecting application:', err);
      // You could show an error toast here
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout showBreadcrumb={true}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DFC97E]"></div>
            <span className="ml-2 text-gray-600">Loading reseller status...</span>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error && !stats) {
    return (
      <ProtectedRoute>
        <DashboardLayout showBreadcrumb={true}>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 font-medium mb-2">Error loading reseller status</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <button 
              onClick={fetchResellerStats}
              className="px-4 py-2 bg-[#DFC97E] text-black rounded-lg hover:bg-[#C7A862] transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout showBreadcrumb={true}>
        <div className="p-6">
          {/* Error Notification */}
          {error && stats && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Warning</p>
                <p className="text-yellow-600 text-sm">{error}</p>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Reseller Status</h1>
              <p className="text-gray-600">Manage and monitor your reseller network</p>
            </div>
            <button 
              onClick={fetchResellerStats}
              disabled={loading}
              className="px-4 py-2 bg-[#DFC97E] text-black rounded-lg hover:bg-[#C7A862] transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Activity className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Resellers</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{stats?.totalResellers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Active Resellers</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{stats?.activeResellers}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pending Applications</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-2">{stats?.pendingApplications}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">New This Month</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">{stats?.thisMonthNewResellers}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Applications
              </h2>
            </div>
            <div className="p-6">
              {stats?.recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No recent applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.recentApplications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{application.name}</h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status}</span>
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Email:</span>
                              {application.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Phone:</span>
                              {application.phone}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Business:</span>
                              {application.businessName}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Applied:</span>
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="text-xs font-medium text-gray-500">Documents:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {application.documents.map((doc, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {doc}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {application.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApproveApplication(application.id)}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRejectApplication(application.id)}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Top Performers
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reseller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats?.topPerformers.map((reseller) => (
                    <tr key={reseller.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#DFC97E] to-[#C7A862] rounded-full flex items-center justify-center text-white font-semibold">
                            {reseller.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{reseller.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reseller.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">NPR {reseller.sales.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">NPR {reseller.commission.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(reseller.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reseller.status)}`}>
                          {getStatusIcon(reseller.status)}
                          <span className="ml-1 capitalize">{reseller.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}