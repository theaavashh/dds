"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import BannerModal from "@/components/BannerModal";
import { Plus, Edit, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { getImageUrl } from "@/lib/api";

type BannerItem = {
  id: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function BannersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<BannerItem | null>(null);
  const [items, setItems] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result: any = await axiosInstance.get("/api/banners");
      if (result.success && Array.isArray(result.data)) {
        setItems(result.data);
      } else {
        toast.error("Failed to load banners");
        setError(typeof result.message === 'string' ? result.message : 'Failed to load banners');
      }
    } catch (error) {
      toast.error("Failed to fetch banners");
      setError("Failed to fetch banners");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: FormData) => {
    try {
      let result: any;
      if (editing) {
        result = await axiosInstance.put(`/api/banners/${editing.id}`, data);
      } else {
        result = await axiosInstance.post("/api/banners", data);
      }
      if (result.success) {
        toast.success(editing ? "Banner updated" : "Banner added");
        setIsModalOpen(false);
        setEditing(null);
        fetchBanners();
      } else {
        toast.error(editing ? "Failed to update banner" : "Failed to add banner");
      }
    } catch (error) {
      toast.error(editing ? "Error updating banner" : "Error saving banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      const result: any = await axiosInstance.delete(`/api/banners/${id}`);
      if (result.success) {
        toast.success("Deleted");
        fetchBanners();
      } else {
        toast.error("Failed to delete banner");
      }
    } catch (error) {
      toast.error("Error deleting banner");
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      const result: any = await axiosInstance.patch(`/api/banners/${id}/toggle`);
      if (result.success) {
        toast.success(!current ? "Activated" : "Deactivated");
        fetchBanners();
      } else {
        toast.error("Failed to toggle status");
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  return (
    <DashboardLayout title="Banners">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Banner Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed">
            <p className="text-red-600 mb-2 font-semibold">{error}</p>
            <p className="text-gray-500 mb-4">Please try again or check server logs.</p>
            <button onClick={fetchBanners} className="px-4 py-2 bg-black text-white rounded-md">Retry</button>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleToggle(item.id, item.isActive)}
                    className={`p-1.5 ${item.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-600 hover:bg-gray-50"} rounded-md transition-colors`}
                    title={item.isActive ? "Deactivate" : "Activate"}
                  >
                    {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setEditing(item); setIsModalOpen(true); }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <div className="w-full sm:w-60 h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={getImageUrl(item.imageUrl)}
                        className="w-full h-full object-cover"
                        alt="Banner"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">Banner</div>
                    <div className="mt-2 text-sm">
                      <span className={`px-2 py-1 rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed">
            <p className="text-gray-500 mb-4">No banner added yet.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-blue-600 hover:underline">
              Create one now
            </button>
          </div>
        )}

        <BannerModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditing(null); }}
          onSave={handleSave}
          initialData={editing ? { id: editing.id, imageUrl: editing.imageUrl ? getImageUrl(editing.imageUrl) : null } : null}
        />
      </div>
    </DashboardLayout>
  );
}
