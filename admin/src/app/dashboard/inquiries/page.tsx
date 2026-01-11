'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Eye,
    MoreVertical,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw,
    User,
    Mail,
    Phone,
    MessageSquare,
    Package
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '@/lib/api';

interface InquiryItem {
    id: string;
    productId: string;
    productCode: string;
    name: string;
    category: string;
    quantity: number;
    goldWeight?: string;
    goldPurity?: string;
    price?: number;
}

interface Inquiry {
    id: string;
    inquiryNumber: string;
    distributorId: string;
    distributor: {
        firstName: string;
        lastName: string;
        companyName: string;
        email: string;
        phone?: string;
    };
    status: 'pending' | 'contacted' | 'closed' | 'cancelled';
    totalItems: number;
    notes?: string;
    items: InquiryItem[];
    createdAt: string;
    updatedAt: string;
}

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadInquiries();
    }, [statusFilter]);

    const loadInquiries = async () => {
        setIsLoading(true);
        try {
            const url = new URL(`${getApiBaseUrl()}/inquiries`);
            if (statusFilter !== 'all') {
                url.searchParams.append('status', statusFilter);
            }

            const response = await fetch(url.toString(), {
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                setInquiries(data.data);
            } else {
                toast.error(data.message || 'Failed to load inquiries');
            }
        } catch (error) {
            console.error('Error loading inquiries:', error);
            toast.error('Error loading inquiries');
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const response = await fetch(`${getApiBaseUrl()}/inquiries/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
                credentials: 'include',
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`Status updated to ${status}`);
                loadInquiries();
                if (selectedInquiry?.id === id) {
                    setShowModal(false);
                }
            } else {
                toast.error(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating status');
        }
    };

    const filteredInquiries = inquiries.filter(inq =>
        inq.inquiryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.distributor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.distributor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'contacted': return 'bg-blue-100 text-blue-800';
            case 'closed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout title="Inquiries" showBreadcrumb={true}>
            <div className="space-y-6 text-black">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Inquiry Management</h1>
                        <p className="text-gray-500">Manage customer product inquiries</p>
                    </div>
                    <button onClick={loadInquiries} className="p-2 border rounded-lg hover:bg-gray-50">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex gap-4 items-center bg-white p-4 rounded-lg border">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by inquiry #, company or email..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Inquiry #</th>
                                <th className="px-6 py-3 font-semibold">Distributor</th>
                                <th className="px-6 py-3 font-semibold">Items</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10">
                                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                                    </td>
                                </tr>
                            ) : filteredInquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500">No inquiries found</td>
                                </tr>
                            ) : filteredInquiries.map((inq) => (
                                <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-blue-600">{inq.inquiryNumber}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{inq.distributor.companyName}</div>
                                        <div className="text-xs text-gray-500">{inq.distributor.email}</div>
                                    </td>
                                    <td className="px-6 py-4">{inq.totalItems}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(inq.status)}`}>
                                            {inq.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {new Date(inq.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => { setSelectedInquiry(inq); setShowModal(true); }}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Detail Modal */}
                {showModal && selectedInquiry && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                                <div>
                                    <h2 className="text-xl font-bold">Inquiry Details - {selectedInquiry.inquiryNumber}</h2>
                                    <p className="text-sm text-gray-500">Submitted on {new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <XCircle className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider flex items-center gap-2">
                                            <User className="w-4 h-4" /> Distributor Info
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border">
                                            <p><span className="text-gray-500 w-24 inline-block">Company:</span> <span className="font-medium">{selectedInquiry.distributor.companyName}</span></p>
                                            <p><span className="text-gray-500 w-24 inline-block">Contact:</span> <span className="font-medium">{selectedInquiry.distributor.firstName} {selectedInquiry.distributor.lastName}</span></p>
                                            <p><span className="text-gray-500 w-24 inline-block">Email:</span> <a href={`mailto:${selectedInquiry.distributor.email}`} className="text-blue-600 hover:underline">{selectedInquiry.distributor.email}</a></p>
                                            <p><span className="text-gray-500 w-24 inline-block">Phone:</span> <span className="font-medium">{selectedInquiry.distributor.phone || 'N/A'}</span></p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Status & Controls
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-4 border">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Current Status:</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedInquiry.status)}`}>
                                                    {selectedInquiry.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {['pending', 'contacted', 'closed', 'cancelled'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => updateStatus(selectedInquiry.id, s)}
                                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${selectedInquiry.status === s
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                                : 'bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600'
                                                            }`}
                                                    >
                                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedInquiry.notes && (
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" /> Notes
                                        </h3>
                                        <div className="bg-amber-50 p-4 rounded-lg text-sm border border-amber-100 text-amber-900 italic">
                                            "{selectedInquiry.notes}"
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider flex items-center gap-2">
                                        <Package className="w-4 h-4" /> Items ({selectedInquiry.items.length})
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 font-semibold">Product</th>
                                                    <th className="px-4 py-2 font-semibold">Category</th>
                                                    <th className="px-4 py-2 font-semibold text-center">Qty</th>
                                                    <th className="px-4 py-2 font-semibold">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {selectedInquiry.items.map(item => (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium">{item.productCode}</div>
                                                            <div className="text-xs text-gray-500">{item.name}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">{item.category}</td>
                                                        <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-xs text-gray-500">
                                                            {item.goldWeight && <div>Gold: <span className="text-gray-700">{item.goldWeight}</span></div>}
                                                            {item.goldPurity && <div>Purity: <span className="text-gray-700">{item.goldPurity}</span></div>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t bg-gray-50 flex justify-end">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 bg-white border rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
