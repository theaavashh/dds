"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ServiceModal from "@/components/ServiceModal";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { getImageUrl } from "@/lib/api";

type ServiceItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const result: any = await axiosInstance.get("/api/services");
      if (result.success && Array.isArray(result.data)) {
        setItems(result.data);
      } else {
        toast.error("Failed to load services");
      }
    } catch (error) {
      toast.error("Failed to fetch services");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: FormData) => {
    try {
      let result: any;
      if (editing) {
        result = await axiosInstance.put(`/api/services/${editing.id}`, data);
      } else {
        result = await axiosInstance.post("/api/services", data);
      }
      if (result.success) {
        toast.success(editing ? "Service updated" : "Service created");
        setIsModalOpen(false);
        setEditing(null);
        fetchServices();
      } else {
        toast.error(editing ? "Failed to update service" : "Failed to create service");
      }
    } catch (error) {
      toast.error(editing ? "Error updating service" : "Error saving service");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      const result: any = await axiosInstance.delete(`/api/services/${id}`);
      if (result.success) {
        toast.success("Deleted");
        fetchServices();
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error) {
      toast.error("Error deleting service");
    }
  };

  return (
    <DashboardLayout title="Services">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Service Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
                <div className="absolute top-4 right-4 flex gap-2">
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
                  <div className="w-full sm:w-40 h-40 bg-gray-100 rounded-lg overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getImageUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">{item.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed">
            <p className="text-gray-500 mb-4">No services added yet.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-blue-600 hover:underline">
              Create one now
            </button>
          </div>
        )}

        <ServiceModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditing(null); }}
          onSave={handleSave}
          initialData={editing ? { id: editing.id, title: editing.title, imageUrl: editing.imageUrl } : null}
        />
      </div>
    </DashboardLayout>
  );
}
