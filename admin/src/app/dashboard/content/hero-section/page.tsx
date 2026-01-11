"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import HeroSectionModal from "@/components/HeroSectionModal";
import { Plus, Edit, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";

export default function HeroSectionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [heroSections, setHeroSections] = useState<any[]>([]);
  const [editingHero, setEditingHero] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHeroSections();
  }, []);

  const fetchHeroSections = async () => {
    try {
      const result: any = await axiosInstance.get('/api/hero-section');
      if (result.success && result.data) {
        setHeroSections(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch hero sections', error);
      toast.error('Failed to fetch hero sections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingHero(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (hero: any) => {
    setEditingHero(hero);
    setIsModalOpen(true);
  };

  const handleSave = async (data: FormData) => {
    try {
      let result: any;
      if (editingHero) {
        result = await axiosInstance.put(`/api/hero-section/${editingHero.id}`, data);
      } else {
        result = await axiosInstance.post('/api/hero-section', data);
      }

      if (result.success) {
        toast.success(editingHero ? 'Hero section updated successfully' : 'Hero section created successfully');
        fetchHeroSections();
        setIsModalOpen(false);
      } else {
        toast.error('Failed to save hero section');
      }
    } catch (error) {
      console.error('Error saving hero section:', error);
      toast.error('Error saving hero section');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero section?')) return;

    try {
      const result: any = await axiosInstance.delete(`/api/hero-section/${id}`);
      if (result.success) {
        toast.success('Hero section deleted successfully');
        fetchHeroSections();
      } else {
        toast.error('Failed to delete hero section');
      }
    } catch (error) {
      console.error('Error deleting hero section:', error);
      toast.error('Error deleting hero section');
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
  };

  return (
    <DashboardLayout title="Hero Section">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hero Section Configuration</h1>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Add Hero Section
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : heroSections.length > 0 ? (
           <div className="grid grid-cols-1 gap-6">
             {heroSections.map((hero) => (
               <div key={hero.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(hero)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(hero.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-6 pt-6">
                    {/* Desktop Image Preview */}
                    <div className="flex-1 p-5 border border-gray-200 rounded-xl bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Desktop Image</h3>
                      </div>
                      
                      {/* Content Preview */}
                      <div className="mb-5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 block">Image Preview</label>
                        {hero.desktopImageUrl ? (
                          <div className="mt-1 border border-gray-100 rounded-lg p-1 inline-block bg-white shadow-sm">
                            <img src={getImageUrl(hero.desktopImageUrl)} alt="Desktop Preview" className="h-32 w-auto object-cover rounded-md" />
                          </div>
                        ) : (
                          <div className="mt-1 p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 italic min-h-[6rem] flex items-center justify-center">
                            No desktop image
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Mobile Image Preview */}
                    <div className="flex-1 p-5 border border-gray-200 rounded-xl bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Mobile Image</h3>
                      </div>
                      
                      {/* Content Preview */}
                      <div className="mb-5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 block">Image Preview</label>
                        {hero.mobileImageUrl ? (
                          <div className="mt-1 border border-gray-100 rounded-lg p-1 inline-block bg-white shadow-sm">
                            <img src={getImageUrl(hero.mobileImageUrl)} alt="Mobile Preview" className="h-32 w-auto object-cover rounded-md" />
                          </div>
                        ) : (
                          <div className="mt-1 p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 italic min-h-[6rem] flex items-center justify-center">
                            No mobile image
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
             ))}
           </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed">
            <p className="text-gray-500 mb-4">No hero sections configured yet.</p>
            <button
              onClick={handleOpenCreateModal}
              className="text-blue-600 hover:underline"
            >
              Create one now
            </button>
          </div>
        )}

        <HeroSectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingHero}
          onSave={handleSave}
        />
      </div>
    </DashboardLayout>
  );
}
