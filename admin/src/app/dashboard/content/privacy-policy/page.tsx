'use client';

import React, { useState, useEffect } from 'react';
import { Save, Edit, Eye, FileText, Shield, Users, Database, Lock, Globe, AlertTriangle, X, Plus, Cookie, EyeOff, Download, Activity } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';

interface PrivacySection {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  order: number;
  lastUpdated: string;
}

export default function PrivacyPolicyPage() {
  const [sections, setSections] = useState<PrivacySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<PrivacySection[]>([]);

  // Hardcoded privacy policy data
  const hardcodedPrivacy: PrivacySection[] = [
    {
      id: '1',
      title: 'Information We Collect',
      content: `We collect information you provide directly to us when you:
      
      • Create an account or use our website
      • Make a purchase or inquiry
      • Subscribe to our newsletter
      • Contact us for customer support
      • Participate in promotions or surveys
      
      **Types of Information Collected:**
      
      **Personal Information:**
      - Name, email address, phone number, billing address
      - Shipping address and contact preferences
      - Account credentials (username, encrypted password)
      
      **Payment Information:**
      - Credit/debit card details (processed securely by payment gateway)
      - Bank account information for direct transfers
      - Billing history and transaction records
      
      **Technical Information:**
      - IP address and device information
      - Browser type and operating system
      - Pages visited and time spent on website
      - Referring website and search terms`,
      icon: <Database className="w-6 h-6" />,
      order: 1,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'How We Use Your Information',
      content: `We use the information we collect for various purposes, including:
      
      **To Provide Our Services:**
      - Process and fulfill your orders
      - Create and manage your account
      - Respond to your inquiries and provide customer support
      - Send you order confirmations and transaction receipts
      
      **To Improve Our Website:**
      - Analyze website usage patterns and trends
      - Enhance user experience and website functionality
      - Test new features and gather user feedback
      - Optimize website performance and reliability
      
      **To Communicate With You:**
      - Send order updates and shipping notifications
      - Respond to customer service inquiries
      - Share promotional offers and new product information (with consent)
      - Send newsletters and marketing communications (with opt-in)
      
      **For Security and Legal Purposes:**
      - Prevent fraud and protect against unauthorized access
      - Comply with legal obligations and regulatory requirements
      - Enforce our terms of service and privacy policy
      - Conduct internal audits and security reviews`,
      icon: <Activity className="w-6 h-6" />,
      order: 2,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      title: 'Information Sharing and Disclosure',
      content: `We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
      
      **Service Providers:**
      - Payment processors for payment processing
      - Shipping companies for order fulfillment
      - Email service providers for newsletter delivery
      - Cloud hosting providers for data storage
      
      **Business Transfers:**
      - In the event of a merger, acquisition, or sale of assets
      - Information may be transferred as part of business transaction
      
      **Legal Requirements:**
      - When required by law, regulation, or legal process
      - To protect our rights, property, or safety
      - To protect our users or the public from harm
      - In connection with an investigation of fraud or illegal activity
      
      **With Your Consent:**
      - When you explicitly consent to the sharing
      - For joint marketing programs with trusted partners
      - For affiliate program participation (with opt-in)`,
      icon: <Users className="w-6 h-6" />,
      order: 3,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      title: 'Data Security',
      content: `We implement industry-standard security measures to protect your personal information:
      
      **Technical Safeguards:**
      - SSL encryption for all data transmissions
      - Secure password hashing and storage
      - Regular security audits and vulnerability assessments
      - Firewalls and intrusion detection systems
      
      **Physical Safeguards:**
      - Secure data centers with restricted access
      - 24/7 monitoring and surveillance systems
      - Backup systems and disaster recovery plans
      - Employee background checks and security training
      
      **Administrative Safeguards:**
      - Limited employee access to customer data
      - Regular security awareness training
      - Strict confidentiality agreements
      - Incident response and breach notification procedures
      
      **Payment Security:**
      - PCI DSS compliant payment processing
      - Tokenization for sensitive payment data
      - Fraud detection and prevention systems
      - Secure payment gateway integrations`,
      icon: <Lock className="w-6 h-6" />,
      order: 4,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      title: 'Cookies and Tracking Technologies',
      content: `We use cookies and similar tracking technologies to enhance your browsing experience:
      
      **Essential Cookies:**
      - Required for basic website functionality
      - Maintain user sessions and login status
      - Remember shopping cart contents
      - Enable security features
      
      **Performance Cookies:**
      - Collect information about how visitors use our website
      - Help us improve website performance and user experience
      - Analyze page load times and error rates
      - Optimize website navigation and layout
      
      **Functional Cookies:**
      - Remember your preferences and settings
      - Enable personalized features
      - Provide social media integration
      - Support live chat functionality
      
      **Advertising Cookies:**
      - Deliver relevant advertisements and promotions
      - Track ad campaign performance
      - Support affiliate marketing programs
      - Enable retargeting campaigns
      
      You can control cookie settings through your browser preferences. However, disabling essential cookies may affect website functionality.`,
      icon: <Cookie className="w-6 h-6" />,
      order: 5,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '6',
      title: 'Your Privacy Rights',
      content: `You have certain rights regarding your personal information:
      
      **Access and Correction:**
      - Request access to your personal information
      - Update or correct inaccurate information
      - Delete your account and associated data (where permitted)
      - Request a copy of your data in portable format
      
      **Marketing Preferences:**
      - Opt-out of marketing communications
      - Manage newsletter subscriptions
      - Control advertising personalization
      - Update communication preferences
      
      **Data Portability:**
      - Export your personal information
      - Transfer data to third-party services
      - Receive data in machine-readable format
      - Request account data summaries
      
      **Objection and Restriction:**
      - Object to certain data processing activities
      - Restrict how we use your information
      - Limit data sharing with third parties
      - Withdraw consent where applicable`,
      icon: <Users className="w-6 h-6" />,
      order: 6,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '7',
      title: 'Data Retention',
      content: `We retain your personal information only as long as necessary:
      
      **Account Information:**
      - Retained while your account is active
      - Extended retention for legal compliance requirements
      - Deleted upon account closure (subject to legal obligations)
      
      **Transaction Records:**
      - Retained for 7 years for tax and accounting purposes
      - Required for legal and regulatory compliance
      - Used for dispute resolution and customer service
      
      **Marketing Data:**
      - Retained until you opt-out or withdraw consent
      - Periodic review and cleanup of inactive data
      - Automatic deletion after specified retention periods
      
      **Website Analytics:**
      - Anonymized data may be retained for analytical purposes
      - Used to improve website performance and user experience
      - Retained in aggregated, non-identifiable form`,
      icon: <Database className="w-6 h-6" />,
      order: 7,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '8',
      title: 'International Data Transfers',
      content: `Celebration Diamonds is based in Nepal and may transfer your personal information to other countries:
      
      **Data Processing:**
      - Some service providers may be located outside Nepal
      - Data may be processed in countries with different privacy laws
      - Appropriate safeguards are in place for international transfers
      
      **Legal Framework:**
      - Transfers comply with applicable data protection laws
      - Standard contractual clauses with service providers
      - Adequate level of protection maintained
      - Regulatory oversight and compliance checks
      
      **Your Rights:**
      - Same privacy rights apply to international transfers
      - Ability to object to certain transfers where applicable
      - Information about transfer mechanisms and safeguards
      - Access to information stored outside your home country`,
      icon: <Globe className="w-6 h-6" />,
      order: 8,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '9',
      title: 'Children\'s Privacy',
      content: `Our website is not intended for children under 18 years of age:
      
      **Age Restrictions:**
      - We do not knowingly collect information from children under 18
      - Parents/guardians should monitor children's online activities
      - Age verification may be required for certain features
      
      **Parental Controls:**
      - Parents can review, correct, or delete children's information
      - Opt-out of data collection for minor children
      - Request removal of information collected from children
      - Report any privacy concerns regarding children's data
      
      **Educational Content:**
      - Age-appropriate content and features
      - No targeted marketing to children
      - Safe search and browsing features where applicable
      - Parental guidance resources and tips`,
      icon: <Shield className="w-6 h-6" />,
      order: 9,
      lastUpdated: '2024-01-01T00:00:00Z'
    },
    {
      id: '10',
      title: 'Changes to This Privacy Policy',
      content: `We may update this Privacy Policy from time to time:
      
      **Notification of Changes:**
      - Email notification for material changes
      - Website notices for minor updates
      - In-app notifications for logged-in users
      - Public announcement for significant policy changes
      
      **Effective Date:**
      - Changes become effective upon posting
      - Continued use indicates acceptance
      - 30-day notice for material changes
      - Immediate effect for security-related updates
      
      **Review Period:**
      - 15-day review period for major changes
      - Opportunity to provide feedback
      - Consideration of user comments
      - Final decision on implementation
      
      **Your Options:**
      - Accept updated policy
      - Decline changes and close account
      - Export data before account closure
      - Contact privacy officer with questions`,
      icon: <FileText className="w-6 h-6" />,
      order: 10,
      lastUpdated: '2024-01-01T00:00:00Z'
    }
  ];

  useEffect(() => {
    setSections(hardcodedPrivacy);
    setLoading(false);
  }, []);

  const handleEdit = () => {
    setEditedContent([...sections]);
    setIsEditing(true);
  };

  const handleSave = () => {
    setSections([...editedContent]);
    setIsEditing(false);
    toast.success('Privacy Policy updated successfully!');
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
            <span className="ml-2 text-gray-600">Loading Privacy Policy...</span>
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div className="text-sm text-green-800">
              <span className="font-medium">Last Updated:</span> {formatDate(sections[0]?.lastUpdated || new Date().toISOString())}
            </div>
          </div>

          {/* Privacy Sections */}
          <div className="space-y-6">
            {isEditing ? (
              // Edit Mode
              <div className="space-y-6">
                {editedContent.map((section, index) => (
                  <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#DFC97E] to-[#C7A862] text-white rounded-full flex items-center justify-center">
                          {section.icon}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => handleSectionEdit(index, 'title', e.target.value)}
                            className="w-full text-xl font-bold text-black bg-transparent border-b-2 border-gray-300 focus:border-[#DFC97E] outline-none px-2 py-1 mb-3"
                          />
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Section {section.order}</span>
                            <span>•</span>
                            <span>Last updated: {formatDate(section.lastUpdated)}</span>
                          </div>
                        </div>
                      </div>
                      <textarea
                        value={section.content}
                        onChange={(e) => handleSectionEdit(index, 'content', e.target.value)}
                        className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E] text-gray-900 resize-none"
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
                  <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-8">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#DFC97E] to-[#C7A862] text-white rounded-xl flex items-center justify-center shadow-sm">
                          <div className="text-white">
                            {section.icon}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-black mb-3">{section.title}</h2>
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