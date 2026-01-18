"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Edit, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { getImageUrl } from "@/lib/api";

type LowerBannerItem = {
  id: string;
  imageUrl: string | null;
  position: number; // 1 for left banner, 2 for right banner
  createdAt: string;
};

export default function LowerBannerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<LowerBannerItem | null>(null);
  const [items, setItems] = useState<LowerBannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    
    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Update the hidden file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
    }
  };

  useEffect(() => {
    fetchLowerBanners();
  }, []);

  const fetchLowerBanners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch from the dedicated lower banner endpoint
      const result: any = await axiosInstance.get("/api/lower-banners");
      if (result.success && Array.isArray(result.data)) {
        setItems(result.data);
      } else {
        // Initialize with empty banners if none exist
        setItems([
          {
            id: "1",
            imageUrl: null,
            position: 1,
            createdAt: new Date().toISOString()
          },
          {
            id: "2", 
            imageUrl: null,
            position: 2,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching lower banners:", error);
      toast.error("Failed to fetch lower banners");
      setError("Failed to fetch lower banners");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: FormData) => {
    try {
      let result: any;
      if (editing) {
        result = await axiosInstance.put(`/api/lower-banners/${editing.id}`, data);
      } else {
        result = await axiosInstance.post("/api/lower-banners", data);
      }
      if (result.success) {
        toast.success(editing ? "Banner updated" : "Banner added");
        setIsModalOpen(false);
        setEditing(null);
        fetchLowerBanners();
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
      const result: any = await axiosInstance.delete(`/api/lower-banners/${id}`);
      if (result.success) {
        toast.success("Deleted");
        fetchLowerBanners();
      } else {
        toast.error("Failed to delete banner");
      }
    } catch (error) {
      toast.error("Error deleting banner");
    }
  };

// Toggle functionality removed - banners are always active

  return (
    <DashboardLayout title="Lower Banner">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Lower Banner Management</h1>
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
            <button onClick={fetchLowerBanners} className="px-4 py-2 bg-black text-white rounded-md">Retry</button>
          </div>
        ) : (
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

                <div className="pt-4">
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-4">
                    {item.imageUrl ? (
                      <img
                        src={getImageUrl(item.imageUrl)}
                        className="w-full h-full object-cover"
                        alt={`Banner ${item.position}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image uploaded
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 mb-2">
                      {item.position === 1 ? "Left Banner" : "Right Banner"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Click edit to upload image
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for uploading banner images with drag and drop */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editing ? `Edit ${editing.position === 1 ? 'Left' : 'Right'} Banner` : 'Upload Banner Image'}
                </h2>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    // Add position to form data
                    if (!editing) {
                      formData.append('position', items.length > 0 ? '1' : '2');
                    }
                    handleSave(formData);
                  }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Banner Image
                      </label>
                      
                      {/* Drag and Drop Area */}
                      <div 
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                          dragActive 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        <input
                          id="file-input"
                          type="file"
                          name="image"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                          required={!editing?.imageUrl}
                        />
                        
                        {previewImage ? (
                          <div className="space-y-3">
                            <img 
                              src={previewImage} 
                              alt="Preview" 
                              className="mx-auto max-h-40 object-contain rounded"
                            />
                            <p className="text-sm text-gray-600">Click or drag to change image</p>
                          </div>
                        ) : editing?.imageUrl ? (
                          <div className="space-y-3">
                            <img 
                              src={getImageUrl(editing.imageUrl)} 
                              alt="Current banner" 
                              className="mx-auto max-h-40 object-contain rounded border"
                            />
                            <p className="text-sm text-gray-600">Click or drag to replace image</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="text-gray-600">Drag and drop your image here</p>
                            <p className="text-sm text-gray-500">or click to browse files</p>
                            <p className="text-xs text-gray-400">Supports JPG, PNG, GIF up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {editing && (
                      <input type="hidden" name="position" value={editing.position.toString()} />
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => { setIsModalOpen(false); setEditing(null); setPreviewImage(null); }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                      disabled={!previewImage && !editing?.imageUrl}
                    >
                      {editing ? "Update Image" : "Upload Image"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}