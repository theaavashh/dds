'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

interface TopBanner {
  id: string;
  title: string;
  subtitle: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  link: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBanner: TopBanner | null;
  onSave: (data: FormData) => void;
}

function BannerModal({ isOpen, onClose, editingBanner, onSave }: BannerModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    link: '',
    isActive: true
  });
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (editingBanner) {
      setFormData({
        title: editingBanner.title,
        subtitle: editingBanner.subtitle,
        link: editingBanner.link,
        isActive: editingBanner.isActive
      });
      setDesktopPreview(editingBanner.desktopImageUrl);
      setMobilePreview(editingBanner.mobileImageUrl);
    } else {
      setFormData({
        title: '',
        subtitle: '',
        link: '',
        isActive: true
      });
      setDesktopImage(null);
      setMobileImage(null);
      setDesktopPreview(null);
      setMobilePreview(null);
    }
  }, [editingBanner, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setImage: (file: File | null) => void, setPreview: (url: string | null) => void, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subtitle', formData.subtitle);
    data.append('link', formData.link);
    data.append('isActive', formData.isActive.toString());
    
    if (desktopImage) data.append('desktopImage', desktopImage);
    if (mobileImage) data.append('mobileImage', mobileImage);
    
    onSave(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {editingBanner ? 'Edit Top Banner' : 'Add New Top Banner'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter banner title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter banner subtitle"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link/URL
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desktop Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setDesktopImage, setDesktopPreview, 'desktopImage')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {desktopPreview && (
                  <div className="mt-2">
                    <img src={desktopPreview} alt="Desktop preview" className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setMobileImage, setMobilePreview, 'mobileImage')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {mobilePreview && (
                  <div className="mt-2">
                    <img src={mobilePreview} alt="Mobile preview" className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
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
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
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
                {editingBanner ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function TopBannerManagement() {
  const [banners, setBanners] = useState<TopBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<TopBanner | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const result: any = await axiosInstance.get('/api/banners');
      if (result.success && result.data) {
        setBanners(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch banners', error);
      toast.error('Failed to fetch banners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: TopBanner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleSave = async (data: FormData) => {
    try {
      let result: any;
      if (editingBanner) {
        result = await axiosInstance.put(`/api/banners/${editingBanner.id}`, data);
      } else {
        result = await axiosInstance.post('/api/banners', data);
      }

      if (result.success) {
        toast.success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully');
        fetchBanners();
      } else {
        toast.error('Failed to save banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Error saving banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const result: any = await axiosInstance.delete(`/api/banners/${id}`);
      if (result.success) {
        toast.success('Banner deleted successfully');
        fetchBanners();
      } else {
        toast.error('Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Error deleting banner');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result: any = await axiosInstance.patch(`/api/banners/${id}`, {
        isActive: !currentStatus
      });
      if (result.success) {
        toast.success(`Banner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchBanners();
      } else {
        toast.error('Failed to update banner status');
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast.error('Error updating banner status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Top Banner Management</h2>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Banner
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {banners.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No banners found. Create your first banner to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Banner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={banner.desktopImageUrl} 
                            alt={banner.title} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                          <div className="text-sm text-gray-500">{banner.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{banner.title}</div>
                      {banner.link && (
                        <div className="text-sm text-gray-500">
                          <a href={banner.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                            {banner.link}
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        banner.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(banner.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(banner.id, banner.isActive)}
                          className={`p-1 rounded hover:bg-gray-100 ${
                            banner.isActive ? 'text-yellow-600' : 'text-green-600'
                          }`}
                          title={banner.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(banner)}
                          className="p-1 text-blue-600 rounded hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="p-1 text-red-600 rounded hover:bg-gray-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingBanner={editingBanner}
        onSave={handleSave}
      />
    </div>
  );
}