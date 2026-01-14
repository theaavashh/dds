"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiGet, apiDelete } from "@/lib/apiClient";
import { getApiBaseUrl } from "@/lib/api";
import { Download, RefreshCw, ChevronDown, Trash2, ChevronLeft, ChevronRight, MoreVertical, X } from "lucide-react";

interface Subscription {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

// Debounce hook for search functionality
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  email: string;
}

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, email }: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete the subscription for <span className="font-medium">{email}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function EmailSubscriptionsPage() {
  const [data, setData] = useState<Subscription[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Debounce search term to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  const allSelected = selected.length > 0 && selected.length === data.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const visiblePages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const loadData = async () => {
    setLoading(true);
    const url = `${getApiBaseUrl()}/newsletter/subscriptions?page=${page}&limit=${limit}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}`;
    const res = await apiGet<Subscription[]>(url);
    if (res.success) {
      setData(res.data || []);
      setTotal(res.pagination?.total ?? ((res.data || []).length));
    } else {
      setData([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(1); // Reset to first page when search changes
  }, [debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [page, limit, debouncedSearch]);

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    const url = `${getApiBaseUrl()}/newsletter/subscriptions/export?format=${format}`;
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('adminToken')) : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(url, { credentials: "include", headers });
    const blob = await res.blob();
    const a = document.createElement("a");
    const href = URL.createObjectURL(blob);
    a.href = href;
    a.download = `newsletter-subscriptions.${format === "xlsx" ? "xlsx" : format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(data.map(d => d.id));
    }
  };

  const toggleRow = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDeleteClick = (id: string, email: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    const url = `${getApiBaseUrl()}/newsletter/subscriptions/${deleteId}`;
    const res = await apiDelete<void>(url);
    if (res.success) {
      setSelected(prev => prev.filter(x => x !== deleteId));
      loadData();
    }

    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  // Clear search function
  const clearSearch = () => {
    setSearch("");
  };

  return (
    <DashboardLayout title="Email Subscriptions">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 relative">
          <div className="flex items-center gap-3">
            <h2 className="custom-font text-2xl text-black">Email Subscription</h2>
          </div>
          <div />
        </div>
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email"
                className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-violet-200 focus:border-violet-400 placeholder-black"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    clearSearch();
                  }
                }}
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              )}
            </div>
            {search && (
              <button
                onClick={loadData}
                className="px-3 py-2 text-black rounded-lg border text-base hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base text-black">Rows per page</span>
              <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }} className="border rounded-lg px-2 py-1 text-base text-black">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="relative group">
              <button
                onClick={() => setDownloadOpen(v => !v)}
                className="px-4 py-2  text-base flex items-center gap-2 text-black"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {downloadOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-10 text-black">
                  <button onClick={() => { handleExport("csv"); setDownloadOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">CSV</button>
                  <button onClick={() => { handleExport("xlsx"); setDownloadOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Excel (.xlsx)</button>
                  <button onClick={() => { handleExport("pdf"); setDownloadOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">PDF</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {downloadOpen && (
          <div className="fixed inset-0" onClick={() => setDownloadOpen(false)}></div>
        )}

        <div className="px-6 py-4">
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3 text-left">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded" />
                  </th>
                  <th className="text-left px-4 py-3 text-base font-semibold text-black">Email</th>
                  <th className="text-left px-4 py-3 text-base font-semibold text-black">Active</th>
                  <th className="text-left px-4 py-3 text-base font-semibold text-black">Created At</th>
                  <th className="text-left px-4 py-3 text-base font-semibold text-black">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr><td className="px-4 py-6 text-center text-base text-black" colSpan={5}>Loading...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td className="px-4 py-6 text-center text-base text-black" colSpan={5}>No subscriptions found</td></tr>
                ) : (
                  data.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleRow(item.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-3 text-base text-black">{item.email}</td>
                      <td className="px-4 py-3 text-base text-black">{item.isActive ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3 text-base text-black">{new Date(item.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <button onClick={() => handleDeleteClick(item.id, item.email)} className="px-3 py-1 rounded-lg border hover:bg-red-50 text-red-600 flex items-center gap-1">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 border-t border-gray-200 pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="text-base text-black hover:text-gray-900 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {visiblePages().map((p, idx) => (
                typeof p === 'string' ? (
                  <span key={`ellipsis-bottom-${idx}`} className="px-2 text-base text-gray-500">{p}</span>
                ) : (
                  <button
                    key={`page-bottom-${p}`}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded-lg text-base ${p === page ? 'bg-violet-100 text-violet-700' : 'text-gray-700 hover:text-gray-900'}`}
                  >
                    {p}
                  </button>
                )
              ))}
            </div>
            <button
              disabled={page >= Math.max(1, Math.ceil(total / limit))}
              onClick={() => setPage(p => p + 1)}
              className="text-base text-black hover:text-gray-900 flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        email={data.find(item => item.id === deleteId)?.email || ''}
      />
    </DashboardLayout>
  );
}