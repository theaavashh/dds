'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Code, 
  FileText, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  Eye, 
  Settings,
  Globe,
  ShoppingBag,
  Store,
  Star,
  HelpCircle,
  Save,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api';

interface JSONLDSchema {
  id: string;
  type: string;
  name: string;
  content: string;
  isActive: boolean;
  pageType: string;
  createdAt: string;
  updatedAt: string;
}

const schemaTypes = [
  { value: 'WebSite', label: 'Website', icon: Globe, description: 'Main website schema' },
  { value: 'Product', label: 'Product', icon: ShoppingBag, description: 'Individual product schema' },
  { value: 'Store', label: 'Store', icon: Store, description: 'Physical store schema' },
  { value: 'LocalBusiness', label: 'Local Business', icon: Store, description: 'Local business information' },
  { value: 'Review', label: 'Review', icon: Star, description: 'Customer review schema' },
  { value: 'FAQ', label: 'FAQ', icon: HelpCircle, description: 'Frequently asked questions' },
  { value: 'Article', label: 'Article', icon: FileText, description: 'Blog post or article schema' },
  { value: 'Organization', label: 'Organization', icon: Settings, description: 'Company information schema' }
];

const pageTypes = [
  'Homepage',
  'Product Detail',
  'Category Page',
  'About Us',
  'Contact',
  'Blog',
  'Checkout',
  'All Pages'
];

const sampleSchemas = {
  WebSite: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Celebration Diamonds",
    "url": "https://celebrationdiamonds.com",
    "description": "Premium jewelry and diamond collection",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://celebrationdiamonds.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  Product: {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Diamond Ring",
    "image": ["https://example.com/ring1.jpg"],
    "description": "Beautiful diamond ring",
    "brand": {
      "@type": "Brand",
      "name": "Celebration Diamonds"
    },
    "offers": {
      "@type": "Offer",
      "price": "999.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  },
  Store: {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Celebration Diamonds",
    "image": "https://example.com/store.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Jewelry Street",
      "addressLocality": "City",
      "addressRegion": "State",
      "postalCode": "12345",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "telephone": "+1-234-567-8900"
  }
};

export default function JSONLDManagement() {
  const { isAuthenticated, isLoading } = useAuth();
  const [schemas, setSchemas] = useState<JSONLDSchema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<JSONLDSchema | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    type: 'WebSite',
    name: '',
    content: '',
    pageType: 'Homepage',
    isActive: true
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoadingSchemas, setIsLoadingSchemas] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    setIsLoadingSchemas(true);
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/seo/jsonld`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSchemas(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching schemas:', error);
    } finally {
      setIsLoadingSchemas(false);
    }
  };

  const validateJSON = (content: string) => {
    try {
      JSON.parse(content);
      setValidationError(null);
      return true;
    } catch (error) {
      setValidationError('Invalid JSON format');
      return false;
    }
  };

  const handleCreateSchema = () => {
    setIsCreating(true);
    setFormData({
      type: 'WebSite',
      name: '',
      content: JSON.stringify(sampleSchemas.WebSite, null, 2),
      pageType: 'Homepage',
      isActive: true
    });
    setSelectedSchema(null);
    setIsEditing(false);
  };

  const handleEditSchema = (schema: JSONLDSchema) => {
    setSelectedSchema(schema);
    setFormData({
      type: schema.type,
      name: schema.name,
      content: schema.content,
      pageType: schema.pageType,
      isActive: schema.isActive
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSaveSchema = async () => {
    if (!validateJSON(formData.content)) {
      return;
    }

    try {
      const API_BASE_URL = getApiBaseUrl();
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `${API_BASE_URL}/seo/jsonld/${selectedSchema?.id}` : `${API_BASE_URL}/seo/jsonld`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchSchemas();
        setIsEditing(false);
        setIsCreating(false);
        setSelectedSchema(null);
        setFormData({
          type: 'WebSite',
          name: '',
          content: '',
          pageType: 'Homepage',
          isActive: true
        });
      }
    } catch (error) {
      console.error('Error saving schema:', error);
    }
  };

  const handleDeleteSchema = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schema?')) return;

    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/seo/jsonld/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchSchemas();
        if (selectedSchema?.id === id) {
          setSelectedSchema(null);
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Error deleting schema:', error);
    }
  };

  const handleCopyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleDownloadSchema = (schema: JSONLDSchema) => {
    const blob = new Blob([schema.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name.toLowerCase().replace(/\s+/g, '-')}-schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = (type: string) => {
    const sample = sampleSchemas[type as keyof typeof sampleSchemas];
    if (sample) {
      setFormData({
        ...formData,
        content: JSON.stringify(sample, null, 2)
      });
      setValidationError(null);
    }
  };

  if (!isAuthenticated || isLoading) {
    return <ProtectedRoute />;
  }

  return (
    <ProtectedRoute>
      <DashboardLayout showBreadcrumb={true}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">JSON-LD Schema Management</h1>
            <p className="text-gray-600">Manage structured data for better search engine understanding</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Schema List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-black">Schemas</h3>
                  <button
                    onClick={handleCreateSchema}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> New
                  </button>
                </div>

                {isLoadingSchemas ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {schemas.map((schema) => {
                      const SchemaType = schemaTypes.find(t => t.value === schema.type)?.icon || Code;
                      return (
                        <div
                          key={schema.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedSchema?.id === schema.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleEditSchema(schema)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <SchemaType className="w-4 h-4 text-gray-600" />
                              <div>
                                <p className="font-medium text-black text-sm">{schema.name}</p>
                                <p className="text-xs text-gray-500">{schema.type} • {schema.pageType}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyToClipboard(schema.content, schema.id);
                                }}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {copiedId === schema.id ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-gray-600" />
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSchema(schema.id);
                                }}
                                className="p-1 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              schema.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {schema.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {schemas.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Code className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No schemas created yet</p>
                        <p className="text-xs mt-1">Create your first JSON-LD schema</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Schema Types Reference */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-black mb-3">Schema Types</h3>
                <div className="space-y-2">
                  {schemaTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div key={type.value} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50">
                        <Icon className="w-4 h-4 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Schema Editor */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200">
                {(isEditing || isCreating) ? (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-black">
                        {isEditing ? 'Edit Schema' : 'Create New Schema'}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setIsCreating(false);
                            setSelectedSchema(null);
                            setValidationError(null);
                          }}
                          className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveSchema}
                          disabled={!!validationError}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1"
                        >
                          <Save className="w-4 h-4" /> Save
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Schema Type</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {schemaTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Page Type</label>
                        <select
                          value={formData.pageType}
                          onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {pageTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Schema Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Homepage Schema"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">JSON Content</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoadSample(formData.type)}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Load Sample
                          </button>
                          <button
                            onClick={() => validateJSON(formData.content)}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Validate
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={formData.content}
                        onChange={(e) => {
                          setFormData({ ...formData, content: e.target.value });
                          validateJSON(e.target.value);
                        }}
                        placeholder="Enter JSON-LD schema content..."
                        rows={12}
                        className={`w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {validationError && (
                        <div className="mt-1 flex items-center gap-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          {validationError}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                        Active (include in website)
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-black mb-2">Select a Schema</h3>
                    <p className="text-gray-500 mb-4">Choose an existing schema to edit or create a new one</p>
                    <button
                      onClick={handleCreateSchema}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" /> Create New Schema
                    </button>
                  </div>
                )}
              </div>

              {/* Preview Section */}
              {selectedSchema && !isEditing && (
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-black">Preview</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyToClipboard(selectedSchema.content, 'preview')}
                        className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1"
                      >
                        {copiedId === 'preview' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        Copy
                      </button>
                      <button
                        onClick={() => handleDownloadSchema(selectedSchema)}
                        className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(selectedSchema.content), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Best Practices */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              JSON-LD Best Practices
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Schema Guidelines</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use valid JSON syntax at all times</li>
                  <li>• Include required properties for each schema type</li>
                  <li>• Test schemas with Google's Rich Results Test</li>
                  <li>• Keep schemas focused and relevant to page content</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Implementation Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Place JSON-LD in &lt;head&gt; section</li>
                  <li>• Use only one schema per context when possible</li>
                  <li>• Update schemas when content changes</li>
                  <li>• Monitor performance with Google Search Console</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}