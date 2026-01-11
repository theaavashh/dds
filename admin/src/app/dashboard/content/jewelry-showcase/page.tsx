'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Upload, Edit, Trash2, Loader2, Plus, X } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

interface JewelryShowcaseData {
  id?: string;
  leftImage?: string;
  rightImage?: string;
  title?: string;
  quote1?: string;
  quote2?: string;
  quote3?: string;
  buttonText?: string;
  isActive?: boolean;
}

export default function JewelryShowcasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showcaseData, setShowcaseData] = useState<JewelryShowcaseData | null>(null);
  const [editing, setEditing] = useState<JewelryShowcaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leftImageFile, setLeftImageFile] = useState<File | null>(null);
  const [rightImageFile, setRightImageFile] = useState<File | null>(null);
  const [leftImagePreview, setLeftImagePreview] = useState<string | null>(null);
  const [rightImagePreview, setRightImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchJewelryShowcase();
  }, []);

  const fetchJewelryShowcase = async () => {
    try {
      const result: any = await axiosInstance.get('/api/jewelry-showcase');
      if (result.success && result.data) {
        setShowcaseData(result.data);
        setEditing(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch jewelry showcase data', error);
      toast.error('Failed to fetch jewelry showcase data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setImageFile: (file: File | null) => void, setImagePreview: (preview: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      // Add all text fields
      formData.append('title', editing?.title || '');
      formData.append('quote1', editing?.quote1 || '');
      formData.append('quote2', editing?.quote2 || '');
      formData.append('quote3', editing?.quote3 || '');
      formData.append('buttonText', editing?.buttonText || '');
      formData.append('isActive', (editing?.isActive || true).toString());
      
      // Add image files if they exist
      if (leftImageFile) formData.append('leftImage', leftImageFile);
      if (rightImageFile) formData.append('rightImage', rightImageFile);
      
      let result: any;
      if (showcaseData?.id) {
        result = await axiosInstance.put(`/api/jewelry-showcase/${showcaseData.id}`, formData);
      } else {
        result = await axiosInstance.post('/api/jewelry-showcase', formData);
      }
      
      if (result.success) {
        toast.success(showcaseData?.id ? 'Jewelry showcase updated successfully' : 'Jewelry showcase created successfully');
        fetchJewelryShowcase();
        setIsModalOpen(false);
      } else {
        toast.error('Failed to save jewelry showcase');
      }
    } catch (error) {
      console.error('Error saving jewelry showcase:', error);
      toast.error('Error saving jewelry showcase');
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
  };

  return (
    <DashboardLayout title="Jewelry Showcase">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Jewelry Showcase Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Edit className="w-4 h-4" />
            Edit Showcase
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : showcaseData ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Image Preview */}
              <div className="flex flex-col items-center">
                <h3 className="font-semibold text-gray-900 mb-4">Left Image</h3>
                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {showcaseData.leftImage ? (
                    <img 
                      src={getImageUrl(showcaseData.leftImage)} 
                      alt="Left Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">No image uploaded</span>
                  )}
                </div>
              </div>
              
              {/* Right Image Preview */}
              <div className="flex flex-col items-center">
                <h3 className="font-semibold text-gray-900 mb-4">Right Image</h3>
                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {showcaseData.rightImage ? (
                    <img 
                      src={getImageUrl(showcaseData.rightImage)} 
                      alt="Right Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">No image uploaded</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Text Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="bg-gray-50 p-3 rounded border">{showcaseData.title || 'I see bold accessories as a woman\'s armour.'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quote 1</label>
                  <p className="bg-gray-50 p-3 rounded border">{showcaseData.quote1 || 'Jewellery has the power to be the one little thing that makes you feel unique.'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quote 2</label>
                  <p className="bg-gray-50 p-3 rounded border">{showcaseData.quote2 || 'I\'ve always thought of accessories as the exclamation point of a woman\'s outfit.'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quote 3</label>
                  <p className="bg-gray-50 p-3 rounded border">{showcaseData.quote3 || 'Jewellery is a very personal thing... it should tell a story about the person who\'s wearing it.'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <p className="bg-gray-50 p-3 rounded border">{showcaseData.buttonText || 'Explore'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed">
            <p className="text-gray-500 mb-4">No jewelry showcase data configured yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 hover:underline flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" /> Create one now
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Edit Jewelry Showcase</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Left Image Upload */}
                  <div>
                    <label className="block text-md font-medium text-black uppercase mb-2">Left Image</label>
                    <div className="space-y-3">
                      {leftImagePreview || (showcaseData?.leftImage) ? (
                        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                          <img 
                            src={leftImagePreview ? leftImagePreview : getImageUrl(showcaseData?.leftImage || '')} 
                            alt="Left Preview" 
                            className="w-full h-48 object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={() => { setLeftImageFile(null); setLeftImagePreview(null); }}
                              className="bg-white text-red-500 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                              <Upload className="w-6 h-6 text-blue-500" />
                            </div>
                            <p className="mb-1 text-sm font-medium text-gray-700">Click to upload left image</p>
                            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setLeftImageFile, setLeftImagePreview)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Image Upload */}
                  <div>
                    <label className="block text-md font-medium text-black uppercase mb-2">Right Image</label>
                    <div className="space-y-3">
                      {rightImagePreview || (showcaseData?.rightImage) ? (
                        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                          <img 
                            src={rightImagePreview ? rightImagePreview : getImageUrl(showcaseData?.rightImage || '')} 
                            alt="Right Preview" 
                            className="w-full h-48 object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={() => { setRightImageFile(null); setRightImagePreview(null); }}
                              className="bg-white text-red-500 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-all group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                              <Upload className="w-6 h-6 text-purple-500" />
                            </div>
                            <p className="mb-1 text-sm font-medium text-gray-700">Click to upload right image</p>
                            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setRightImageFile, setRightImagePreview)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={editing?.title || ''}
                      onChange={(e) => setEditing({...editing, title: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Enter title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quote 1</label>
                    <textarea
                      value={editing?.quote1 || ''}
                      onChange={(e) => setEditing({...editing, quote1: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      rows={2}
                      placeholder="Enter first quote"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quote 2</label>
                    <textarea
                      value={editing?.quote2 || ''}
                      onChange={(e) => setEditing({...editing, quote2: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      rows={2}
                      placeholder="Enter second quote"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quote 3</label>
                    <textarea
                      value={editing?.quote3 || ''}
                      onChange={(e) => setEditing({...editing, quote3: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      rows={2}
                      placeholder="Enter third quote"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={editing?.buttonText || ''}
                      onChange={(e) => setEditing({...editing, buttonText: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Enter button text"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editing?.isActive || false}
                      onChange={(e) => setEditing({...editing, isActive: e.target.checked})}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors shadow-lg shadow-black/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}