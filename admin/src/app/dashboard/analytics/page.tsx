'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet,
  Chrome,
  MapPin,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import { apiService } from '@/lib/apiClient';

interface AnalyticsData {
  overview: {
    totalVisitors: number;
    uniqueVisitors: number;
    totalPageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
    conversions: number;
    conversionRate: number;
  };
  geography: {
    topCountries: Array<{ country: string; visitors: number }>;
    topRegions: Array<{ region: string; visitors: number }>;
  };
  technology: {
    deviceTypes: Array<{ deviceType: string; count: number }>;
    browsers: Array<{ browser: string; count: number }>;
  };
  content: {
    topPages: Array<{ pageUrl: string; views: number }>;
    topReferrers: Array<{ referrer: string; count: number }>;
  };
  charts: {
    dailyVisitors: Array<{ date: string; visitors: number; new_visitors: number }>;
  };
}

interface RealTimeData {
  activeVisitors: number;
  currentPageViews: number;
  topPagesNow: Array<{ pageUrl: string; views: number }>;
  recentCountries: Array<{ country: string; visitors: number }>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [realTimeLoading, setRealTimeLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [error, setError] = useState<string | null>(null);

  // Hardcoded analytics data
  const hardcodedAnalyticsData: AnalyticsData = {
    overview: {
      totalVisitors: 45678,
      uniqueVisitors: 32145,
      totalPageViews: 123456,
      bounceRate: 34.5,
      avgSessionDuration: 245, // seconds
      conversions: 892,
      conversionRate: 2.8
    },
    geography: {
      topCountries: [
        { country: 'United States', visitors: 15678 },
        { country: 'India', visitors: 8934 },
        { country: 'United Kingdom', visitors: 5623 },
        { country: 'Canada', visitors: 3456 },
        { country: 'Australia', visitors: 2345 },
        { country: 'Germany', visitors: 1876 },
        { country: 'France', visitors: 1543 },
        { country: 'Japan', visitors: 1234 }
      ],
      topRegions: [
        { region: 'California', visitors: 4567 },
        { region: 'New York', visitors: 3890 },
        { region: 'Texas', visitors: 3234 },
        { region: 'Florida', visitors: 2876 },
        { region: 'Illinois', visitors: 1987 },
        { region: 'Pennsylvania', visitors: 1654 },
        { region: 'Ohio', visitors: 1432 },
        { region: 'Georgia', visitors: 1234 }
      ]
    },
    technology: {
      deviceTypes: [
        { deviceType: 'Desktop', count: 23456 },
        { deviceType: 'Mobile', count: 18765 },
        { deviceType: 'Tablet', count: 3457 }
      ],
      browsers: [
        { browser: 'Chrome', count: 25678 },
        { browser: 'Safari', count: 9876 },
        { browser: 'Firefox', count: 5432 },
        { browser: 'Edge', count: 3210 },
        { browser: 'Opera', count: 1482 },
        { browser: 'Other', count: 876 }
      ]
    },
    content: {
      topPages: [
        { pageUrl: '/dashboard', views: 8765 },
        { pageUrl: '/products', views: 6543 },
        { pageUrl: '/categories', views: 5432 },
        { pageUrl: '/about', views: 4321 },
        { pageUrl: '/contact', views: 3210 },
        { pageUrl: '/services', views: 2876 },
        { pageUrl: '/blog', views: 1987 },
        { pageUrl: '/faq', views: 1543 }
      ],
      topReferrers: [
        { referrer: 'google.com', count: 12345 },
        { referrer: 'facebook.com', count: 5432 },
        { referrer: 'instagram.com', count: 3210 },
        { referrer: 'twitter.com', count: 1987 },
        { referrer: 'linkedin.com', count: 1543 },
        { referrer: 'direct', count: 9876 },
        { referrer: 'youtube.com', count: 876 },
        { referrer: 'other', count: 654 }
      ]
    },
    charts: {
      dailyVisitors: [
        { date: '2024-01-01', visitors: 1234, new_visitors: 567 },
        { date: '2024-01-02', visitors: 1456, new_visitors: 678 },
        { date: '2024-01-03', visitors: 1678, new_visitors: 789 },
        { date: '2024-01-04', visitors: 1890, new_visitors: 890 },
        { date: '2024-01-05', visitors: 2101, new_visitors: 901 },
        { date: '2024-01-06', visitors: 2234, new_visitors: 912 },
        { date: '2024-01-07', visitors: 2345, new_visitors: 923 }
      ]
    }
  };

  // Hardcoded real-time data
  const hardcodedRealTimeData: RealTimeData = {
    activeVisitors: 127,
    currentPageViews: 342,
    topPagesNow: [
      { pageUrl: '/dashboard', views: 45 },
      { pageUrl: '/products', views: 32 },
      { pageUrl: '/categories', views: 28 },
      { pageUrl: '/about', views: 15 },
      { pageUrl: '/contact', views: 7 }
    ],
    recentCountries: [
      { country: 'United States', visitors: 45 },
      { country: 'India', visitors: 23 },
      { country: 'United Kingdom', visitors: 18 },
      { country: 'Canada', visitors: 12 },
      { country: 'Australia', visitors: 8 }
    ]
  };

  // Note: Using hardcoded data instead of API calls

  // Initial load - use hardcoded data
  useEffect(() => {
    // Set hardcoded data immediately
    setAnalyticsData(hardcodedAnalyticsData);
    setRealTimeData(hardcodedRealTimeData);
    setLoading(false);
  }, []);

  // Simulate real-time data updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Update real-time data with random variations
      setRealTimeData(prev => ({
        ...prev!,
        activeVisitors: prev!.activeVisitors + Math.floor(Math.random() * 11) - 5, // Random change between -5 and +5
        currentPageViews: prev!.currentPageViews + Math.floor(Math.random() * 21) - 10 // Random change between -10 and +10
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // For now, just update the period without fetching
    toast.success(`Analytics period changed to ${period}`);
  };

  // Get device icon
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  // Get browser icon
  const getBrowserIcon = (browser: string) => {
    switch (browser?.toLowerCase()) {
      case 'chrome':
        return <Chrome className="w-4 h-4" />;
      case 'firefox':
        return <Globe className="w-4 h-4" />;
      case 'safari':
        return <Globe className="w-4 h-4" />;
      case 'edge':
        return <Globe className="w-4 h-4" />;
      case 'opera':
        return <Globe className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout showBreadcrumb={true}>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading analytics...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout showBreadcrumb={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Analytics Dashboard</h1>
            <p className="text-gray-600">Website performance and visitor insights</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            {/* Real-time indicator */}
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Real-time Stats */}
        {realTimeData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Active Visitors</p>
                  <p className="text-3xl font-bold">{realTimeData.activeVisitors}</p>
                  <p className="text-blue-100 text-sm">Last hour</p>
                </div>
                <Activity className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Page Views</p>
                  <p className="text-3xl font-bold">{realTimeData.currentPageViews}</p>
                  <p className="text-green-100 text-sm">Last hour</p>
                </div>
                <Eye className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Top Page</p>
                  <p className="text-lg font-bold truncate">
                    {realTimeData.topPagesNow[0]?.pageUrl || 'N/A'}
                  </p>
                  <p className="text-purple-100 text-sm">
                    {realTimeData.topPagesNow[0]?.views || 0} views
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        {analyticsData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Visitors */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.totalVisitors.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              {/* Unique Visitors */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.uniqueVisitors.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </div>

              {/* Page Views */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Page Views</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.totalPageViews.toLocaleString()}</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              {/* Bounce Rate */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.bounceRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Session Duration</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.floor(analyticsData.overview.avgSessionDuration / 60)}m {analyticsData.overview.avgSessionDuration % 60}s
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-indigo-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversions</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.conversions}</p>
                  </div>
                  <MousePointer className="w-8 h-8 text-pink-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.conversionRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Geography Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Countries */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Top Countries
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analyticsData.geography.topCountries.slice(0, 5).map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className="text-sm font-medium text-gray-900">{country.country}</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{country.visitors}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Regions */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Top Regions
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analyticsData.geography.topRegions.slice(0, 5).map((region, index) => (
                      <div key={region.region} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className="text-sm font-medium text-gray-900">{region.region}</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">{region.visitors}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Technology Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Types */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Device Types
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analyticsData.technology.deviceTypes.map((device) => (
                      <div key={device.deviceType} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getDeviceIcon(device.deviceType)}
                          <span className="text-sm font-medium text-gray-900 capitalize">{device.deviceType}</span>
                        </div>
                        <span className="text-sm font-bold text-purple-600">{device.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Browsers */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Browsers
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analyticsData.technology.browsers.slice(0, 5).map((browser) => (
                      <div key={browser.browser} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getBrowserIcon(browser.browser)}
                          <span className="text-sm font-medium text-gray-900">{browser.browser}</span>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">{browser.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Top Pages
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analyticsData.content.topPages.slice(0, 5).map((page, index) => (
                      <div key={page.pageUrl} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{page.pageUrl}</span>
                        </div>
                        <span className="text-sm font-bold text-orange-600">{page.views}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Referrers */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Top Referrers
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analyticsData.content.topReferrers.slice(0, 5).map((referrer, index) => (
                      <div key={referrer.referrer} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{referrer.referrer}</span>
                        </div>
                        <span className="text-sm font-bold text-teal-600">{referrer.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
