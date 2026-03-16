'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  Globe,
  FileText,
  RefreshCw,
  Download,
  Eye,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  BarChart3,
  Link,
  Calendar
} from 'lucide-react';
import { getCsrfToken } from '@/lib/csrfClient';

interface SitemapEntry {
  id: string;
  url: string;
  lastModified: string;
  changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  status: 'active' | 'inactive' | 'error';
  pageType: 'product' | 'category' | 'page' | 'blog' | 'custom';
  title?: string;
  description?: string;
}

interface SitemapConfig {
  autoGenerate: boolean;
  includeProducts: boolean;
  includeCategories: boolean;
  includePages: boolean;
  defaultChangeFreq: string;
  defaultPriority: number;
  lastGenerated?: string;
  urlCount: number;
  excludedUrls: string[];
}

export default function SitemapManagement() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'entries' | 'config' | 'preview'>('entries');
  const [sitemapEntries, setSitemapEntries] = useState<SitemapEntry[]>([]);
  const [config, setConfig] = useState<SitemapConfig>({
    autoGenerate: true,
    includeProducts: true,
    includeCategories: true,
    includePages: true,
    defaultChangeFreq: 'weekly',
    defaultPriority: 0.8,
    urlCount: 0,
    excludedUrls: []
  });
  const [isSitemapLoading, setIsSitemapLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEntry, setEditingEntry] = useState<SitemapEntry | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const getApiUrl = (endpoint: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/api${endpoint}`;
  };

  useEffect(() => {
    fetchSitemapEntries();
    fetchSitemapConfig();
  }, []);

  const fetchSitemapEntries = async () => {
    setIsSitemapLoading(true);
    try {
      const response = await fetch(getApiUrl('/seo/sitemap'), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSitemapEntries(data.entries || []);
      }
    } catch (error) {
      toast.error('Failed to fetch sitemap entries');
    } finally {
      setIsSitemapLoading(false);
    }
  };

  const fetchSitemapConfig = async () => {
    try {
      const response = await fetch(getApiUrl('/seo/sitemap/config'), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      toast.error('Failed to fetch sitemap configuration');
    }
  };

  const generateSitemap = async () => {
    setIsGenerating(true);
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(getApiUrl('/seo/sitemap/generate'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Sitemap generated successfully!');
        fetchSitemapEntries();
        fetchSitemapConfig();
      } else {
        toast.error('Failed to generate sitemap');
      }
    } catch (error) {
      toast.error('Failed to generate sitemap');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveEntry = async (entry: SitemapEntry) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(getApiUrl('/seo/sitemap/entry'), {
        method: editingEntry?.id ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        },
        body: JSON.stringify(entry)
      });

      if (response.ok) {
        toast.success(`Sitemap entry ${editingEntry?.id ? 'updated' : 'created'} successfully!`);
        fetchSitemapEntries();
        setEditingEntry(null);
        setShowAddForm(false);
        setNewUrl('');
      } else {
        toast.error('Failed to save sitemap entry');
      }
    } catch (error) {
      toast.error('Failed to save sitemap entry');
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(getApiUrl(`/seo/sitemap/entry/${id}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        }
      });

      if (response.ok) {
        toast.success('Sitemap entry deleted successfully!');
        fetchSitemapEntries();
      } else {
        toast.error('Failed to delete sitemap entry');
      }
    } catch (error) {
      toast.error('Failed to delete sitemap entry');
    }
  };

  const updateConfig = async (newConfig: SitemapConfig) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(getApiUrl('/seo/sitemap/config'), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        },
        body: JSON.stringify(newConfig)
      });

      if (response.ok) {
        toast.success('Sitemap configuration updated successfully!');
        setConfig(newConfig);
      } else {
        toast.error('Failed to update configuration');
      }
    } catch (error) {
      toast.error('Failed to update configuration');
    }
  };

  const fetchSitemapPreview = async () => {
    try {
      const response = await fetch(getApiUrl('/seo/sitemap/preview'), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewContent(data.content);
      }
    } catch (error) {
      toast.error('Failed to fetch sitemap preview');
    }
  };

  const filteredEntries = sitemapEntries.filter(entry =>
    entry.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.title && entry.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isAuthenticated && !isLoading) {
    return null; // Let the top-level ProtectedRoute handle redirection
  }

  return (
    <ProtectedRoute>
      <DashboardLayout showBreadcrumb={true}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Sitemap Management</h1>
                <p className="text-gray-600">Manage your website sitemap for better SEO</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={generateSitemap}
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generating...' : 'Generate Sitemap'}
                </button>
                <button
                  onClick={() => {
                    fetchSitemapPreview();
                    setActiveTab('preview');
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  Preview
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total URLs</p>
                    <p className="text-2xl font-bold text-black">{sitemapEntries.length}</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active URLs</p>
                    <p className="text-2xl font-bold text-black">
                      {sitemapEntries.filter(e => e.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Auto Generation</p>
                    <p className="text-2xl font-bold text-black">
                      {config.autoGenerate ? 'ON' : 'OFF'}
                    </p>
                  </div>
                  <Settings className="w-10 h-10 text-purple-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Last Generated</p>
                    <p className="text-2xl font-bold text-black">
                      {config.lastGenerated ? new Date(config.lastGenerated).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('entries')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'entries'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Sitemap Entries
                </button>
                <button
                  onClick={() => setActiveTab('config')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'config'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Configuration
                </button>
                <button
                  onClick={() => {
                    setActiveTab('preview');
                    fetchSitemapPreview();
                  }}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'preview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'entries' && (
            <div className="bg-white rounded-xl border border-gray-200">
              {/* Search and Add */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search sitemap entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Entry
                  </button>
                </div>
              </div>

              {/* Add Entry Form */}
              {showAddForm && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Add New Sitemap Entry</h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewUrl('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="URL"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      onChange={(e) => {
                        if (newUrl) {
                          saveEntry({
                            id: '',
                            url: newUrl,
                            lastModified: new Date().toISOString(),
                            changeFreq: e.target.value as any,
                            priority: 0.8,
                            status: 'active',
                            pageType: 'custom'
                          });
                        }
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Change Frequency</option>
                      <option value="always">Always</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Entries List */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Freq</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 max-w-xs truncate">{entry.url}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.pageType === 'product' ? 'bg-purple-100 text-purple-800' :
                            entry.pageType === 'category' ? 'bg-blue-100 text-blue-800' :
                              entry.pageType === 'page' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {entry.pageType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{entry.changeFreq}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{entry.priority.toFixed(1)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.status === 'active' ? 'bg-green-100 text-green-800' :
                            entry.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingEntry(entry)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-6">Sitemap Configuration</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto Generate Sitemap
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoGenerate}
                        onChange={(e) => updateConfig({ ...config, autoGenerate: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Include Products
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.includeProducts}
                        onChange={(e) => updateConfig({ ...config, includeProducts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Include Categories
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.includeCategories}
                        onChange={(e) => updateConfig({ ...config, includeCategories: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Include Pages
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.includePages}
                        onChange={(e) => updateConfig({ ...config, includePages: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Change Frequency
                    </label>
                    <select
                      value={config.defaultChangeFreq}
                      onChange={(e) => updateConfig({ ...config, defaultChangeFreq: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="always">Always</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Priority
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.defaultPriority}
                      onChange={(e) => updateConfig({ ...config, defaultPriority: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Sitemap Preview</h3>
                <button
                  onClick={() => {
                    const blob = new Blob([previewContent], { type: 'application/xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'sitemap.xml';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download XML
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {previewContent || 'Click "Preview" to see the sitemap content'}
                </pre>
              </div>
            </div>
          )}

          {/* Edit Entry Modal */}
          {editingEntry && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Edit Sitemap Entry</h3>
                  <button
                    onClick={() => setEditingEntry(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                    <input
                      type="text"
                      value={editingEntry.url}
                      onChange={(e) => setEditingEntry({ ...editingEntry, url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Change Frequency</label>
                    <select
                      value={editingEntry.changeFreq}
                      onChange={(e) => setEditingEntry({ ...editingEntry, changeFreq: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="always">Always</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={editingEntry.priority}
                      onChange={(e) => setEditingEntry({ ...editingEntry, priority: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => saveEntry(editingEntry)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingEntry(null)}
                      className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}