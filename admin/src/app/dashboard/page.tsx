"use client";

import { useState, useEffect, Suspense } from "react";
import {
  BarChart3,
  FolderOpen,
  Package,
  Percent,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  FileText,
  Star,
  Truck,
  RotateCcw,
  XCircle,
  Package2,
  Layers,
  BarChart,
  Mail,
  Gift,
  PieChart,
  UserCheck,
  MessageSquare,
  TrendingDown,
  Clock,
  FileText as ContentIcon,
  Image as SliderIcon,
  Image as ImageIcon,
  Newspaper as ArticleIcon,
  Info as AboutIcon,
  ChevronRight,
  ChevronDown,
  Plus
} from "lucide-react";
import { CategoryBarChart, CategoryPieChart, GrowthLineChart } from "@/components/charts/DashboardCharts";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import { getApiBaseUrl } from "@/lib/api";
import RichTextEditor from "@/components/RichTextEditor";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { fetchCsrfToken, getCsrfToken } from "@/lib/csrfClient";

type SectionTitleProps = { children: React.ReactNode; className?: string };
const SectionTitle = ({ children, className }: SectionTitleProps) => (
  <h2 className={`text-3xl font-bold  text-black ${className ?? ''}`}>{children}</h2>
);

type MetricCardProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  subtitleClassName?: string;
  icon?: React.ElementType;
  trend?: {
    value: number;
    label: string;
  };
};

const MetricCard = ({ title, value, subtitle, subtitleClassName, icon: Icon, trend }: MetricCardProps) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-violet-50 rounded-xl">
        {Icon ? <Icon className="w-6 h-6 text-violet-600" /> : <div className="w-6 h-6" />}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${trend.value >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
          {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-sm font-medium text-gray-500 tracking-wide uppercase">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
      {subtitle && (
        <p className={`text-sm ${subtitleClassName ?? 'text-gray-500'}`}>{subtitle}</p>
      )}
    </div>
  </div>
);


function DashboardContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);
  const [editingBanner, setEditingBanner] = useState<{ id: string;[key: string]: any } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<{ id: string;[key: string]: any } | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    text: '',
    isActive: true,
    priority: 0
  });
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Hardcoded data for charts
  const hardcodedStats = {
    overview: {
      totalProducts: 156,
      totalQuoteRequests: 89,
      totalCollections: 12,
      totalVisitors: 2456
    },
    growth: {
      quoteRequests: {
        current: 89,
        previous: 67,
        percentage: 32.8
      }
    },
    categories: [
      { name: 'Rings', count: 45 },
      { name: 'Necklaces', count: 38 },
      { name: 'Earrings', count: 32 },
      { name: 'Bracelets', count: 28 },
      { name: 'Pendants', count: 13 },
      { name: 'Mangalsutras', count: 18 },
      { name: 'Bangles', count: 22 }
    ],
    recentQuoteRequests: [
      { name: 'Sarah Johnson', createdAt: '2024-01-14T10:30:00Z', status: 'New' },
      { name: 'Michael Chen', createdAt: '2024-01-14T09:15:00Z', status: 'Contacted' },
      { name: 'Emma Williams', createdAt: '2024-01-13T16:45:00Z', status: 'New' },
      { name: 'James Anderson', createdAt: '2024-01-13T14:20:00Z', status: 'Pending' },
      { name: 'Olivia Davis', createdAt: '2024-01-12T11:30:00Z', status: 'New' },
      { name: 'Robert Miller', createdAt: '2024-01-12T08:45:00Z', status: 'Contacted' },
      { name: 'Sophie Taylor', createdAt: '2024-01-11T15:20:00Z', status: 'New' }
    ]
  };
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Hardcoded appointments data
  const hardcodedAppointments = [
    {
      id: '1',
      name: 'Amanda Foster',
      email: 'amanda.f@email.com',
      preferredDate: '2024-01-15T14:00:00Z',
      preferredTime: '2:00 PM',
      status: 'confirmed'
    },
    {
      id: '2',
      name: 'David Martinez',
      email: 'david.m@email.com',
      preferredDate: '2024-01-15T16:30:00Z',
      preferredTime: '4:30 PM',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Lisa Thompson',
      email: 'lisa.t@email.com',
      preferredDate: '2024-01-16T10:00:00Z',
      preferredTime: '10:00 AM',
      status: 'confirmed'
    },
    {
      id: '4',
      name: 'Kevin Wilson',
      email: 'kevin.w@email.com',
      preferredDate: '2024-01-16T13:30:00Z',
      preferredTime: '1:30 PM',
      status: 'pending'
    },
    {
      id: '5',
      name: 'Rachel Green',
      email: 'rachel.g@email.com',
      preferredDate: '2024-01-17T11:00:00Z',
      preferredTime: '11:00 AM',
      status: 'confirmed'
    }
  ];
  const searchParams = useSearchParams();

  // Read tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch banners when top-banner tab is active
  useEffect(() => {
    if (activeTab === 'top-banner') {
      fetchBanners();
    }
  }, [activeTab]);

  // Fetch dashboard stats when dashboard tab is active
  useEffect(() => {
    if (activeTab === 'dashboard') {
      // Use hardcoded data instead of fetching
      setDashboardStats(hardcodedStats);
      setAppointments(hardcodedAppointments);
    }
  }, [activeTab]);

  // Function to fetch dashboard stats
  const fetchDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${base}/api/dashboard/stats`, {
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.data);
      } else if (response.status === 401) {
        console.error('Authentication failed. Session may be expired or invalid.');
        toast.error('Session expired. Please log in again.');
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      } else {
        console.error('Failed to fetch dashboard stats, status:', response.status);
        toast.error(`Failed to fetch dashboard stats: ${response.status === 403 ? 'Access denied' : 'Server error'}`);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${base}/api/appointments`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data.data) ? data.data : [];
        setAppointments(list);
      } else {
        toast.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Network error while loading appointments');
    } finally {
      setIsLoadingAppointments(false);
    }
  };



  // Function to fetch banners
  const fetchBanners = async () => {
    setIsLoadingBanners(true);
    try {
      const apiUrl = `${getApiBaseUrl()}/banners`;
      console.log('Fetching banners from:', apiUrl);
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setBanners(data.data || []);
      } else {
        console.error('Failed to fetch banners, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error: unknown) {
      console.error('Error fetching banners:', error);
      const err = error as { message?: string };
      console.error('Error details:', err?.message);
    } finally {
      setIsLoadingBanners(false);
    }
  };

  // Helper function to strip HTML and get text content
  const stripHtml = (html: string): string => {
    if (!html) return '';
    // Create a temporary element to extract text content
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
  };

  // Helper function to check if content is empty after stripping HTML
  const stripHtmlAndCheckEmpty = (html: string): boolean => {
    return stripHtml(html).length === 0;
  };

  // Helper function to validate title length (1-100 characters)
  // We strip HTML before sending, so validate the plain text length
  const validateTitle = (html: string): string | null => {
    const text = stripHtml(html);
    if (text.length === 0) {
      return 'Banner Title is required';
    }
    if (text.length > 100) {
      return 'Title must be between 1 and 100 characters';
    }
    return null;
  };

  // Helper function to validate text length (1-200 characters)
  // We strip HTML before sending, so validate the plain text length
  const validateText = (html: string): string | null => {
    const text = stripHtml(html);
    if (text.length === 0) {
      return 'Banner text is required';
    }
    if (text.length > 200) {
      return 'Banner text must be between 1 and 200 characters';
    }
    return null;
  };

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setBannerForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form when modal opens
  const openModal = () => {
    const nextPriority = banners && banners.length > 0
      ? Math.max(...banners.map((b: any) => (typeof b?.priority === 'number' ? b.priority : 0))) + 1
      : 0;
    setBannerForm({
      title: '',
      text: '',
      isActive: true,
      priority: nextPriority
    });
    setEditingBanner(null);
    setIsBannerModalOpen(true);
  };

  // Open edit modal with banner data
  const openEditModal = (banner: any) => {
    setBannerForm({
      title: banner.title || '',
      text: banner.text || banner.title || '',
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      priority: banner.priority || 0
    });
    setEditingBanner(banner);
    setIsBannerModalOpen(true);
  };

  // Handle edit banner
  const handleEditBanner = async () => {
    if (!editingBanner) return;

    // Validate form before submission
    const titleError = validateTitle(bannerForm.title);
    if (titleError) {
      toast.error(titleError);
      return;
    }
    const textError = validateText(bannerForm.text);
    if (textError) {
      toast.error(textError);
      return;
    }

    try {
      // Strip HTML from title and text before sending to backend
      // This ensures validation works correctly and we store plain text
      const bannerDataToSend = {
        ...bannerForm,
        title: stripHtml(bannerForm.title),
        text: stripHtml(bannerForm.text)
      };

      await fetchCsrfToken();
      const csrfToken = getCsrfToken();
      const bearer = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
      const response = await fetch(`${getApiBaseUrl()}/banners/${editingBanner.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
          ...(bearer ? { 'Authorization': `Bearer ${bearer}` } : {})
        },
        body: JSON.stringify(bannerDataToSend),
      });

      if (response.ok) {
        toast.success('Banner updated successfully!');
        setIsBannerModalOpen(false);
        setEditingBanner(null);
        fetchBanners(); // Refresh the list
      } else if (response.status === 401) {
        const responseText = await response.text();
        let errorData: any = {};
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || 'Unauthorized' };
        }
        console.error('Authentication failed while updating banner:', { status: response.status, errorData, responseText });
        const msg = typeof errorData.message === 'string' ? errorData.message : 'Session expired. Please log in again.';
        toast.error(msg);
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      } else {
        const contentType = response.headers.get('content-type') || '';
        let errorMessage = 'Failed to update banner';
        if (contentType.includes('application/json')) {
          try {
            const errorJson = await response.json();
            if (errorJson.errors && Array.isArray(errorJson.errors) && errorJson.errors.length > 0) {
              errorMessage = errorJson.errors.map((err: any) => err.msg || err.message).join(', ');
            } else if (typeof errorJson.message === 'string') {
              errorMessage = errorJson.message;
            } else if (typeof errorJson.error === 'string') {
              errorMessage = errorJson.error;
            }
          } catch {
            const errorText = await response.text();
            errorMessage = errorText || `${response.status} ${response.statusText}`;
          }
        } else {
          const errorText = await response.text();
          errorMessage = errorText || `${response.status} ${response.statusText}`;
        }
        console.error('Failed to update banner:', { status: response.status, statusText: response.statusText });
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Error updating banner');
    }
  };

  // Handle delete confirmation
  const openDeleteConfirm = (banner: any) => {
    setBannerToDelete(banner);
    setShowDeleteConfirm(true);
  };

  // Handle delete banner
  const handleDeleteBanner = async () => {
    if (!bannerToDelete) return;

    try {
      console.log('Deleting banner:', { id: bannerToDelete.id });

      await fetchCsrfToken();
      const csrfToken = getCsrfToken();
      const bearer = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
      const response = await fetch(`${getApiBaseUrl()}/banners/${bannerToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
          ...(bearer ? { 'Authorization': `Bearer ${bearer}` } : {})
        }
      });

      console.log('Delete response status:', response.status);

      if (response.ok) {
        toast.success('Banner deleted successfully!');
        setShowDeleteConfirm(false);
        setBannerToDelete(null);
        fetchBanners(); // Refresh the list
      } else if (response.status === 401) {
        const responseText = await response.text();
        let errorData: any = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: responseText || 'Invalid token' };
        }
        console.error('Authentication failed:', { status: response.status, errorData, responseText });
        toast.error('Session expired. Please log in again.');
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      } else {
        const responseText = await response.text();
        let errorMessage = 'Failed to delete banner';
        try {
          const errorJson = JSON.parse(responseText);
          if (errorJson.errors && Array.isArray(errorJson.errors) && errorJson.errors.length > 0) {
            errorMessage = errorJson.errors.map((err: any) => err.msg || err.message).join(', ');
          } else if (typeof errorJson.message === 'string') {
            errorMessage = errorJson.message;
          } else if (typeof errorJson.error === 'string') {
            errorMessage = errorJson.error;
          } else if (responseText) {
            errorMessage = responseText;
          } else {
            errorMessage = `Failed to delete banner: ${response.status} ${response.statusText}`;
          }
        } catch (e) {
          errorMessage = responseText || `Failed to delete banner: ${response.status} ${response.statusText}`;
        }
        console.error('Failed to delete banner:', {
          status: response.status,
          statusText: response.statusText,
          responseText,
          url: `${getApiBaseUrl()}/banners/${bannerToDelete.id}`,
          bannerId: bannerToDelete.id
        });
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error or unexpected error occurred';
      console.error('Error deleting banner:', {
        error,
        message: errorMessage,
        url: `${getApiBaseUrl()}/banners/${bannerToDelete?.id}`,
        bannerId: bannerToDelete?.id
      });
      toast.error(`Failed to delete banner: ${errorMessage}`);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <SectionTitle className="pt-4 italic font-bold">Dashboard Overview</SectionTitle>
            {false ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading dashboard data...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-12 col-span-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                      title="Total Products"
                      value={dashboardStats?.overview?.totalProducts || 0}
                      subtitle="Active products"
                      icon={Package}
                    />
                    <MetricCard
                      title="Quote Requests"
                      value={dashboardStats?.overview?.totalQuoteRequests || 0}
                      trend={{
                        value: dashboardStats?.growth?.quoteRequests?.percentage ?? 0,
                        label: 'from last month'
                      }}
                      subtitle="New inquiries"
                      icon={FileText}
                    />
                    <MetricCard
                      title="Collections"
                      value={dashboardStats?.overview?.totalCollections || 0}
                      subtitle="Product collections"
                      icon={Layers}
                    />
                    <MetricCard
                      title="Total Visitors"
                      value={dashboardStats?.overview?.totalVisitors || 0}
                      subtitle="Website visitors"
                      icon={Users}
                    />
                  </div>
                </div >

                {/* Growth Chart - Spans 8 columns */}
                < div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 xl:col-span-8 col-span-12 hover:shadow-md transition-shadow duration-300" >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Growth Analysis</h3>
                      <p className="text-sm text-gray-500 mt-1">Monthly quote request trends</p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-end gap-8 mb-6">
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">Total Requests</span>
                      <span className="text-2xl font-bold text-gray-900">{dashboardStats?.growth?.quoteRequests?.current || 0}</span>
                      <span className={`ml-2 text-sm font-medium ${(dashboardStats?.growth?.quoteRequests?.percentage ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(dashboardStats?.growth?.quoteRequests?.percentage ?? 0) >= 0 ? '+' : ''}{dashboardStats?.growth?.quoteRequests?.percentage ?? 0}%
                      </span>
                    </div>
                  </div>
                  <GrowthLineChart data={{ previous: dashboardStats?.growth?.quoteRequests?.previous || 0, current: dashboardStats?.growth?.quoteRequests?.current || 0 }} label="Quote Requests" />
                </div >

                {/* Categories Pie Chart - Spans 4 columns */}
                < div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 xl:col-span-4 col-span-12 hover:shadow-md transition-shadow duration-300" >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Distribution</h3>
                      <p className="text-sm text-gray-500 mt-1">Products by category</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <PieChart className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="h-[250px] w-full">
                    <CategoryPieChart data={(dashboardStats?.categories || []).map((c: any) => ({ name: c.name, count: c.count }))} />
                  </div>
                </div >

                {/* Top Categories Bar Chart - Spans 6 columns */}
                < div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 xl:col-span-6 col-span-12 hover:shadow-md transition-shadow duration-300" >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Top Performing</h3>
                      <p className="text-sm text-gray-500 mt-1">Most popular categories</p>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                  <CategoryBarChart data={(dashboardStats?.categories || []).slice(0, 5).map((c: any) => ({ name: c.name, count: c.count }))} />
                </div >

                {/* Recent Activity - Spans 6 columns */}
                < div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 xl:col-span-6 col-span-12 hover:shadow-md transition-shadow duration-300" >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                      <p className="text-sm text-gray-500 mt-1">Latest quote requests</p>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {dashboardStats?.recentQuoteRequests && dashboardStats.recentQuoteRequests.length > 0 ? (
                      dashboardStats.recentQuoteRequests.slice(0, 5).map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm text-sm font-bold text-gray-700">
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                              <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
                            }`}>
                            {item.status || 'New'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">No recent activity</div>
                    )}
                  </div>
                </div >

                {/* Appointments - Full Width */}
                < div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 xl:col-span-12 col-span-12 hover:shadow-md transition-shadow duration-300" >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Upcoming Appointments</h3>
                      <p className="text-sm text-gray-500 mt-1">Scheduled customer visits</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  {
                    false ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {appointments && appointments.length > 0 ? (
                          appointments.slice(0, 6).map((a: any) => (
                            <div key={a.id} className="p-4 border border-gray-100 rounded-xl hover:border-green-200 hover:bg-green-50/30 transition-all duration-200">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-900">{a.name}</span>
                                  <span className="text-xs text-gray-500">{a.email}</span>
                                </div>
                                <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-xs font-medium text-gray-600 lowercase">{a.status}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(a.preferredDate).toLocaleDateString()} at {a.preferredTime}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                            No upcoming appointments found
                          </div>
                        )}
                      </div>
                    )
                  }
                </div >
              </div >
            )
            }
          </div >
        );
      case "quick-insights":
        return (
          <div className="space-y-6">
            <SectionTitle>Quick Insights</SectionTitle>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <p className="text-gray-500">Detailed insights and analytics will be displayed here...</p>
              </div>
            </div>
          </div>
        );
      case "orders":
        return (
          <div className="space-y-6">
            <SectionTitle>Orders Management</SectionTitle>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <p className="text-gray-500">Order management content will go here...</p>
              </div>
            </div>
          </div>
        );
      case "products":
        return (
          <div className="space-y-6">
            <SectionTitle>Products Management</SectionTitle>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <p className="text-gray-500">Product management content will go here...</p>
              </div>
            </div>
          </div>
        );
      case "customers":
        return (
          <div className="space-y-6">
            <SectionTitle>Customer Management</SectionTitle>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <p className="text-gray-500">Customer management content will go here...</p>
              </div>
            </div>
          </div>
        );
      case "sales":
        return (
          <div className="space-y-6">
            <SectionTitle>Sales Management</SectionTitle>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <p className="text-gray-500">Sales management content will go here...</p>
              </div>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-6">
            <SectionTitle>Analytics & Reports</SectionTitle>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <p className="text-gray-500">Analytics and reports content will go here...</p>
              </div>
            </div>
          </div>
        );
      case "content-management":
        return (
          <div className="space-y-6">
            <SectionTitle>Content Management</SectionTitle>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <p className="text-gray-500">Content management dashboard will be displayed here...</p>
              </div>
            </div>
          </div>
        );
      case "top-banner":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <SectionTitle>Top Banner Management</SectionTitle>
              <button
                onClick={openModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Banner
              </button>
            </div>

            {isLoadingBanners ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading banners...</p>
                  </div>
                </div>
              </div>
            ) : banners.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No banners created yet</h3>
                    <p className="text-gray-500 mb-4">Create your first promotional banner to get started.</p>
                    <button
                      onClick={openModal}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Create Banner
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner: any) => (
                  <div key={banner.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="p-6">
                      {/* Banner Content */}
                      <div className="mb-4">
                        <div
                          className="text-lg font-semibold text-gray-900 mb-3 line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: banner.title }}
                        />
                      </div>

                      {/* Status and Date */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(banner.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => toggleBannerStatus(banner.id, banner.isActive)}
                          className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-1 ${banner.isActive
                            ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                            }`}
                        >
                          {banner.isActive ? (
                            <>
                              <Clock className="w-3 h-3" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Star className="w-3 h-3" />
                              Activate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(banner)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <Package className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(banner)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "sliders":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Sliders Management</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <p className="text-gray-500">Manage homepage sliders and banners here...</p>
              </div>
            </div>
          </div>
        );
      case "articles":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Articles Management</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <p className="text-gray-500">Create and manage blog articles and news posts here...</p>
              </div>
            </div>
          </div>
        );
      case "about":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">About Page Management</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <p className="text-gray-500">Edit and manage the about page content here...</p>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <p className="text-gray-500">Settings content will go here...</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <p className="text-gray-500">Content for {activeTab} will be displayed here...</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <DashboardLayout title="Dashboard" showBreadcrumb={true}>
        {/* Removed animation wrapper */}
        <div>
          {renderContent()}
        </div>

        {/* Banner Creation Modal */}
        {/* Removed animation wrapper */}
        {isBannerModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsBannerModalOpen(false);
                      setEditingBanner(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Banner Title *
                      </label>
                      <RichTextEditor
                        value={bannerForm.text}
                        onChange={(value) => {
                          handleFormChange('text', value);
                          handleFormChange('title', value);
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-1">Use the rich text editor to format your banner content with custom styling</p>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-black mb-2">
                        Priority
                      </label>
                      <input
                        type="number"
                        value={bannerForm.priority || 0}
                        onChange={(e) => handleFormChange('priority', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        style={{ color: '#000000' }}
                      />
                      <p className="text-sm text-black mt-1">Higher numbers appear first</p>
                    </div>
                  </div>




                  {/* Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={bannerForm.isActive}
                      onChange={(e) => handleFormChange('isActive', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-base text-gray-700">
                      Active (visible on website)
                    </label>
                  </div>

                  {/* Preview */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 bg-white">
                      <div className="text-center">
                        <div
                          className="text-base font-medium text-gray-900"
                          dangerouslySetInnerHTML={{ __html: bannerForm.text || 'Banner content will appear here' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsBannerModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingBanner ? handleEditBanner : async () => {
                      // Validate form before submission
                      const titleError = validateTitle(bannerForm.title);
                      if (titleError) {
                        toast.error(titleError);
                        return;
                      }
                      const textError = validateText(bannerForm.text);
                      if (textError) {
                        toast.error(textError);
                        return;
                      }

                      try {
                        const apiUrl = `${getApiBaseUrl()}/banners`;
                        // Using cookie-based authentication instead of localStorage
                        // const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

                        // Strip HTML from title and text before sending to backend
                        // This ensures validation works correctly and we store plain text
                        const bannerDataToSend = {
                          ...bannerForm,
                          title: stripHtml(bannerForm.title),
                          text: stripHtml(bannerForm.text)
                        };

                        console.log('Creating banner at:', apiUrl);
                        console.log('Banner form data:', bannerDataToSend);
                        await fetchCsrfToken();
                        const csrfToken = getCsrfToken();
                        const bearer = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;

                        const response = await fetch(apiUrl, {
                          method: 'POST',
                          credentials: 'include',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
                            ...(bearer ? { 'Authorization': `Bearer ${bearer}` } : {})
                          },
                          body: JSON.stringify(bannerDataToSend)
                        });

                        if (response.ok) {
                          const result = await response.json();
                          console.log('Banner created:', result);
                          toast.success('Banner created successfully!');
                          setIsBannerModalOpen(false);
                          // Reset form
                          setBannerForm({
                            title: '',
                            text: '',
                            isActive: true,
                            priority: 0
                          });
                          // Immediately update UI without full reload
                          if (result?.data) {
                            setBanners(prev => [result.data, ...prev]);
                          } else {
                            fetchBanners();
                          }
                        } else if (response.status === 401) {
                          const errorText = await response.text();
                          let errorJson: any = {};
                          try {
                            errorJson = JSON.parse(errorText);
                          } catch (e) {
                            errorJson = { message: errorText || 'Invalid token' };
                          }

                          console.error('Authentication failed:', { status: response.status, errorJson, errorText });

                          // Using cookie-based authentication, no need to clear localStorage tokens

                          // Show error and redirect
                          const errorMsg = errorJson.message || 'Invalid token';
                          if (errorMsg.includes('Invalid token') || errorMsg.includes('expired')) {
                            toast.error('Your session has expired. Please log in again.');
                          } else {
                            toast.error(errorMsg);
                          }

                          setTimeout(() => {
                            if (typeof window !== 'undefined') {
                              window.location.href = '/';
                            }
                          }, 1500);
                        } else {
                          const errorText = await response.text();
                          console.error('Error creating banner, status:', response.status);
                          console.error('Error response text:', errorText);
                          let errorMessage = 'Failed to create banner';
                          try {
                            const errorJson = JSON.parse(errorText);
                            // Show specific validation errors if available
                            if (errorJson.errors && Array.isArray(errorJson.errors) && errorJson.errors.length > 0) {
                              const validationErrors = errorJson.errors.map((err: any) => err.msg || err.message).join(', ');
                              errorMessage = validationErrors;
                            } else {
                              errorMessage = errorJson.message || errorMessage;
                            }
                            console.error('Error creating banner:', errorJson);
                          } catch (e) {
                            console.error('Could not parse error response as JSON');
                          }
                          toast.error(errorMessage);
                        }
                      } catch (error) {
                        console.error('Error creating banner:', error);
                        toast.error('Failed to create banner');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    {editingBanner ? (
                      <>
                        <Package className="w-4 h-4" />
                        Update Banner
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Banner
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {/* Removed animation wrapper */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">Delete Banner</h2>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this banner? This action cannot be undone.
                  </p>
                  {bannerToDelete && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div
                        className="text-base text-gray-700"
                        dangerouslySetInnerHTML={{ __html: bannerToDelete.title }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteBanner}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Delete Banner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
      <Toaster position="top-right" />
    </>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}

// Toggle banner status
const toggleBannerStatus = async (bannerId: string, currentStatus: boolean) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/banners/${bannerId}/toggle`, {
      method: 'PATCH',
      credentials: 'include', // Use cookies for authentication
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      toast.success(currentStatus ? 'Banner deactivated' : 'Banner activated');
      // Refresh the list
      // fetchBanners(); // This function is not in scope here
    } else {
      toast.error('Failed to toggle banner status');
    }
  } catch (error) {
    console.error('Error toggling banner:', error);
    toast.error('Error toggling banner status');
  }
};
