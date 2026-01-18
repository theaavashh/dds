'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

interface CatalogItem {
  id: string;
  title: string;
  description: string;
  image1Url: string;
  image2Url: string;
  image3Url: string;
  image4Url: string;
  image1Title: string;
  image1Link: string;
  image2Title: string;
  image2Link: string;
  image3Title: string;
  image3Link: string;
  image4Title: string;
  image4Link: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: CatalogItem | null;
  onSave: (data: FormData) => void;
}

function CatalogModal({ isOpen, onClose, editingItem, onSave }: CatalogModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: '0',
    isActive: true
  });
  const [images, setImages] = useState([
    { 
      file: null as File | null, 
      preview: null as string | null,
      title: '',
      link: ''
    },
    { 
      file: null as File | null, 
      preview: null as string | null,
      title: '',
      link: ''
    },
    { 
      file: null as File | null, 
      preview: null as string | null,
      title: '',
      link: ''
    },
    { 
      file: null as File | null, 
      preview: null as string | null,
      title: '',
      link: ''
    }
  ]);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title,
        description: editingItem.description,
        position: editingItem.position.toString(),
        isActive: editingItem.isActive
      });
      // Initialize with existing images (assuming we store title/link in DB)
      setImages([
        { file: null, preview: editingItem.image1Url || null, title: '', link: '' },
        { file: null, preview: editingItem.image2Url || null, title: '', link: '' },
        { file: null, preview: editingItem.image3Url || null, title: '', link: '' },
        { file: null, preview: editingItem.image4Url || null, title: '', link: '' }
      ]);
    } else {
      resetForm();
    }
  }, [editingItem]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      position: '0',
      isActive: true
    });
    setImages([
      { file: null, preview: null, title: '', link: '' },
      { file: null, preview: null, title: '', link: '' },
      { file: null, preview: null, title: '', link: '' },
      { file: null, preview: null, title: '', link: '' }
    ]);
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImages = [...images];
      newImages[index].file = file;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages[index].preview = reader.result as string;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const newImages = [...images];
        newImages[index].file = file;
        
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages[index].preview = reader.result as string;
          setImages(newImages);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageFieldChange = (index: number, field: 'title' | 'link', value: string) => {
    const newImages = [...images];
    newImages[index][field] = value;
    setImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('position', formData.position);
    data.append('isActive', formData.isActive.toString());
    
    // Append all 4 images with their metadata
    images.forEach((image, index) => {
      if (image.file) {
        data.append(`image${index + 1}`, image.file);
      }
      data.append(`image${index + 1}Title`, image.title);
      data.append(`image${index + 1}Link`, image.link);
    });
    
    onSave(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {editingItem ? 'Edit Catalog Item' : 'Add New Catalog Item'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <input
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800">Image {index + 1}</h4>
                      
                      {/* Drag and Drop Area */}
                      <div className="relative">
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors bg-white"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(index, e)}
                          onClick={() => document.getElementById(`file-input-${index}`)?.click()}
                        >
                          {(images[index].preview || images[index].file) ? (
                            <div className="space-y-2">
                              <img 
                                src={images[index].preview || (images[index].file ? URL.createObjectURL(images[index].file!) : '')} 
                                alt={`Preview ${index + 1}`} 
                                className="w-full h-32 object-cover rounded-lg mx-auto" 
                              />
                              <p className="text-xs text-gray-600 truncate">
                                {images[index].file ? images[index].file!.name : 'Existing image'}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2 py-4">
                              <div className="text-gray-400">
                                <svg className="mx-auto h-8 w-8" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-600">Drag & drop an image here</p>
                              <p className="text-xs text-gray-500">or click to browse</p>
                            </div>
                          )}
                        </div>
                        <input
                          id={`file-input-${index}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(index, e)}
                        />
                      </div>
                      
                      {/* Image Title */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Image Title</label>
                        <input
                          type="text"
                          value={images[index].title}
                          onChange={(e) => handleImageFieldChange(index, 'title', e.target.value)}
                          placeholder="Enter image title"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Image Link */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Image Link</label>
                        <input
                          type="url"
                          value={images[index].link}
                          onChange={(e) => handleImageFieldChange(index, 'link', e.target.value)}
                          placeholder="https://example.com"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CatalogManagement() {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  useEffect(() => {
    fetchCatalogItems();
  }, []);

  const fetchCatalogItems = async () => {
    try {
      const result: any = await axiosInstance.get('/api/catalog/admin/all');
      if (result.success && result.data) {
        setCatalogItems(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch catalog items', error);
      toast.error('Failed to fetch catalog items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: FormData) => {
    try {
      let result: any;
      if (editingItem) {
        result = await axiosInstance.put(`/api/catalog/${editingItem.id}`, data);
      } else {
        result = await axiosInstance.post('/api/catalog', data);
      }

      if (result.success) {
        toast.success(editingItem ? 'Catalog item updated successfully' : 'Catalog item created successfully');
        fetchCatalogItems();
      } else {
        toast.error('Failed to save catalog item');
      }
    } catch (error) {
      console.error('Error saving catalog item:', error);
      toast.error('Error saving catalog item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this catalog item?')) return;

    try {
      const result: any = await axiosInstance.delete(`/api/catalog/${id}`);
      if (result.success) {
        toast.success('Catalog item deleted successfully');
        fetchCatalogItems();
      } else {
        toast.error('Failed to delete catalog item');
      }
    } catch (error) {
      console.error('Error deleting catalog item:', error);
      toast.error('Error deleting catalog item');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const result: any = await axiosInstance.patch(`/api/catalog/${id}`);
      if (result.success) {
        toast.success(`Catalog item ${result.data.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchCatalogItems();
      } else {
        toast.error('Failed to toggle catalog item status');
      }
    } catch (error) {
      console.error('Error toggling catalog item status:', error);
      toast.error('Error toggling catalog item status');
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}${url}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Catalog Management</h2>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Catalog Item
        </button>
      </div>

      {catalogItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {catalogItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {item.image1Url && (
                        <img 
                          src={getImageUrl(item.image1Url)} 
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 max-w-md">{item.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">Position: {item.position}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.isActive
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={item.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {item.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed">
          <p className="text-gray-500 mb-4">No catalog items configured yet.</p>
          <button
            onClick={handleOpenCreateModal}
            className="text-blue-600 hover:underline"
          >
            Create one now
          </button>
        </div>
      )}

      <CatalogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        onSave={handleSave}
      />
    </div>
  );
}