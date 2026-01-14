'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ImageIcon, LinkIcon, Calendar, Search, ToggleLeft, ToggleRight, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Category, Subcategory } from '@/types/category';
import { categoryService } from '@/services/categoryService';
import { Urbanist } from 'next/font/google';
import { getImageUrl } from '@/lib/api';

const urbanist = Urbanist({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

// Add these interfaces for temporary subcategories
interface TempSubcategory {
  name: string;
  isActive: boolean;
  sortOrder: number;
}

const CategoriesPage = () => {
  // State for categories and loading
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubcategorySubmitting, setIsSubcategorySubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteSubcategoryModalOpen, setIsDeleteSubcategoryModalOpen] = useState(false);

  // State for editing
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

  // State for forms
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    link: '',
    isActive: true,
    sortOrder: 0,
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    categoryId: '',
    isActive: true,
    sortOrder: 0,
  });

  // State for temporary subcategories (when creating a new category)
  const [tempSubcategories, setTempSubcategories] = useState<TempSubcategory[]>([
    { name: '', isActive: true, sortOrder: 1 }
  ]);

  // State for file uploads
  const [selectedIcon, setSelectedIcon] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [imagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [selectedDesktopBreadcrumb, setSelectedDesktopBreadcrumb] = useState<File | null>(null);
  const [selectedMobileBreadcrumb, setSelectedMobileBreadcrumb] = useState<File | null>(null);
  const [desktopBreadcrumbPreview, setDesktopBreadcrumbPreview] = useState<string | null>(null);
  const [mobileBreadcrumbPreview, setMobileBreadcrumbPreview] = useState<string | null>(null);

  // Add state for new subcategory name input
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  // State for delete confirmations
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);

  // State for expanded categories (to show subcategories)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Fetch categories with subcategories
  const fetchCategoriesWithSubcategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await categoryService.getAllCategories();

      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to fetch categories on mount
  useEffect(() => {
    fetchCategoriesWithSubcategories();
  }, [fetchCategoriesWithSubcategories]);

  // Reset temporary subcategories
  const resetTempSubcategories = () => {
    setTempSubcategories([{ name: '', isActive: true, sortOrder: 1 }]);
  };

  // Validate temporary subcategories
  const validateTempSubcategories = () => {
    // Check if any subcategory has a name but it's empty
    const hasInvalidSubcategory = tempSubcategories.some(sub =>
      sub.name.trim() !== '' && !sub.name.trim()
    );

    // Also check if there are any subcategories with empty names
    const hasEmptyNamedSubcategory = tempSubcategories.some(sub =>
      sub.name.trim() === ''
    );

    if (hasInvalidSubcategory || hasEmptyNamedSubcategory) {
      toast.error('Subcategory names cannot be empty');
      return false;
    }

    return true;
  };

  // Handle adding temporary subcategory by name
  const handleAddTempSubcategoryByName = (name: string) => {
    if (!name.trim()) return;

    setTempSubcategories(prev => [
      ...prev,
      {
        name: name.trim(),
        isActive: true,
        sortOrder: prev.length + 1
      }
    ]);
    setNewSubcategoryName(''); // Clear the input
  };

  // Handle removing temporary subcategory
  const handleRemoveTempSubcategory = (index: number) => {
    setTempSubcategories(prev => prev.filter((_, i) => i !== index));
  };

  // Open category modal for creating
  const openCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      title: '',
      link: '',
      isActive: true,
      sortOrder: 0,
    });
    resetTempSubcategories();
    setSelectedIcon(null);
    setSelectedImage(null);
    setIconPreview(null);
    setSelectedImagePreview(null);
    setSelectedDesktopBreadcrumb(null);
    setSelectedMobileBreadcrumb(null);
    setDesktopBreadcrumbPreview(null);
    setMobileBreadcrumbPreview(null);
    setIsModalOpen(true);
  };

  // Open category modal for editing
  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      title: category.title,
      link: category.link || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder || 0,
    });
    setSelectedIcon(null);
    setSelectedImage(null);
    setIconPreview(category.iconUrl);
    setSelectedImagePreview(category.imageUrl);
    setSelectedDesktopBreadcrumb(null);
    setSelectedMobileBreadcrumb(null);
    setDesktopBreadcrumbPreview(category.desktopBreadcrumbUrl || null);
    setMobileBreadcrumbPreview(category.mobileBreadcrumbUrl || null);
    setIsModalOpen(true);
  };

  // Open subcategory modal for creating
  const openSubcategoryModal = (categoryId: string) => {
    setEditingSubcategory(null);
    setSubcategoryForm({
      name: '',
      categoryId: categoryId,
      isActive: true,
      sortOrder: 0,
    });
    setIsSubcategoryModalOpen(true);
  };

  // Open subcategory modal for editing
  const openEditSubcategoryModal = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name,
      categoryId: subcategory.categoryId,
      isActive: subcategory.isActive,
      sortOrder: subcategory.sortOrder,
    });
    setIsSubcategoryModalOpen(true);
  };

  // Handle category form changes
  const handleCategoryFormChange = (field: string, value: string | boolean | number) => {
    setCategoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle subcategory form changes
  const handleSubcategoryFormChange = (field: string, value: string | boolean | number) => {
    setSubcategoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file selection for icons
  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedIcon(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  // Handle file selection for images
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setSelectedImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle file selection for desktop breadcrumb
  const handleDesktopBreadcrumbSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedDesktopBreadcrumb(file);
      setDesktopBreadcrumbPreview(URL.createObjectURL(file));
    }
  };

  // Handle file selection for mobile breadcrumb
  const handleMobileBreadcrumbSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedMobileBreadcrumb(file);
      setMobileBreadcrumbPreview(URL.createObjectURL(file));
    }
  };

  // Handle create/edit category
  const handleCategorySubmit = async () => {
    // Validate category title
    if (!categoryForm.title.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    // Validate link format only if provided
    if (categoryForm.link && categoryForm.link.trim() && !categoryForm.link.startsWith('/')) {
      toast.error('Link must start with a forward slash (e.g., /products, /about)');
      return;
    }

    // Validate temporary subcategories if creating a new category
    if (!editingCategory && tempSubcategories.length > 0) {
      // Filter out empty subcategories and validate the rest
      const validSubcategories = tempSubcategories.filter(sub => sub.name.trim() !== '');

      if (validSubcategories.some(sub => !sub.name.trim())) {
        toast.error('Subcategory names cannot be empty');
        return;
      }

      // Update tempSubcategories to only include valid ones
      if (validSubcategories.length !== tempSubcategories.length) {
        setTempSubcategories(validSubcategories);
      }
    }

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        // For editing, use the existing endpoint
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('title', categoryForm.title);
        if (categoryForm.link && categoryForm.link.trim()) {
          formData.append('link', categoryForm.link.trim());
        }
        formData.append('isActive', categoryForm.isActive ? 'true' : 'false'); // Convert boolean to string
        formData.append('sortOrder', String(categoryForm.sortOrder ?? 0));

        // Handle icon upload
        if (selectedIcon) {
          formData.append('icon', selectedIcon);
        } else if (editingCategory && editingCategory.iconUrl) {
          formData.append('iconUrl', editingCategory.iconUrl);
        }

        // Handle image upload
        if (selectedImage) {
          formData.append('image', selectedImage);
        } else if (editingCategory && editingCategory.imageUrl) {
          formData.append('imageUrl', editingCategory.imageUrl);
        }

        if (selectedDesktopBreadcrumb) {
          formData.append('desktopBreadcrumb', selectedDesktopBreadcrumb);
        } else if (editingCategory && editingCategory.desktopBreadcrumbUrl) {
          formData.append('desktopBreadcrumbUrl', editingCategory.desktopBreadcrumbUrl);
        }

        if (selectedMobileBreadcrumb) {
          formData.append('mobileBreadcrumb', selectedMobileBreadcrumb);
        } else if (editingCategory && editingCategory.mobileBreadcrumbUrl) {
          formData.append('mobileBreadcrumbUrl', editingCategory.mobileBreadcrumbUrl);
        }

        // Use the category service for updating
        const response = await categoryService.updateCategory(editingCategory.id, formData);

        if (response.success) {
          toast.success('Category updated successfully!');
          fetchCategoriesWithSubcategories();
          setIsModalOpen(false);
          setEditingCategory(null);
          resetTempSubcategories();
          // Reset file states
          setSelectedIcon(null);
          setSelectedImage(null);
          setIconPreview(null);
          setSelectedImagePreview(null);
        } else {
          // Show detailed error message
          const errorMessage = response.message || 'Failed to save category';
          toast.error(errorMessage);
          // Log validation errors for debugging
          if (response.errors && response.errors.length > 0) {
            console.error('Validation errors:', response.errors);
          }
        }
      } else {
        // For creating new category with subcategories, use the new single endpoint
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('title', categoryForm.title);
        if (categoryForm.link && categoryForm.link.trim()) {
          formData.append('link', categoryForm.link.trim());
        }
        formData.append('isActive', categoryForm.isActive ? 'true' : 'false'); // Convert boolean to string
        formData.append('sortOrder', String(categoryForm.sortOrder ?? 0));

        // Add subcategories as JSON string (filter out empty ones)
        const validSubcategories = tempSubcategories.filter(sub => sub.name.trim() !== '');
        if (validSubcategories.length > 0) {
          formData.append('subcategories', JSON.stringify(validSubcategories));
        }

        // Handle icon upload
        if (selectedIcon) {
          formData.append('icon', selectedIcon);
        }

        // Handle image upload
        if (selectedImage) {
          formData.append('image', selectedImage);
        }

        // Handle breadcrumbs upload
        if (selectedDesktopBreadcrumb) {
          formData.append('desktopBreadcrumb', selectedDesktopBreadcrumb);
        }
        if (selectedMobileBreadcrumb) {
          formData.append('mobileBreadcrumb', selectedMobileBreadcrumb);
        }

        // Use the category service for creating
        const response = await categoryService.createCategory(formData);

        if (response.success) {
          toast.success('Category and subcategories created successfully!');
          fetchCategoriesWithSubcategories();
          setIsModalOpen(false);
          setEditingCategory(null);
          resetTempSubcategories();
          // Reset file states
          setSelectedIcon(null);
          setSelectedImage(null);
          setIconPreview(null);
          setSelectedImagePreview(null);
          setSelectedDesktopBreadcrumb(null);
          setSelectedMobileBreadcrumb(null);
          setDesktopBreadcrumbPreview(null);
          setMobileBreadcrumbPreview(null);
        } else {
          // Show detailed error message
          const errorMessage = response.message || 'Failed to save category';
          toast.error(errorMessage);
          // Log validation errors for debugging
          if (response.errors && response.errors.length > 0) {
            console.error('Validation errors:', response.errors);
          }
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle create/edit subcategory
  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubcategorySubmitting(true);
      let response;

      if (editingSubcategory) {
        response = await categoryService.updateSubcategory(editingSubcategory.id, subcategoryForm);
      } else {
        // For creating a new subcategory, we need the category ID
        if (!subcategoryForm.categoryId) {
          toast.error('Category ID is required');
          return;
        }
        response = await categoryService.createSubcategory(subcategoryForm.categoryId, subcategoryForm);
      }

      if (response.success) {
        toast.success(editingSubcategory ? 'Subcategory updated successfully!' : 'Subcategory created successfully!');
        fetchCategoriesWithSubcategories();
        setIsSubcategoryModalOpen(false);
        setEditingSubcategory(null);
      } else {
        toast.error(response.message || 'Failed to save subcategory');
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error('Failed to save subcategory');
    } finally {
      setIsSubcategorySubmitting(false);
    }
  };

  // Open delete confirmation modal for category
  const openDeleteCategoryModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  // Open delete confirmation modal for subcategory
  const openDeleteSubcategoryModal = (subcategory: Subcategory) => {
    setSubcategoryToDelete(subcategory);
    setIsDeleteSubcategoryModalOpen(true);
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await categoryService.deleteCategory(categoryToDelete.id);

      if (response.success) {
        toast.success('Category deleted successfully!');
        fetchCategoriesWithSubcategories();
      } else {
        toast.error(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Handle delete subcategory
  const handleDeleteSubcategory = async () => {
    if (!subcategoryToDelete) return;

    try {
      const response = await categoryService.deleteSubcategory(subcategoryToDelete.id);

      if (response.success) {
        toast.success('Subcategory deleted successfully!');
        fetchCategoriesWithSubcategories();
      } else {
        toast.error(response.message || 'Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    } finally {
      setIsDeleteSubcategoryModalOpen(false);
      setSubcategoryToDelete(null);
    }
  };

  // Handle toggle status for category
  const handleToggleCategoryStatus = async (id: string) => {
    try {
      const response = await categoryService.toggleCategoryStatus(id);

      if (response.success) {
        toast.success('Category status updated!');
        fetchCategoriesWithSubcategories();
      } else {
        toast.error(response.message || 'Failed to update category status');
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Failed to update category status');
    }
  };

  // Handle toggle status for subcategory
  const handleToggleSubcategoryStatus = async (id: string) => {
    try {
      const response = await categoryService.toggleSubcategoryStatus(id);

      if (response.success) {
        toast.success('Subcategory status updated!');
        fetchCategoriesWithSubcategories();
      } else {
        toast.error(response.message || 'Failed to update subcategory status');
      }
    } catch (error) {
      console.error('Error toggling subcategory status:', error);
      toast.error('Failed to update subcategory status');
    }
  };

  // Toggle expanded category to show/hide subcategories
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <DashboardLayout showBreadcrumb={true}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold italic text-black">Category Management</h1>
            <p className="text-black text-lg">Manage your main product categories and subcategories</p>
          </div>
          <button
            onClick={openCategoryModal}
            className="bg-[#DFC97E] rounded-sm text-xl text-black px-3 py-3  transition-colors font-medium flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search categories"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black placeholder-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories List */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-black">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-black">
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No categories found</h3>
              <p className="text-gray-500 mb-4 text-xl">Create your first category to get started</p>
              <button
                onClick={openCategoryModal}
                className="bg-[#DFC97E] text-black text-2xl px-6 py-2 rounded-lg  transition-colors flex items-center justify-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Category
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {categories
              .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((category) => {
                const isExpanded = expandedCategory === category.id;

                return (
                  <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    {/* Category Header - Name, Icon, Image */}
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {/* Category Icon/Image */}
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            {category.imageUrl ? (
                              <img
                                src={category.imageUrl?.startsWith('http') ? category.imageUrl : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}${category.imageUrl.startsWith('/') ? category.imageUrl : `/${category.imageUrl}`}`}
                                alt={category.title}
                                className="w-full h-full object-cover"
                                onLoad={() => console.log('Image loaded successfully:', category.imageUrl)}
                                onError={(e) => {
                                  console.error('Image failed to load:', category.imageUrl);
                                  // Show placeholder on error
                                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Category Info */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {category.title}
                            </h3>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <LinkIcon className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="truncate">{category.link || 'No link'}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{new Date(category.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Category Actions */}
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => toggleCategoryExpansion(category.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Category Action Buttons */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => openSubcategoryModal(category.id)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Subcategory
                        </button>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditCategoryModal(category)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleCategoryStatus(category.id)}
                            className={`text-sm font-medium transition-colors flex items-center ${category.isActive
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-green-600 hover:text-green-700'
                              }`}
                          >
                            {category.isActive ? (
                              <>
                                <ToggleLeft className="w-4 h-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-4 h-4 mr-1" />
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => openDeleteCategoryModal(category)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subcategories Section - Moved to bottom */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">Subcategories ({category.subcategories?.length || 0})</h4>
                          </div>

                          {category.subcategories && category.subcategories.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-gray-500 text-sm">No subcategories yet</p>
                              <button
                                onClick={() => openSubcategoryModal(category.id)}
                                className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                + Add First Subcategory
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {category.subcategories?.map((subcategory) => (
                                <div key={subcategory.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                  <span className="text-black text-sm font-medium">{subcategory.name}</span>
                                  <div className="ml-2 flex items-center space-x-1">
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${subcategory.isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                      }`}>
                                      {subcategory.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <button
                                      onClick={() => openEditSubcategoryModal(subcategory)}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => openDeleteSubcategoryModal(subcategory)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Category Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-black">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Details Section */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Category Details</h3>

                  {/* Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.title}
                      onChange={(e) => handleCategoryFormChange('title', e.target.value)}
                      placeholder="Enter category name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-black"
                    />
                  </div>

                  {/* Link */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">
                      Internal Link *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.link}
                      onChange={(e) => handleCategoryFormChange('link', e.target.value)}
                      placeholder="Enter the redirector url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-black"
                    />
                    <p className="text-xs text-gray-500 mt-1">Required. Enter a relative path (e.g., /products/rings) or full URL for internal navigation.</p>
                  </div>

                  {/* Icon Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">
                      Category Icon *
                    </label>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload category icon</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleIconSelect}
                            className="hidden"
                            id="icon-upload"
                          />
                          <label
                            htmlFor="icon-upload"
                            className="bg-[#9A8873] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Icon
                          </label>
                        </div>
                      </div>
                      {iconPreview && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Icon Preview:</p>
                          <img
                            src={(iconPreview.startsWith('http') || iconPreview.startsWith('blob:') || iconPreview.startsWith('data:')) ? iconPreview : getImageUrl(iconPreview)}
                            alt="Icon Preview"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                            onError={(e) => {
                              console.error('Icon preview failed to load:', iconPreview);
                              e.currentTarget.src = 'https://via.placeholder.com/64x64?text=No+Icon';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">
                      Category Image
                    </label>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <div className="flex flex-col items-center">
                          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload category image</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="category-image-upload"
                          />
                          <label
                            htmlFor="category-image-upload"
                            className="bg-[#9A8873] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer flex items-center"
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Choose Image
                          </label>
                        </div>
                      </div>
                      {imagePreview && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                          <img
                            src={(imagePreview.startsWith('http') || imagePreview.startsWith('blob:') || imagePreview.startsWith('data:')) ? imagePreview : getImageUrl(imagePreview)}
                            alt="Image Preview"
                            className="w-full h-auto object-cover rounded-lg border border-gray-300"
                            onError={(e) => {
                              console.error('Image preview failed to load:', imagePreview);
                              e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
                            }}
                          />
                        </div>
                      )}
                      {selectedImage && !imagePreview && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Selected Image: {selectedImage.name}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop Breadcrumb Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">
                      Breadcrumb Image (Desktop)
                    </label>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <div className="flex flex-col items-center">
                          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload desktop breadcrumb</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleDesktopBreadcrumbSelect}
                            className="hidden"
                            id="desktop-breadcrumb-upload"
                          />
                          <label
                            htmlFor="desktop-breadcrumb-upload"
                            className="bg-[#9A8873] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer flex items-center"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                          </label>
                        </div>
                      </div>
                      {desktopBreadcrumbPreview && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Preview:</p>
                          <img
                            src={(desktopBreadcrumbPreview.startsWith('http') || desktopBreadcrumbPreview.startsWith('blob:') || desktopBreadcrumbPreview.startsWith('data:')) ? desktopBreadcrumbPreview : getImageUrl(desktopBreadcrumbPreview)}
                            alt="Desktop Breadcrumb Preview"
                            className="w-full h-auto object-cover rounded-lg border border-gray-300"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/400x100?text=No+Image';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Breadcrumb Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">
                      Breadcrumb Image (Mobile)
                    </label>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <div className="flex flex-col items-center">
                          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload mobile breadcrumb</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMobileBreadcrumbSelect}
                            className="hidden"
                            id="mobile-breadcrumb-upload"
                          />
                          <label
                            htmlFor="mobile-breadcrumb-upload"
                            className="bg-[#9A8873] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer flex items-center"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                          </label>
                        </div>
                      </div>
                      {mobileBreadcrumbPreview && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Preview:</p>
                          <img
                            src={(mobileBreadcrumbPreview.startsWith('http') || mobileBreadcrumbPreview.startsWith('blob:') || mobileBreadcrumbPreview.startsWith('data:')) ? mobileBreadcrumbPreview : getImageUrl(mobileBreadcrumbPreview)}
                            alt="Mobile Breadcrumb Preview"
                            className="w-full h-auto object-cover rounded-lg border border-gray-300"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/200x100?text=No+Image';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>




                  {/* Subcategories Section - Moved above Status */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Subcategories</h3>
                        {!editingCategory && tempSubcategories.length > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({tempSubcategories.filter(s => s.name.trim()).length} added)
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          // Focus on the subcategory input field
                          const inputElement = document.querySelector('input[placeholder="Enter subcategory name"]') as HTMLInputElement;
                          if (inputElement) {
                            inputElement.focus();
                          }
                        }}
                        disabled={!categoryForm.title.trim()}
                        className={`text-sm font-medium transition-colors flex items-center ${categoryForm.title.trim()
                          ? 'text-purple-600 hover:text-purple-700'
                          : 'text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Subcategory
                      </button>
                    </div>

                    {/* Instructions for new categories */}
                    {!editingCategory && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>Tip:</strong> You can add subcategories now and they will be saved when you create the category.
                        </p>
                      </div>
                    )}

                    {/* Display existing subcategories if editing */}
                    {editingCategory && editingCategory.subcategories && editingCategory.subcategories.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                        {editingCategory.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">{subcategory.name}</span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditSubcategoryModal(subcategory)}
                                className="text-blue-600 hover:text-blue-700 text-xs flex items-center"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteSubcategoryModal(subcategory)}
                                className="text-red-600 hover:text-red-700 text-xs flex items-center"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Display temporary subcategories when creating new category */}
                    {!editingCategory && (
                      <div className="mb-4">
                        {/* Input field for adding new subcategories */}
                        <div className="flex mb-3">
                          <input
                            type="text"
                            value={newSubcategoryName}
                            onChange={(e) => setNewSubcategoryName(e.target.value)}
                            placeholder="Enter subcategory name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg text-black placeholder-gray-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newSubcategoryName.trim()) {
                                handleAddTempSubcategoryByName(newSubcategoryName.trim());
                                setNewSubcategoryName('');
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (newSubcategoryName.trim()) {
                                handleAddTempSubcategoryByName(newSubcategoryName.trim());
                                setNewSubcategoryName('');
                              }
                            }}
                            className="bg-[#9A8873] text-white px-4 py-2 rounded-r-lg hover:bg-[#242f40] transition-colors"
                          >
                            Add
                          </button>
                        </div>

                        {/* Display added subcategories as chips */}
                        <div className="flex flex-wrap gap-2">
                          {tempSubcategories.map((subcategory, index) => (
                            <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                              <span className="text-black text-sm font-medium">{subcategory.name}</span>
                              <button
                                onClick={() => handleRemoveTempSubcategory(index)}
                                className="ml-2 text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message when no subcategories exist */}
                    {editingCategory && (!editingCategory.subcategories || editingCategory.subcategories.length === 0) && (
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-sm">No subcategories added yet</p>
                        <button
                          onClick={() => openSubcategoryModal(editingCategory.id)}
                          className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          + Add First Subcategory
                        </button>
                      </div>
                    )}

                    {/* Message when creating new category with no temp subcategories */}
                    {!editingCategory && tempSubcategories.length === 0 && (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          No subcategories added yet
                        </p>
                        <button
                          onClick={() => {
                            // Focus on the subcategory input field
                            const inputElement = document.querySelector('input[placeholder="Enter subcategory name"]') as HTMLInputElement;
                            if (inputElement) {
                              inputElement.focus();
                            }
                          }}
                          className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          + Add First Subcategory
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Active Status - Moved below Subcategories */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Status
                    </label>
                    <select
                      value={categoryForm.isActive ? 'active' : 'inactive'}
                      onChange={(e) => handleCategoryFormChange('isActive', e.target.value === 'active')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={categoryForm.sortOrder}
                      onChange={(e) => handleCategoryFormChange('sortOrder', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCategorySubmit}
                  disabled={!categoryForm.title.trim() || isSubmitting}
                  className={`px-4 py-2 rounded-lg transition-colors ${categoryForm.title.trim() && !isSubmitting
                    ? 'bg-[#9A8873] text-white hover:bg-[#242f40]'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                </button>
              </div>
            </div>
          </div>
        )
        }

        {/* Subcategory Modal */}
        {
          isSubcategoryModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                    </h2>
                    <button
                      onClick={() => setIsSubcategoryModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubcategorySubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={subcategoryForm.name}
                          onChange={(e) => handleSubcategoryFormChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                          placeholder="Subcategory name"
                          required
                        />
                      </div>

                      {!editingSubcategory && (
                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            Category *
                          </label>
                          <select
                            value={subcategoryForm.categoryId}
                            onChange={(e) => handleSubcategoryFormChange('categoryId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                            required
                          >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Sort Order
                        </label>
                        <input
                          type="number"
                          value={subcategoryForm.sortOrder}
                          onChange={(e) => handleSubcategoryFormChange('sortOrder', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={subcategoryForm.isActive}
                          onChange={(e) => handleSubcategoryFormChange('isActive', e.target.checked)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-black">
                          Active
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsSubcategoryModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubcategorySubmitting}
                        className={`px-4 py-2 rounded-lg transition-colors ${isSubcategorySubmitting ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                      >
                        {isSubcategorySubmitting ? 'Saving...' : (editingSubcategory ? 'Update' : 'Create')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )
        }

        {/* Delete Category Confirmation Modal */}
        {
          isDeleteModalOpen && categoryToDelete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-black">Confirm Delete</h2>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-black mb-4">
                    Are you sure you want to delete the category "<strong>{categoryToDelete.title}</strong>"?
                  </p>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. All products and subcategories associated with this category may be affected.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCategory}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Delete Subcategory Confirmation Modal */}
        {
          isDeleteSubcategoryModalOpen && subcategoryToDelete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-black">Confirm Delete</h2>
                  <button
                    onClick={() => setIsDeleteSubcategoryModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-black mb-4">
                    Are you sure you want to delete the subcategory "<strong>{subcategoryToDelete.name}</strong>"?
                  </p>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsDeleteSubcategoryModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteSubcategory}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </DashboardLayout >
  );
}

export default CategoriesPage;
