'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Reply, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, User, Mail, Phone, Calendar, Star, Eye, EyeOff, Trash2, Archive, MoreVertical, HelpCircle, Users, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';

interface ResellerMessage {
  id: string;
  resellerId: string;
  resellerName: string;
  resellerEmail: string;
  resellerPhone: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'replied' | 'archived';
  category: 'inquiry' | 'support' | 'complaint' | 'feedback' | 'other';
  createdAt: string;
  updatedAt: string;
  reply?: {
    content: string;
    repliedAt: string;
    repliedBy: string;
  };
}

interface Reseller {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
}

export default function ResellerMessagesPage() {
  const [messages, setMessages] = useState<ResellerMessage[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<ResellerMessage | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  // Hardcoded reseller data
  const hardcodedResellers: Reseller[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      phone: '+977 9876543210',
      businessName: 'Verma Jewels',
      joinDate: '2023-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+977 9876543211',
      businessName: 'Sharma Collections',
      joinDate: '2023-02-20',
      status: 'active'
    },
    {
      id: '3',
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      phone: '+977 9876543212',
      businessName: 'Patel Gems',
      joinDate: '2023-03-10',
      status: 'active'
    }
  ];

  // Hardcoded messages data
  const hardcodedMessages: ResellerMessage[] = [
    {
      id: '1',
      resellerId: '1',
      resellerName: 'Rajesh Kumar',
      resellerEmail: 'rajesh.kumar@example.com',
      resellerPhone: '+977 9876543210',
      subject: 'Question about new diamond collection',
      message: 'I would like to inquire about the upcoming diamond collection that was mentioned in the recent newsletter. Could you provide more details about the pricing and availability? Also, are there any special discounts for resellers on this collection?',
      priority: 'high',
      status: 'unread',
      category: 'inquiry',
      createdAt: '2024-01-14T10:30:00Z',
      updatedAt: '2024-01-14T10:30:00Z'
    },
    {
      id: '2',
      resellerId: '2',
      resellerName: 'Priya Sharma',
      resellerEmail: 'priya.sharma@example.com',
      resellerPhone: '+977 9876543211',
      subject: 'Issue with order #CD-2024-001',
      message: 'I received order #CD-2024-001 yesterday, but there seems to be an issue with one of the items. The diamond ring I ordered has a small scratch on the band. Could you please advise on how to proceed with a replacement or refund?',
      priority: 'urgent',
      status: 'read',
      category: 'complaint',
      createdAt: '2024-01-13T14:45:00Z',
      updatedAt: '2024-01-13T15:30:00Z',
      reply: {
        content: 'Dear Priya, I apologize for the issue with your order. We take quality control very seriously and this should not have happened. Please send us photos of the scratch, and we will arrange for a replacement ring to be sent to you immediately. The replacement will be shipped at no additional cost to you.',
        repliedAt: '2024-01-13T16:00:00Z',
        repliedBy: 'Admin Support'
      }
    },
    {
      id: '3',
      resellerId: '3',
      resellerName: 'Amit Patel',
      resellerEmail: 'amit.patel@example.com',
      resellerPhone: '+977 9876543212',
      subject: 'Feedback on new website features',
      message: 'I wanted to provide some positive feedback on the new reseller dashboard. The order tracking feature is excellent and has really helped streamline our business. However, I think it would be great if you could add a feature to export order data to Excel format. Keep up the great work!',
      priority: 'medium',
      status: 'replied',
      category: 'feedback',
      createdAt: '2024-01-12T09:15:00Z',
      updatedAt: '2024-01-12T11:00:00Z',
      reply: {
        content: 'Dear Amit, Thank you so much for your positive feedback! We\'re thrilled to hear that you\'re enjoying the new dashboard features. Your suggestion about Excel export is excellent - we\'ll definitely add this to our development roadmap. We appreciate your business and look forward to serving you better.',
        repliedAt: '2024-01-12T10:30:00Z',
        repliedBy: 'Product Team'
      }
    },
    {
      id: '4',
      resellerId: '1',
      resellerName: 'Rajesh Kumar',
      resellerEmail: 'rajesh.kumar@example.com',
      resellerPhone: '+977 9876543210',
      subject: 'Request for marketing materials',
      message: 'Could you please send me some marketing materials for the upcoming wedding season? I need brochures, product catalogs, and some high-quality images for my social media campaigns. This would really help me promote your products more effectively.',
      priority: 'medium',
      status: 'archived',
      category: 'support',
      createdAt: '2024-01-11T16:20:00Z',
      updatedAt: '2024-01-11T18:00:00Z',
      reply: {
        content: 'Dear Rajesh, I\'ve sent the marketing materials to your email. You should find brochures, catalogs, and high-resolution images in the zip file. Please let me know if you need any additional materials or have questions about using them effectively.',
        repliedAt: '2024-01-11T17:00:00Z',
        repliedBy: 'Marketing Team'
      }
    },
    {
      id: '5',
      resellerId: '2',
      resellerName: 'Priya Sharma',
      resellerEmail: 'priya.sharma@example.com',
      resellerPhone: '+977 9876543211',
      subject: 'Commission payment inquiry',
      message: 'I haven\'t received my commission payment for December yet. According to our agreement, payments should be processed by the 5th of each month. Could you please check on this and let me know when I can expect the payment?',
      priority: 'high',
      status: 'read',
      category: 'inquiry',
      createdAt: '2024-01-10T11:30:00Z',
      updatedAt: '2024-01-10T12:00:00Z'
    }
  ];

  useEffect(() => {
    // Use hardcoded data
    setMessages(hardcodedMessages);
    setResellers(hardcodedResellers);
    setLoading(false);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'read':
        return <Eye className="w-4 h-4 text-gray-600" />;
      case 'replied':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inquiry':
        return <HelpCircle className="w-4 h-4" />;
      case 'support':
        return <Users className="w-4 h-4" />;
      case 'complaint':
        return <XCircle className="w-4 h-4" />;
      case 'feedback':
        return <Star className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const handleReply = () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    // Update message with reply
    setMessages(prev => prev.map(msg => 
      msg.id === selectedMessage.id 
        ? {
            ...msg,
            status: 'replied',
            reply: {
              content: replyContent,
              repliedAt: new Date().toISOString(),
              repliedBy: 'Admin'
            },
            updatedAt: new Date().toISOString()
          }
        : msg
    ));

    toast.success('Reply sent successfully!');
    setReplyContent('');
    setIsReplyModalOpen(false);
    setSelectedMessage(null);
  };

  const handleStatusChange = (messageId: string, newStatus: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: newStatus as 'unread' | 'read' | 'replied' | 'archived', updatedAt: new Date().toISOString() }
        : msg
    ));
    toast.success(`Message marked as ${newStatus}`);
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.resellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.resellerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || message.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || message.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'all' || message.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const messageStats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    urgent: messages.filter(m => m.priority === 'urgent').length,
    pending: messages.filter(m => m.status === 'read' && !m.reply).length
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout showBreadcrumb={true}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DFC97E]"></div>
            <span className="ml-2 text-gray-600">Loading messages...</span>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Reseller Messages</h1>
            <p className="text-gray-600">Manage communications with your reseller network</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Messages</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{messageStats.total}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Unread</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">{messageStats.unread}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Urgent</p>
                  <p className="text-3xl font-bold text-orange-900 mt-2">{messageStats.urgent}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pending Reply</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-2">{messageStats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E]"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E] bg-white"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>

              {/* Priority Filter */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E] bg-white"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E] bg-white"
              >
                <option value="all">All Categories</option>
                <option value="inquiry">Inquiry</option>
                <option value="support">Support</option>
                <option value="complaint">Complaint</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'No messages from resellers yet'}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div key={message.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{message.subject}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(message.priority)}`}>
                            {message.priority.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusIcon(message.status).props.className}`}>
                            {getStatusIcon(message.status)}
                            <span className="ml-1 capitalize">{message.status}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{message.resellerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{message.resellerEmail}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4 line-clamp-3">{message.message}</p>
                        {message.reply && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Reply className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Reply from {message.reply.repliedBy}</span>
                              <span className="text-xs text-green-600">
                                {new Date(message.reply.repliedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-green-700 text-sm">{message.reply.content}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setIsReplyModalOpen(true);
                          }}
                          className="px-3 py-2 bg-gradient-to-r from-[#DFC97E] to-[#C7A862] text-white rounded-lg hover:from-[#C7A862] hover:to-[#B8956A] transition-all duration-200 text-sm font-medium"
                        >
                          <Reply className="w-4 h-4" />
                          Reply
                        </button>
                        <button
                          onClick={() => handleStatusChange(message.id, message.status === 'read' ? 'unread' : 'read')}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          {message.status === 'read' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {message.status === 'read' ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(message.id, 'archived')}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply Modal */}
          {isReplyModalOpen && selectedMessage && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-black">Reply to Message</h2>
                    <button
                      onClick={() => {
                        setIsReplyModalOpen(false);
                        setSelectedMessage(null);
                        setReplyContent('');
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Original Message */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{selectedMessage.resellerName}</span>
                      <span className="text-sm text-gray-500">({selectedMessage.resellerEmail})</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedMessage.subject}</h3>
                    <p className="text-gray-700">{selectedMessage.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <span>Priority: {selectedMessage.priority}</span>
                      <span>•</span>
                      <span>{new Date(selectedMessage.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Reply Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Reply
                      </label>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#DFC97E] focus:border-[#DFC97E] resize-none"
                        rows={6}
                        placeholder="Type your reply here..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setIsReplyModalOpen(false);
                          setSelectedMessage(null);
                          setReplyContent('');
                        }}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReply}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#DFC97E] to-[#C7A862] text-white rounded-lg hover:from-[#C7A862] hover:to-[#B8956A] transition-all duration-200 font-medium shadow-md"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Send className="w-4 h-4" />
                          Send Reply
                        </span>
                      </button>
                    </div>
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