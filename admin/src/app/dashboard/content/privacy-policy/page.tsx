'use client';

import React, { useState, useEffect } from 'react';
import { Save, Edit, Eye, FileText, Shield, Users, Database, Lock, Globe, AlertTriangle, X, Plus, Cookie, EyeOff, Download, Activity } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import RichTextEditor from '@/components/RichTextEditor';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/lib/axiosInstance';

interface PrivacyPolicyData {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  lastUpdated: string;
}

export default function PrivacyPolicyPage() {
  const [data, setData] = useState<PrivacyPolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<PrivacyPolicyData | null>(null);
  const [saving, setSaving] = useState(false);

  // Default privacy policy content
  const defaultPrivacyContent = `<h1>Privacy Policy</h1>
<p>At Celebration Diamonds, your privacy is important to us. We respect and protect your personal data in accordance with Nepal's Data Protection Laws and global standards like GDPR.</p>

<h2>1. Information We Collect</h2>
<p><strong>Name, email, phone number</strong></p>
<p><strong>Billing/shipping address</strong></p>
<p><strong>Purchase and service history</strong></p>
<p><strong>Digital interactions (e.g., cookies, IP address)</strong></p>

<h2>2. How We Use Your Information</h2>
<p><strong>To process orders and deliver services</strong></p>
<p><strong>For customer support and communication</strong></p>
<p><strong>To personalize your experience</strong></p>
<p><strong>For marketing purposes (with consent)</strong></p>

<h2>3. Data Protection</h2>
<p>Your data is stored securely. We do not sell or share your data with third parties without your consent, except for payment processing or legal obligations.</p>

<h2>4. Cookies</h2>
<p>We use cookies to enhance your browsing experience. You can choose to disable cookies via your browser settings.</p>

<h2>5. Your Rights</h2>
<p>You can request access, correction, or deletion of your personal data at any time.</p>`;

  const defaultPrivacyData: PrivacyPolicyData = {
    id: '',
    title: 'Privacy Policy',
    content: defaultPrivacyContent,
    isActive: true,
    lastUpdated: new Date().toISOString()
  };

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      const result: any = await axiosInstance.get('/api/privacy-policy');
      if (result.success && result.data) {
        setData(result.data);
        setEditedContent(result.data);
      } else {
        // Use default data if API call fails
        setData(defaultPrivacyData);
        setEditedContent(defaultPrivacyData);
      }
    } catch (error) {
      console.error('Failed to fetch privacy policy:', error);
      // Use default data on error
      setData(defaultPrivacyData);
      setEditedContent(defaultPrivacyData);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditedContent(data || defaultPrivacyData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedContent) return;
    
    setSaving(true);
    try {
      const payload = {
        title: editedContent.title,
        content: editedContent.content,
        isActive: editedContent.isActive
      };

      let result: any;
      if (data?.id) {
        result = await axiosInstance.put(`/api/privacy-policy/${data.id}`, payload);
      } else {
        result = await axiosInstance.post('/api/privacy-policy', payload);
      }

      if (result.success) {
        setData(result.data);
        setIsEditing(false);
        toast.success('Privacy Policy saved successfully!');
      } else {
        toast.error(typeof result.message === "string" ? result.message : "Failed to save privacy policy");
      }
    } catch (error) {
      toast.error("Error saving privacy policy");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(data || defaultPrivacyData);
    setIsEditing(false);
  };

  const handleContentEdit = (content: string) => {
    if (!editedContent) return;
    
    setEditedContent({
      ...editedContent,
      content
    });
  };

  const handleTitleEdit = (title: string) => {
    if (!editedContent) return;
    
    setEditedContent({
      ...editedContent,
      title
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout showBreadcrumb={true}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DFC97E]"></div>
            <span className="ml-2 text-gray-600">Loading Privacy Policy...</span>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const currentData = editedContent || data;

  return (
    <ProtectedRoute>
      <DashboardLayout showBreadcrumb={true}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Privacy Policy</h1>
              <p className="text-gray-600">Manage how Celebration Diamonds collects, uses, and protects customer data</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open('/privacy-policy', '_blank')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#DFC97E] to-[#C7A862] text-white rounded-lg hover:from-[#C7A862] hover:to-[#B8956A] transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                  Edit Policy
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50"
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Last Updated Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div className="text-sm text-green-800">
              <span className="font-medium">Last Updated:</span> {formatDate(currentData?.lastUpdated || new Date().toISOString())}
            </div>
          </div>

          {/* Single Rich Text Editor */}
          {isEditing && currentData ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Policy Title</label>
                    <input
                      type="text"
                      value={currentData.title}
                      onChange={(e) => handleTitleEdit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E]"
                      placeholder="Privacy Policy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Policy Content</label>
                    <div className="w-full">
                      <RichTextEditor
                        value={currentData.content}
                        onChange={handleContentEdit}
                        height="500px"
                      />
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Use the formatting toolbar to add headings, bold text, lists, and other formatting options.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
              // View Mode - Display formatted content
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8">
                  <h1 className="text-3xl font-bold text-black mb-6">{currentData?.title || 'Privacy Policy'}</h1>
                  <div className="prose prose-lg max-w-none">
                    <div 
                      className="text-gray-700 leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: currentData?.content || '' }}
                    />
                  </div>
                </div>
              </div>
            )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Database className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Data Collection</h3>
              </div>
              <p className="text-blue-700 text-sm">Transparent collection of necessary information only.</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Data Security</h3>
              </div>
              <p className="text-green-700 text-sm">Industry-standard encryption and protection measures.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-8 h-8 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900">User Rights</h3>
              </div>
              <p className="text-purple-700 text-sm">Comprehensive rights and control over personal data.</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <Cookie className="w-8 h-8 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-900">Cookie Management</h3>
              </div>
              <p className="text-orange-700 text-sm">Transparent use of cookies and tracking technologies.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}