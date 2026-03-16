'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Globe, 
  Shield, 
  BarChart3, 
  FileText, 
  Settings,
  ChevronRight,
  Search,
  Eye,
  RefreshCw,
  Code
} from 'lucide-react';
import Link from 'next/link';

export default function SEOManagement() {
  const { isAuthenticated, isLoading } = useAuth();

  const seoTools = [
    {
      title: 'Sitemap Management',
      description: 'Manage your website sitemap to help search engines discover and index your pages',
      icon: Globe,
      href: '/dashboard/seo/sitemap',
      color: 'bg-blue-600',
      features: ['Auto-generate sitemaps', 'Add custom URLs', 'Configure priorities', 'Preview XML']
    },
    {
      title: 'Robots.txt Management',
      description: 'Control how search engines crawl and index your website',
      icon: Shield,
      href: '/dashboard/seo/robots',
      color: 'bg-green-600',
      features: ['Text editor', 'Rules manager', 'Quick templates', 'Preview results']
    },
    {
      title: 'JSON-LD Schemas',
      description: 'Create and manage structured data schemas for better search engine understanding',
      icon: Code,
      href: '/dashboard/seo/jsonld',
      color: 'bg-purple-600',
      features: ['Schema generator', 'Visual editor', 'Validation tools', 'Export options']
    }
  ];

  if (!isAuthenticated || isLoading) {
    return <ProtectedRoute />;
  }

  return (
    <ProtectedRoute>
      <DashboardLayout showBreadcrumb={true}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">SEO Management</h1>
            <p className="text-gray-600">Optimize your website for search engines</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">SEO Score</p>
                  <p className="text-2xl font-bold text-green-600">Good</p>
                  <p className="text-xs text-gray-500 mt-1">Based on latest analysis</p>
                </div>
                <BarChart3 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Indexed Pages</p>
                  <p className="text-2xl font-bold text-blue-600">247</p>
                  <p className="text-xs text-gray-500 mt-1">+12 from last month</p>
                </div>
                <Eye className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Last Sync</p>
                  <p className="text-2xl font-bold text-purple-600">Today</p>
                  <p className="text-xs text-gray-500 mt-1">Automatically updated</p>
                </div>
                <RefreshCw className="w-10 h-10 text-purple-600" />
              </div>
            </div>
          </div>

          {/* SEO Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seoTools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${tool.color}`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                
                <h3 className="text-lg font-semibold text-black mb-2 group-hover:text-blue-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {tool.description}
                </p>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 mb-2">Key Features:</p>
                  {tool.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span className="text-xs text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          {/* Best Practices Section */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              SEO Best Practices
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Sitemap Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Keep sitemap under 50,000 URLs</li>
                  <li>• Update regularly when content changes</li>
                  <li>• Include only canonical URLs</li>
                  <li>• Set appropriate priorities</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Robots.txt Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Be specific with disallow rules</li>
                  <li>• Test with Google's tester</li>
                  <li>• Include sitemap URL</li>
                  <li>• Review crawl logs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">JSON-LD Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use valid JSON syntax</li>
                  <li>• Include required properties</li>
                  <li>• Test with Rich Results Test</li>
                  <li>• Keep schemas relevant</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}