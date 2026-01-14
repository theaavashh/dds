'use client';

import React, { useState, useEffect } from 'react';
import { Save, Edit, Eye, FileText, Shield, Gavel, Users, Globe, AlertTriangle, X, Plus, Bold, Italic, Link2, List } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';

interface TermsSection {
  id: string;
  title: string;
  content: string;
  order: number;
  lastUpdated: string;
}

export default function TermsOfUsePage() {
  const [sections, setSections] = useState<TermsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<TermsSection[]>([]);

  // Hardcoded terms data
  const hardcodedTerms: TermsSection[] = [
    {
      id: '1',
      title: 'Acceptance of Terms',
      content: `By accessing and using Celebration Diamonds' website and services, you accept and agree to be bound by the terms and condition set forth in this Terms of Use. If you do not agree to these terms, please do not use our website or services.
      
      These Terms of Use constitute a legally binding agreement made between you and Celebration Diamonds, concerning your use of our website and services.
      
      We reserve the right to update or modify these Terms of Use at any time without prior notice. Your continued use of the website following any changes constitutes acceptance of such changes.`,
      order: 1,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Use of the Website',
      content: `You may use our website for lawful purposes only. You agree not to:
      
      • Use the website for any unlawful purpose or to solicit others to perform or participate in any unlawful acts
      • Violate any international, federal, provincial, or local regulations, rules, laws, or ordinances
      • Infringe upon or violate our intellectual property rights or the intellectual property rights of others
      • Harass, abuse, insult, harm, defame, or discriminate others
      • Submit false or misleading information
      • Upload viruses or other malicious code
      • Spam, phish, pharm, pretext, spider, crawl, or scrape
      • Interfere with or circumvent the security features of the website
      • Copy, modify, or distribute any content from the website without our express written permission`,
      order: 2,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      title: 'Product Information and Pricing',
      content: `We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the website. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products.
      
      All prices are shown in Nepalese Rupees (NPR) and are subject to change without notice. We reserve the right to modify or discontinue products at any time without prior notice.
      
      Prices displayed on the website do not include shipping, handling, and taxes, which may be applied to your order.`,
      order: 3,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      title: 'Orders and Payment',
      content: `By placing an order through our website, you offer to purchase the products described in your order. We reserve the right to accept or decline your order for any reason.
      
      Payment must be made at the time of placing your order. We accept various payment methods including credit/debit cards, digital wallets, bank transfers, and cash on delivery for orders within Nepal.
      
      All transactions are secured with SSL encryption to protect your financial information. We do not store your credit card information on our servers.`,
      order: 4,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      title: 'Shipping and Delivery',
      content: `We offer shipping throughout Nepal and to selected international destinations. Shipping costs and delivery times vary based on your location and the items ordered.
      
      Standard delivery within Nepal typically takes 3-5 business days. International delivery times range from 7-14 business days, depending on the destination country.
      
      Risk of loss and title for all merchandise ordered on this website pass to you when the merchandise is delivered to the shipping address.`,
      order: 5,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '6',
      title: 'Returns and Refunds',
      content: `We offer a 30-day return policy for unused items in their original packaging. Custom-designed items may have different return conditions.
      
      To initiate a return, please contact our customer service team within 30 days of receiving your order. Items must be unworn, undamaged, and in their original packaging with all tags attached.
      
      Refunds will be processed within 7-10 business days after we receive and inspect the returned items. Shipping costs are non-refundable unless the return is due to our error.`,
      order: 6,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '7',
      title: 'Intellectual Property',
      content: `All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Celebration Diamonds and is protected by intellectual property laws.
      
      You may not use, reproduce, distribute, or create derivative works of any content without our prior written permission.
      
      All trademarks, trade names, and logos appearing on this website are the property of their respective owners.`,
      order: 7,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '8',
      title: 'Privacy and Data Protection',
      content: `Your privacy is important to us. Our use and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms of Use by reference.
      
      By using our website, you consent to the collection, use, and sharing of your personal information as described in our Privacy Policy.
      
      We use industry-standard security measures to protect your personal information from unauthorized access, use, or disclosure.`,
      order: 8,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '9',
      title: 'Limitation of Liability',
      content: `To the maximum extent permitted by applicable law, Celebration Diamonds shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the website.
      
      Our total liability to you for any cause of action whatsoever, and regardless of the form of the action, will at all times be limited to the amount paid, if any, by you to us for the products or services during the term of use.`,
      order: 9,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '10',
      title: 'Termination',
      content: `We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Use.
      
      Upon termination, your right to use the website will cease immediately. All provisions of the Terms of Use which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.`,
      order: 10,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '11',
      title: 'Governing Law',
      content: `These Terms of Use and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of Nepal, without regard to its conflict of law provisions.
      
      Any dispute arising from or relating to these Terms of Use shall be subject to the exclusive jurisdiction of the courts located in Kathmandu, Nepal.`,
      order: 11,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '12',
      title: 'Changes to Terms',
      content: `We reserve the right to modify these Terms of Use at any time. If we make material changes, we will notify you by email or by posting a notice on our website prior to the change becoming effective.
      
      Your continued use of the website after any such changes constitutes your acceptance of the new Terms of Use. If you do not agree to the new terms, please stop using the website.`,
      order: 12,
      lastUpdated: '2024-01-01T00:00:00Z'
    }
  ];

  useEffect(() => {
    setSections(hardcodedTerms);
    setLoading(false);
  }, []);

  const handleEdit = () => {
    setEditedContent([...sections]);
    setIsEditing(true);
  };

  const handleSave = () => {
    setSections([...editedContent]);
    setIsEditing(false);
    toast.success('Terms of Use updated successfully!');
  };

  const handleCancel = () => {
    setEditedContent([]);
    setIsEditing(false);
  };

  const handleSectionEdit = (index: number, field: 'title' | 'content', value: string) => {
    const newContent = [...editedContent];
    newContent[index] = { ...newContent[index], [field]: value };
    setEditedContent(newContent);
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
              <p className="text-gray-600">Manage the terms and conditions for using Celebration Diamonds website</p>
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
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Last Updated Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="text-sm text-blue-800">
              <span className="font-medium">Last Updated:</span> {formatDate(sections[0]?.lastUpdated || new Date().toISOString())}
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {isEditing ? (
              // Edit Mode
              <div className="space-y-6">
                {editedContent.map((section, index) => (
                  <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-[#DFC97E] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {section.order}
                        </span>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleSectionEdit(index, 'title', e.target.value)}
                          className="flex-1 text-xl font-bold text-black bg-transparent border-b-2 border-gray-300 focus:border-[#DFC97E] outline-none px-2 py-1"
                        />
                      </div>
                      <textarea
                        value={section.content}
                        onChange={(e) => handleSectionEdit(index, 'content', e.target.value)}
                        className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E] text-gray-900 resize-none"
                        placeholder="Enter section content..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // View Mode
              <div className="space-y-6">
                {sections.map((section) => (
                  <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-start gap-4 mb-6">
                        <span className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#DFC97E] to-[#C7A862] text-white rounded-full flex items-center justify-center text-lg font-bold">
                          {section.order}
                        </span>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-black mb-2">{section.title}</h2>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              Section {section.order}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              Last updated: {formatDate(section.lastUpdated)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="prose prose-lg max-w-none">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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