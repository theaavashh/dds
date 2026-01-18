'use client';

import React, { useState, useEffect } from 'react';
import { Save, Edit, Eye, FileText, Shield, Gavel, Users, Globe, AlertTriangle, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import RichTextEditor from '@/components/RichTextEditor';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/lib/axiosInstance';

interface TermsOfUseData {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  lastUpdated: string;
}

export default function TermsOfUsePage() {
  const [data, setData] = useState<TermsOfUseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<TermsOfUseData | null>(null);
  const [saving, setSaving] = useState(false);

  // Default terms of use content
  const defaultTermsContent = `<h1>Terms of Use</h1>

<h2>1. Acceptance of Terms</h2>
<p>By accessing and using Celebration Diamonds' website and services, you accept and agree to be bound by the terms and conditions set forth in this Terms of Use. If you do not agree to these terms, please do not use our website or services.</p>
<p>These Terms of Use constitute a legally binding agreement made between you and Celebration Diamonds, concerning your use of our website and services.</p>
<p>We reserve the right to update or modify these Terms of Use at any time without prior notice. Your continued use of the website following any changes constitutes acceptance of such changes.</p>

<h2>2. Use of Website</h2>
<p>You may use our website for lawful purposes only. You agree not to:</p>
<ul>
<li>Use the website for any unlawful purpose or to solicit others to perform or participate in any unlawful acts</li>
<li>Violate any international, federal, provincial, or local regulations, rules, laws, or ordinances</li>
<li>Infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
<li>Harass, abuse, insult, harm, defame, or discriminate others</li>
<li>Submit false or misleading information</li>
<li>Upload viruses or other malicious code</li>
<li>Spam, phish, pharm, pretext, spider, crawl, or scrape</li>
<li>Interfere with or circumvent the security features of the website</li>
<li>Copy, modify, or distribute any content from the website without our express written permission</li>
</ul>

<h2>3. Product Information and Pricing</h2>
<p>We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the website. However, we do not guarantee that colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of products.</p>
<p>All prices are shown in Nepalese Rupees (NPR) and are subject to change without notice. We reserve the right to modify or discontinue products at any time without prior notice.</p>
<p>Prices displayed on the website do not include shipping, handling, and taxes, which may be applied to your order.</p>

<h2>4. Orders and Payment</h2>
<p>By placing an order through our website, you offer to purchase the products described in your order. We reserve the right to accept or decline your order for any reason.</p>
<p>Payment must be made at the time of placing your order. We accept various payment methods including credit/debit cards, digital wallets, bank transfers, and cash on delivery for orders within Nepal.</p>
<p>All transactions are secured with SSL encryption to protect your financial information. We do not store your credit card information on our servers.</p>

<h2>5. Intellectual Property</h2>
<p>All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Celebration Diamonds and is protected by intellectual property laws.</p>
<p>You may not use, reproduce, distribute, or create derivative works of any content without our prior written permission.</p>
<p>All trademarks, trade names, and logos appearing on this website are the property of their respective owners.</p>

<h2>6. Privacy and Data Protection</h2>
<p>Your privacy is important to us. Our use and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms of Use by reference.</p>
<p>By using our website, you consent to the collection, use, and sharing of your personal information as described in our Privacy Policy.</p>
<p>We use industry-standard security measures to protect your personal information from unauthorized access, use, or disclosure.</p>

<h2>7. Limitation of Liability</h2>
<p>To the maximum extent permitted by applicable law, Celebration Diamonds shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the website.</p>
<p>Our total liability to you for any cause of action whatsoever, and regardless of the form of the action, will at all times be limited to the amount paid, if any, by you to us for the products or services during the term of use.</p>

<h2>8. Termination</h2>
<p>We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Use.</p>
<p>Upon termination, your right to use the website will cease immediately. All provisions of the Terms of Use which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.</p>

<h2>9. Governing Law</h2>
<p>These Terms of Use and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of Nepal, without regard to its conflict of law provisions.</p>
<p>Any dispute arising from or relating to these Terms of Use shall be subject to the exclusive jurisdiction of the courts located in Kathmandu, Nepal.</p>

<h2>10. Changes to Terms</h2>
<p>We reserve the right to modify these Terms of Use at any time. If we make material changes, we will notify you by email or by posting a notice on our website prior to the change becoming effective.</p>
<p>Your continued use of the website after any such changes constitutes your acceptance of the new Terms of Use. If you do not agree to the new terms, please stop using the website.</p>`;

  const defaultTermsData: TermsOfUseData = {
    id: '',
    title: 'Terms of Use',
    content: defaultTermsContent,
    isActive: true,
    lastUpdated: new Date().toISOString()
  };

  useEffect(() => {
    fetchTermsOfUse();
  }, []);

  const fetchTermsOfUse = async () => {
    try {
      const result: any = await axiosInstance.get('/api/terms-of-use');
      if (result.success && result.data) {
        setData(result.data);
        setEditedContent(result.data);
      } else {
        // Use default data if API call fails
        setData(defaultTermsData);
        setEditedContent(defaultTermsData);
      }
    } catch (error) {
      console.error('Failed to fetch terms of use:', error);
      // Use default data on error
      setData(defaultTermsData);
      setEditedContent(defaultTermsData);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditedContent(data || defaultTermsData);
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
        result = await axiosInstance.put(`/api/terms-of-use/${data.id}`, payload);
      } else {
        result = await axiosInstance.post('/api/terms-of-use', payload);
      }

      if (result.success) {
        setData(result.data);
        setIsEditing(false);
        toast.success('Terms of Use saved successfully!');
      } else {
        toast.error(typeof result.message === "string" ? result.message : "Failed to save terms of use");
      }
    } catch (error) {
      toast.error("Error saving terms of use");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(data || defaultTermsData);
    setIsEditing(false);
  };

  const handleTitleEdit = (title: string) => {
    if (!editedContent) return;
    
    setEditedContent({
      ...editedContent,
      title
    });
  };

  const handleContentEdit = (content: string) => {
    if (!editedContent) return;
    
    setEditedContent({
      ...editedContent,
      content
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const currentData = editedContent || data;

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout showBreadcrumb={true}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DFC97E]"></div>
            <span className="ml-2 text-gray-600">Loading Terms of Use...</span>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout showBreadcrumb={true}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Terms of Use</h1>
              <p className="text-gray-600">Manage terms and conditions for using Celebration Diamonds website</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open('/terms-of-use', '_blank')}
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
                  Edit Terms
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="text-sm text-blue-800">
              <span className="font-medium">Last Updated:</span> {formatDate(currentData?.lastUpdated || new Date().toISOString())}
            </div>
          </div>

          {/* Single Rich Text Editor */}
          {isEditing && currentData ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Terms Title</label>
                    <input
                      type="text"
                      value={currentData.title}
                      onChange={(e) => handleTitleEdit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E]"
                      placeholder="Terms of Use"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Terms Content</label>
                    <RichTextEditor
                      value={currentData.content}
                      onChange={handleContentEdit}
                      height="600px"
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      Use the formatting toolbar to add headings, bold text, lists, and other formatting options for your terms and conditions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // View Mode - Display formatted content
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-8">
                <h1 className="text-3xl font-bold text-black mb-6">{currentData?.title || 'Terms of Use'}</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Legal Protection</h3>
              </div>
              <p className="text-blue-700 text-sm">Comprehensive terms that protect both customers and business interests.</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">User Rights</h3>
              </div>
              <p className="text-green-700 text-sm">Clear guidelines on user rights and responsibilities.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Gavel className="w-8 h-8 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900">Compliance</h3>
              </div>
              <p className="text-purple-700 text-sm">Terms comply with Nepalese e-commerce regulations.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}