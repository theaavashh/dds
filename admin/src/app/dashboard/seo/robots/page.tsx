'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  FileText,
  Save,
  Eye,
  RefreshCw,
  Download,
  Plus,
  Trash2,
  Edit3,
  X,
  AlertTriangle,
  CheckCircle,
  Settings,
  Globe,
  Search,
  HelpCircle,
  Copy
} from 'lucide-react';
import { getCsrfToken } from '@/lib/csrfClient';

interface RobotsRule {
  id: string;
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
  isActive: boolean;
  description?: string;
}

interface RobotsConfig {
  enabled: boolean;
  autoGenerate: boolean;
  sitemapUrl: string;
  hostUrl: string;
  lastUpdated: string;
  content: string;
}

export default function RobotsManagement() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'editor' | 'rules' | 'preview'>('editor');
  const [rules, setRules] = useState<RobotsRule[]>([]);
  const [config, setConfig] = useState<RobotsConfig>({
    enabled: true,
    autoGenerate: false,
    sitemapUrl: '',
    hostUrl: '',
    lastUpdated: '',
    content: ''
  });
  const [content, setContent] = useState('');
  const [isRobotsLoading, setIsRobotsLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<RobotsRule | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const getApiUrl = (endpoint: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/api${endpoint}`;
  };

  useEffect(() => {
    fetchRobotsContent();
    fetchRobotsRules();
    fetchRobotsConfig();
  }, []);

  const fetchRobotsContent = async () => {
    setIsRobotsLoading(true);
    try {
      const response = await fetch(getApiUrl('/seo/robots'), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content || '');
        setConfig(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      toast.error('Failed to fetch robots.txt content');
    } finally {
      setIsRobotsLoading(false);
    }
  };

  const fetchRobotsRules = async () => {
    try {
      const response = await fetch(getApiUrl('/seo/robots/rules'), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setRules(data.rules || []);
      }
    } catch (error) {
      toast.error('Failed to fetch robots rules');
    }
  };

  const fetchRobotsConfig = async () => {
    try {
      const response = await fetch(getApiUrl('/seo/robots/config'), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      toast.error('Failed to fetch robots configuration');
    }
  };

  const saveRobotsContent = async () => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(getApiUrl('/seo/robots'), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        toast.success('Robots.txt saved successfully!');
        fetchRobotsConfig();
      } else {
        toast.error('Failed to save robots.txt');
      }
    } catch (error) {
      toast.error('Failed to save robots.txt');
    }
  };

  const saveRule = async (rule: RobotsRule) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(getApiUrl('/seo/robots/rule'), {
        method: editingRule?.id ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        },
        body: JSON.stringify(rule)
      });

      if (response.ok) {
        toast.success(`Robots rule ${editingRule?.id ? 'updated' : 'created'} successfully!`);
        fetchRobotsRules();
        setEditingRule(null);
        setShowAddForm(false);
      } else {
        toast.error('Failed to save robots rule');
      }
    } catch (error) {
      toast.error('Failed to save robots rule');
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(getApiUrl(`/seo/robots/rule/${id}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        }
      });

      if (response.ok) {
        toast.success('Robots rule deleted successfully!');
        fetchRobotsRules();
      } else {
        toast.error('Failed to delete robots rule');
      }
    } catch (error) {
      toast.error('Failed to delete robots rule');
    }
  };

  const updateConfig = async (newConfig: RobotsConfig) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(getApiUrl('/seo/robots/config'), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        },
        body: JSON.stringify(newConfig)
      });

      if (response.ok) {
        toast.success('Robots configuration updated successfully!');
        setConfig(newConfig);
      } else {
        toast.error('Failed to update configuration');
      }
    } catch (error) {
      toast.error('Failed to update configuration');
    }
  };

  const generateFromRules = async () => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(getApiUrl('/seo/robots/generate'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        toast.success('Robots.txt generated from rules!');
        fetchRobotsConfig();
      } else {
        toast.error('Failed to generate robots.txt');
      }
    } catch (error) {
      toast.error('Failed to generate robots.txt');
    }
  };

  const fetchPreview = async () => {
    try {
      const response = await fetch(getApiUrl('/seo/robots/preview'), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewContent(data.content);
      }
    } catch (error) {
      toast.error('Failed to fetch preview');
    }
  };

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
                <h1 className="text-3xl font-bold text-black mb-2">Robots.txt Management</h1>
                <p className="text-gray-600">Manage search engine crawling instructions</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={generateFromRules}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Generate from Rules
                </button>
                <button
                  onClick={() => {
                    fetchPreview();
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
                    <p className="text-gray-600 text-sm">Status</p>
                    <p className="text-2xl font-bold text-black">
                      {config.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <Shield className={`w-10 h-10 ${config.enabled ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Rules</p>
                    <p className="text-2xl font-bold text-black">{rules.length}</p>
                  </div>
                  <Settings className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Auto Generate</p>
                    <p className="text-2xl font-bold text-black">
                      {config.autoGenerate ? 'ON' : 'OFF'}
                    </p>
                  </div>
                  <RefreshCw className={`w-10 h-10 ${config.autoGenerate ? 'text-purple-600' : 'text-gray-400'}`} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Last Updated</p>
                    <p className="text-2xl font-bold text-black">
                      {config.lastUpdated ? new Date(config.lastUpdated).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <FileText className="w-10 h-10 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'editor'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Text Editor
                </button>
                <button
                  onClick={() => setActiveTab('rules')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'rules'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Rules Manager
                </button>
                <button
                  onClick={() => {
                    setActiveTab('preview');
                    fetchPreview();
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
          {activeTab === 'editor' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Robots.txt Content</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(content);
                        toast.success('Copied to clipboard!');
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    <button
                      onClick={saveRobotsContent}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="User-agent: *&#10;Disallow: /admin/&#10;Allow: /&#10;Sitemap: https://yoursite.com/sitemap.xml"
                  className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>Use standard robots.txt syntax</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>Line endings should be Unix-style (LF)</span>
                  </div>
                </div>
              </div>

              {/* Quick Templates */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setContent('User-agent: *\nDisallow: /admin/\nDisallow: /api/\nAllow: /\nSitemap: ' + (config.sitemapUrl || 'https://yoursite.com/sitemap.xml'))}
                    className="text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-medium mb-2">Standard Website</h4>
                    <p className="text-sm text-gray-600">Block admin and API, allow everything else</p>
                  </button>
                  <button
                    onClick={() => setContent('User-agent: *\nDisallow: /\nAllow: /public/\nSitemap: ' + (config.sitemapUrl || 'https://yoursite.com/sitemap.xml'))}
                    className="text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-medium mb-2">Private Site</h4>
                    <p className="text-sm text-gray-600">Block all crawlers except public folder</p>
                  </button>
                  <button
                    onClick={() => setContent('User-agent: *\nDisallow: \nUser-agent: Googlebot\nCrawl-delay: 1\nSitemap: ' + (config.sitemapUrl || 'https://yoursite.com/sitemap.xml'))}
                    className="text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-medium mb-2">SEO Optimized</h4>
                    <p className="text-sm text-gray-600">Allow all with crawl delay for Google</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Robots Rules</h3>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Rule
                  </button>
                </div>

                {/* Rules List */}
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-black">User-agent: {rule.userAgent}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {rule.allow.length > 0 && (
                            <div className="mb-1">
                              <span className="text-sm font-medium text-gray-700">Allow: </span>
                              <span className="text-sm text-gray-600">{rule.allow.join(', ')}</span>
                            </div>
                          )}
                          {rule.disallow.length > 0 && (
                            <div className="mb-1">
                              <span className="text-sm font-medium text-gray-700">Disallow: </span>
                              <span className="text-sm text-gray-600">{rule.disallow.join(', ')}</span>
                            </div>
                          )}
                          {rule.crawlDelay && (
                            <div className="mb-1">
                              <span className="text-sm font-medium text-gray-700">Crawl-delay: </span>
                              <span className="text-sm text-gray-600">{rule.crawlDelay} seconds</span>
                            </div>
                          )}
                          {rule.description && (
                            <div className="mt-2">
                              <span className="text-sm text-gray-500">{rule.description}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => setEditingRule(rule)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteRule(rule.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Robots.txt Preview</h3>
                <button
                  onClick={() => {
                    const blob = new Blob([previewContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'robots.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {previewContent || 'Click "Preview" to see robots.txt content'}
                </pre>
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Preview Notes</h4>
                    <p className="text-sm text-blue-800">
                      This is how search engines will see your robots.txt file. Make sure to save changes to apply them.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Rule Modal */}
          {(showAddForm || editingRule) && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {editingRule ? 'Edit Rule' : 'Add New Rule'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingRule(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Agent</label>
                    <input
                      type="text"
                      placeholder="* or Googlebot"
                      defaultValue={editingRule?.userAgent || '*'}
                      ref={(input) => {
                        if (input && editingRule) input.value = editingRule.userAgent;
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allow Paths</label>
                    <input
                      type="text"
                      placeholder="/, /products, /blog"
                      defaultValue={editingRule?.allow?.join(', ') || ''}
                      ref={(input) => {
                        if (input && editingRule) input.value = editingRule.allow.join(', ');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Disallow Paths</label>
                    <input
                      type="text"
                      placeholder="/admin, /api, /private"
                      defaultValue={editingRule?.disallow?.join(', ') || ''}
                      ref={(input) => {
                        if (input && editingRule) input.value = editingRule.disallow.join(', ');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Crawl Delay (seconds)</label>
                    <input
                      type="number"
                      placeholder="1"
                      defaultValue={editingRule?.crawlDelay || ''}
                      ref={(input) => {
                        if (input && editingRule) input.value = editingRule.crawlDelay?.toString() || '';
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      placeholder="Optional description"
                      defaultValue={editingRule?.description || ''}
                      ref={(input) => {
                        if (input && editingRule) input.value = editingRule.description || '';
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        const form = document.querySelector('form') as HTMLFormElement;
                        if (form) {
                          const formData = new FormData(form);
                          const rule: RobotsRule = {
                            id: editingRule?.id || '',
                            userAgent: (form.elements.namedItem('userAgent') as HTMLInputElement)?.value || '*',
                            allow: (form.elements.namedItem('allow') as HTMLInputElement)?.value?.split(',').map(s => s.trim()).filter(Boolean) || [],
                            disallow: (form.elements.namedItem('disallow') as HTMLInputElement)?.value?.split(',').map(s => s.trim()).filter(Boolean) || [],
                            crawlDelay: parseInt((form.elements.namedItem('crawlDelay') as HTMLInputElement)?.value) || undefined,
                            description: (form.elements.namedItem('description') as HTMLInputElement)?.value || '',
                            isActive: true
                          };
                          saveRule(rule);
                        }
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingRule ? 'Update Rule' : 'Add Rule'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingRule(null);
                      }}
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