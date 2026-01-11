"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TestimonialsModal from "@/components/TestimonialsModal";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { getImageUrl } from "@/lib/api";

type Testimonial = {
  id: string;
  customerName: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function TestimonialsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const result: any = await axiosInstance.get("/api/testimonials");
      if (result.success && Array.isArray(result.data)) {
        setItems(result.data);
      } else {
        toast.error("Failed to load testimonials");
      }
    } catch (error) {
      console.error("Failed to fetch testimonials", error);
      toast.error("Failed to fetch testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: FormData) => {
    try {
      let result: any;
      if (editing) {
        result = await axiosInstance.put(`/api/testimonials/${editing.id}`, data);
      } else {
        result = await axiosInstance.post("/api/testimonials", data);
      }
      if (result.success) {
        toast.success(editing ? "Testimonial updated" : "Testimonial created");
        setIsModalOpen(false);
        setEditing(null);
        fetchTestimonials();
      } else {
        toast.error(editing ? "Failed to update testimonial" : "Failed to create testimonial");
      }
    } catch (error) {
      toast.error(editing ? "Error updating testimonial" : "Error saving testimonial");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const result: any = await axiosInstance.delete(`/api/testimonials/${id}`);
      if (result.success) {
        toast.success("Deleted");
        fetchTestimonials();
      } else {
        toast.error("Failed to delete testimonial");
      }
    } catch (error) {
      console.error("Error deleting testimonial", error);
      toast.error("Error deleting testimonial");
    }
  };

  return (
    <DashboardLayout title="Testimonials">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 min-h-[800px]">
 l       <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-black custom-font">Testimonials Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative min-h-[300px]">
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

                <div className="flex flex-col sm:flex-row gap-6 pt-4 h-full">
                  <div className="w-full sm:w-40 h-40 bg-gray-100 rounded-lg overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getImageUrl(item.imageUrl)} alt={item.customerName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">{item.customerName}</div>
                    <p className="mt-2 text-gray-700 whitespace-pre-line">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed">
            <p className="text-gray-500 mb-4">No testimonials added yet.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-blue-600 hover:underline">
              Create one now
            </button>
          </div>
        )}

        <TestimonialsModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditing(null); }}
          onSave={handleSave}
          initialData={editing ? { id: editing.id, customerName: editing.customerName, description: editing.description, imageUrl: editing.imageUrl } : null}
        />
      </div>
    </DashboardLayout>
  );
}
