'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ChevronUp, ChevronDown, Save, X, Eye, EyeOff, GripVertical, HelpCircle, MessageSquare, FileText, Shield } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface FAQCategory {
  id: string;
  name: string;
  description: string;
  order: number;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Hardcoded FAQ data
  const hardcodedCategories: FAQCategory[] = [
    { id: '1', name: 'General', description: 'General questions about Celebration Diamonds', order: 1 },
    { id: '2', name: 'Products', description: 'Questions about our jewelry products', order: 2 },
    { id: '3', name: 'Orders', description: 'Order and shipping related questions', order: 3 },
    { id: '4', name: 'Payments', description: 'Payment and billing questions', order: 4 },
    { id: '5', name: 'Returns', description: 'Return and refund policies', order: 5 },
    { id: '6', name: 'Account', description: 'Account management questions', order: 6 }
  ];

  const hardcodedFAQs: FAQ[] = [
    {
      id: '1',
      question: 'What types of jewelry do you offer?',
      answer: 'Celebration Diamonds offers a wide range of fine jewelry including engagement rings, wedding bands, necklaces, earrings, bracelets, pendants, and custom-designed pieces. All our jewelry is crafted with high-quality materials including gold, platinum, and certified diamonds.',
      category: 'Products',
      isActive: true,
      order: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      question: 'How can I place an order?',
      answer: 'You can place an order through our website by browsing our collection, selecting your desired items, and proceeding to checkout. We also accept orders through our mobile app and by calling our customer service at +977-1234567890.',
      category: 'Orders',
      isActive: true,
      order: 2,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including credit/debit cards (Visa, MasterCard, American Express), digital wallets, bank transfers, and cash on delivery for orders within Nepal. All transactions are secured with SSL encryption.',
      category: 'Payments',
      isActive: true,
      order: 3,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      question: 'Do you offer international shipping?',
      answer: 'Yes, we offer international shipping to most countries. Shipping costs and delivery times vary by location. International orders typically take 7-14 business days for delivery. Please check our shipping policy page for detailed information.',
      category: 'Orders',
      isActive: true,
      order: 4,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for unused items in their original packaging. Custom-designed items may have different return conditions. Please review our detailed return policy on our website or contact customer service for specific inquiries.',
      category: 'Returns',
      isActive: true,
      order: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '6',
      question: 'How do I create an account?',
      answer: 'Creating an account is easy! Click on the "Sign Up" button on our website, fill in your details including name, email, and password. You will receive a confirmation email to verify your account. Once verified, you can start shopping and track your orders.',
      category: 'Account',
      isActive: true,
      order: 6,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '7',
      question: 'Are your diamonds certified?',
      answer: 'Yes, all our diamonds come with internationally recognized certifications such as GIA (Gemological Institute of America) or IGI (International Gemological Institute). Each diamond\'s certificate includes details about its cut, color, clarity, and carat weight.',
      category: 'Products',
      isActive: true,
      order: 7,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '8',
      question: 'Do you offer custom jewelry design?',
      answer: 'Yes, we specialize in custom jewelry design. You can work with our design team to create unique pieces tailored to your preferences. The process typically takes 4-6 weeks depending on complexity and material availability.',
      category: 'Products',
      isActive: true,
      order: 8,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  useEffect(() => {
    // Use hardcoded data
    setCategories(hardcodedCategories);
    setFaqs(hardcodedFAQs);
    setLoading(false);
  }, []);

  const handleSubmit = () => {
    if (!formData.question || !formData.answer || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingFAQ) {
      // Update existing FAQ
      setFaqs(prev => prev.map(faq => 
        faq.id === editingFAQ.id 
          ? {
              ...faq,
              question: formData.question,
              answer: formData.answer,
              category: formData.category,
              updatedAt: new Date().toISOString()
            }
          : faq
      ));
      toast.success('FAQ updated successfully!');
    } else {
      // Create new FAQ
      const newFAQ: FAQ = {
        id: Date.now().toString(),
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        isActive: formData.isActive,
        order: faqs.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setFaqs(prev => [...prev, newFAQ]);
      toast.success('FAQ created successfully!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      isActive: true
    });
    setEditingFAQ(null);
    setIsFormOpen(false);
  };

  const handleEdit = (faq: FAQ) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.isActive
    });
    setEditingFAQ(faq);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(prev => prev.filter(faq => faq.id !== id));
      toast.success('FAQ deleted successfully!');
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const toggleFAQStatus = (id: string) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === id 
        ? { ...faq, isActive: !faq.isActive, updatedAt: new Date().toISOString() }
        : faq
    ));
    toast.success('FAQ status updated!');
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedFAQs = categories.map(category => ({
    category,
    faqs: filteredFAQs.filter(faq => faq.category === category.name)
  }));

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout showBreadcrumb={true}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DFC97E]"></div>
            <span className="ml-2 text-gray-600">Loading FAQs...</span>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Frequently Asked Questions</h1>
              <p className="text-gray-600">Manage customer frequently asked questions</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-[#DFC97E] to-[#C7A862] text-white px-6 py-3 rounded-xl hover:from-[#C7A862] hover:to-[#B8956A] transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New FAQ
              </span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E]"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E] bg-white min-w-[200px]"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FAQ Form Modal */}
          {isFormOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-black">
                      {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.question}
                      onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E] resize-none"
                      rows={3}
                      placeholder="Enter the question..."
                    />
                  </div>

                  {/* Answer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.answer}
                      onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E] resize-none"
                      rows={6}
                      placeholder="Enter the answer..."
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E] bg-white"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-[#DFC97E] focus:ring-[#DFC97E]"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Show this FAQ on the website
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={resetForm}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#DFC97E] to-[#C7A862] text-white rounded-lg hover:from-[#C7A862] hover:to-[#B8956A] transition-all duration-200 font-medium shadow-md"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" />
                        {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQs Display */}
          <div className="space-y-8">
            {groupedFAQs.map(({ category, faqs }) => (
              faqs.length > 0 && (
                <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#DFC97E]/10 to-[#C7A862]/10 p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-[#DFC97E]" />
                      {category.name}
                      <span className="text-sm font-normal text-gray-600">
                        ({faqs.length} questions)
                      </span>
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {faqs.map((faq) => (
                      <div key={faq.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <button
                                onClick={() => toggleExpanded(faq.id)}
                                className="mt-1 p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                {expandedItems.has(faq.id) ? (
                                  <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                              </button>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-2 pr-4">
                                  {faq.question}
                                </h4>
                                {expandedItems.has(faq.id) && (
                                  <div className="text-gray-600 mb-4 prose prose-sm max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br>') }} />
                                  </div>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>{faq.category}</span>
                                  <span>•</span>
                                  <span>Updated: {new Date(faq.updatedAt).toLocaleDateString()}</span>
                                  {!faq.isActive && (
                                    <span className="text-red-600 font-medium">Hidden</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <button
                              onClick={() => toggleFAQStatus(faq.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                faq.isActive
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              title={faq.isActive ? 'Hide FAQ' : 'Show FAQ'}
                            >
                              {faq.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleEdit(faq)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit FAQ"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(faq.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete FAQ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {filteredFAQs.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first FAQ'}
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#DFC97E] to-[#C7A862] text-white rounded-xl hover:from-[#C7A862] hover:to-[#B8956A] transition-all duration-200 font-medium shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create First FAQ
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}