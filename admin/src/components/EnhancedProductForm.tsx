'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Upload, Eye, EyeOff, AlertCircle, Link, Search, Hash, Globe, Image as ImageIcon, Target, ExternalLink, FileText, DollarSign, Package, Camera, Truck, Settings, Percent, Calculator, ShoppingCart, Minus, X, Star, Flame, Gift, Sparkles, Award, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import Image from 'next/image';
import { productSchema, ProductFormData } from '@/schemas/productSchema';

interface Category {
  id: string;
  name: string;
  parentId?: string;
  children?: Array<{
    id: string;
    name: string;
    parentId?: string;
    _count?: { products: number };
  }>;
  _count?: { products: number };
}

interface Brand {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

interface EnhancedProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: any;
  isLoading?: boolean;
  categories: Category[];
  brands: Brand[];
}

const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  categories,
  brands
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    getValues,
    trigger
  } = useForm<any>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      productCode: '',
      description: '',
      fullDescription: '',
      category: '',
      subCategory: '',
      status: 'draft',
      price: 0,
      comparePrice: 0,
      costPrice: 0,
      discountPrice: 0,
      discountPercentage: 0,
      stock: 0,
      isActive: true,
      digitalBrowser: false,
      distributor: false,
      website: false,
      normalUser: false,
      resellerUser: false,
      culture: '',
      goldWeight: '',
      goldPurity: '',
      goldType: '',
      goldCraftsmanship: '',
      goldDesignDescription: '',
      goldFinishedType: '',
      goldStones: '',
      goldStoneQuality: '',
      diamondType: '',
      diamondShapeCut: '',
      diamondColorGrade: '',
      diamondClarityGrade: '',
      diamondCutGrade: '',
      diamondMetalDetails: '',
      diamondCertification: '',
      diamondOrigin: '',
      diamondCaratWeight: '',
      diamondDetails: '',
      diamondQuantity: 0,
      diamondSize: '',
      diamondWeight: '',
      diamondQuality: '',
      platinumType: '',
      platinumWeight: '',
      silverType: '',
      silverWeight: '',
      jewelryType: '',
      materialType: '',
      metalType: '',
      finish: '',
      orderDuration: '',
      imageUrl: '', // Main Image
      images: [], // Gallery Images
      videoUrl: '',
      sku: '',
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      minOrderQuantity: 1,
      maxOrderQuantity: 999,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      seoSlug: '',
      metaDescription: '',
      canonicalUrl: '',
      robotsMeta: 'index, follow',
      seoFriendlyImageFilename: '',
      imageAltText: '',
      imageTitle: '',
      imageWidth: 0,
      imageHeight: 0,
      lazyLoading: true,
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterCard: '',
      optimizedImageFormat: 'webp',
      productSchema: null,
      offerSchema: null,
      brandSchema: null,
      breadcrumbSchema: null,
      itemListSchema: null,
      faqSchema: null,
      tags: [],
      isFeatured: false,
      isDigital: false,
      requiresShipping: true,
      trackQuantity: true,
      allowBackorder: false,
      variants: [],
    }
  });

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'jewelry', label: 'Jewelry Details', icon: Sparkles },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'media', label: 'Media', icon: Camera },
    { id: 'seo', label: 'SEO & Social', icon: Search },
  ];

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePreviousTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  // Watch category for auto-filling
  const watchedCategory = watch('category');

  useEffect(() => {
    if (watchedCategory) {
      // Clear sub-category when main category changes
      setValue('subCategory', '');
    }
  }, [watchedCategory, setValue]);

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags' as const
  });

  const { fields: keywordFields, append: appendKeyword, remove: removeKeyword } = useFieldArray({
    control,
    name: 'seo.keywords' as const
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants' as const
  });

  const watchedImages = watch('images') || [];
  const watchedTags = watch('tags') || [];
  const watchedKeywords = watch('seo.keywords') || [];

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Map initialData from Prisma to Form structure
        const formattedData = {
          ...initialData,
          // Handle images relation - map to URLs for preview if they are objects
          images: initialData.images?.map((img: any) => typeof img === 'string' ? img : img.url) || [],
          // Ensure dimensions object exists
          dimensions: initialData.dimensions || { length: 0, width: 0, height: 0 },
        };
        reset(formattedData);
        // Set preview images
        const galleryUrls = formattedData.images || [];
        const mainUrl = initialData.imageUrl ? [initialData.imageUrl] : [];
        setPreviewImages([...mainUrl, ...galleryUrls]);
      } else {
        reset();
        setPreviewImages([]);
      }
    }
  }, [isOpen, initialData, reset]);

  // Auto-generate slug from name
  const watchedName = watch('name');
  useEffect(() => {
    if (watchedName && !initialData) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [watchedName, setValue, initialData]);

  // Custom submit handler that only validates essential fields
  const onFormSubmit = async (data: any) => {
    try {
      console.log('Submitting form data:', data);
      await onSubmit(data);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages: string[] = [];
    let processedCount = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        newImages[index] = result;
        processedCount++;

        // When all files are processed
        if (processedCount === files.length) {
          // Get current images from form state
          const currentImages = getValues('images') || [];
          // Combine existing images with new ones
          const updatedImages = [...currentImages, ...newImages.filter(img => img !== undefined)];

          // Update both form state and preview
          setValue('images', updatedImages);
          setPreviewImages(updatedImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    // Get current images
    const currentImages = getValues('images') || [];
    // Remove the image at the specified index
    const newImages = currentImages.filter((_: any, i: number) => i !== index);

    // Update both form state and preview
    setValue('images', newImages);
    setPreviewImages(newImages);
  };

  const addTag = () => {
    appendTag('');
  };

  const addKeyword = () => {
    appendKeyword('');
  };

  const mainCategories = useMemo(() =>
    categories.filter((cat: any) => !cat.parentId),
    [categories]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {initialData ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {initialData ? 'Update product information' : 'Create a new product for your store'}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-white">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]">
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Basic Info Tab */}
                  {activeTab === 'basic' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                          </label>
                          <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                placeholder="Enter product name"
                              />
                            )}
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Code *
                          </label>
                          <Controller
                            name="productCode"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                placeholder="Enter Product Code"
                              />
                            )}
                          />
                          {errors.productCode && (
                            <p className="text-red-500 text-sm mt-1">{String(errors.productCode.message)}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                              >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                          {errors.category && (
                            <p className="text-red-500 text-sm mt-1">{String(errors.category.message)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sub-Category
                          </label>
                          <Controller
                            name="subCategory"
                            control={control}
                            render={({ field }) => {
                              const selectedCategoryName = watch('category');
                              const selectedCategory = categories.find(cat => cat.name === selectedCategoryName);
                              const subCategories = selectedCategory?.children || [];

                              return (
                                <select
                                  {...field}
                                  disabled={!selectedCategoryName}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                  <option value="">
                                    {selectedCategoryName ? 'Select Sub-Category' : 'Select a category first'}
                                  </option>
                                  {subCategories.map((sub) => (
                                    <option key={sub.id} value={sub.name}>
                                      {sub.name}
                                    </option>
                                  ))}
                                </select>
                              );
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <textarea
                              {...field}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                              placeholder="General product description"
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Description
                        </label>
                        <Controller
                          name="fullDescription"
                          control={control}
                          render={({ field }) => (
                            <textarea
                              {...field}
                              rows={6}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                              placeholder="In-depth product description"
                            />
                          )}
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-blue-600" />
                          Visibility & Channels
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            { name: 'isActive', label: 'Active Product' },
                            { name: 'website', label: 'Website' },
                            { name: 'distributor', label: 'Distributor' },
                            { name: 'digitalBrowser', label: 'Digital Browser' },
                            { name: 'normalUser', label: 'Normal User' },
                            { name: 'resellerUser', label: 'Reseller User' },
                          ].map(flag => (
                            <Controller
                              key={flag.name}
                              name={flag.name as any}
                              control={control}
                              render={({ field }) => (
                                <label className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-100 hover:border-blue-200 cursor-pointer transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">{flag.label}</span>
                                </label>
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Culture/Tradition
                        </label>
                        <Controller
                          name="culture"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                              placeholder="Nepali, Indian, Western, etc."
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Jewelry Details Tab */}
                  {activeTab === 'jewelry' && (
                    <div className="space-y-8">
                      {/* Gold Details */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center border-b pb-2">
                          <Sparkles className="w-5 h-5 mr-2 text-yellow-600" />
                          Gold Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            { 
                              name: 'goldWeight', 
                              label: 'Gold Weight',
                              isNumber: true
                            },
                            { 
                              name: 'goldPurity', 
                              label: 'Gold Purity',
                              options: ['24K', '22K', '18K', '14K', '10K']
                            },
                            { 
                              name: 'goldType', 
                              label: 'Gold Type',
                              options: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Green Gold', 'Blue Gold', 'Other']
                            },
                            { 
                              name: 'goldCraftsmanship', 
                              label: 'Craftsmanship',
                              options: ['Handmade', 'Machine Made', 'Hand-Finished', 'Traditional', 'Modern', 'Custom']
                            },
                            { 
                              name: 'goldFinishedType', 
                              label: 'Finished Type',
                              options: ['Polished', 'Matte', 'Brushed', 'Hammered', 'Satin', 'Antique', 'Textured', 'Other']
                            },
                            { 
                              name: 'goldStones', 
                              label: 'Gold Stones',
                              options: ['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 'No Stones', 'Mixed Stones', 'Other']
                            },
                            { 
                              name: 'goldStoneQuality', 
                              label: 'Stone Quality',
                              options: ['Premium', 'Excellent', 'Very Good', 'Good', 'Fair', 'Natural', 'Lab-Created', 'Other']
                            },
                          ].map(field => (
                            <div key={field.name}>
                              <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                              <Controller
                                name={field.name as any}
                                control={control}
                                render={({ field: inputField }) => (
                                  field.isNumber ? (
                                    <input
                                      {...inputField}
                                      type="number"
                                      step="0.01"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                                      placeholder={`Enter ${field.label.toLowerCase()}`}
                                    />
                                  ) : field.options ? (
                                    <select
                                      {...inputField}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                                    >
                                      <option value="">Select {field.label}</option>
                                      {field.options.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      {...inputField}
                                      type="text"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                                      placeholder={field.label}
                                    />
                                  )
                                )}
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Design Description</label>
                          <Controller
                            name="goldDesignDescription"
                            control={control}
                            render={({ field }) => (
                              <textarea
                                {...field}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                                placeholder="Describe the gold design..."
                              />
                            )}
                          />
                        </div>
                      </div>

                      {/* Diamond Details */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center border-b pb-2">
                          <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
                          Diamond Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            { 
                              name: 'diamondType', 
                              label: 'Diamond Type',
                              options: ['Natural', 'Lab-Grown', 'Simulant', 'Moissanite', 'Cubic Zirconia', 'Other']
                            },
                            { 
                              name: 'diamondShapeCut', 
                              label: 'Shape/Cut',
                              options: ['Round', 'Princess', 'Cushion', 'Emerald', 'Oval', 'Pear', 'Marquise', 'Heart', 'Asscher', 'Radiant', 'Other']
                            },
                            { 
                              name: 'diamondColorGrade', 
                              label: 'Color Grade',
                              options: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'Fancy', 'Other']
                            },
                            { 
                              name: 'diamondClarityGrade', 
                              label: 'Clarity Grade',
                              options: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3', 'Other']
                            },
                            { 
                              name: 'diamondCutGrade', 
                              label: 'Cut Grade',
                              options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor', 'Ideal', 'Super Ideal', 'Other']
                            },
                            { 
                              name: 'diamondCertification', 
                              label: 'Certification',
                              options: ['GIA', 'IGI', 'AGS', 'HRD', 'EGL', 'GCAL', 'Not Certified', 'Other']
                            },
                            { 
                              name: 'diamondOrigin', 
                              label: 'Origin',
                              options: ['Botswana', 'Russia', 'Canada', 'Australia', 'South Africa', 'India', 'Brazil', 'Unknown', 'Other']
                            },
                            { 
                              name: 'diamondCaratWeight', 
                              label: 'Carat Weight',
                              isNumber: true
                            },
                            { 
                              name: 'diamondSize', 
                              label: 'Diamond Size',
                              options: ['Tiny', 'Small', 'Medium', 'Large', 'Extra Large', 'Custom']
                            },
                            { 
                              name: 'diamondWeight', 
                              label: 'Diamond Weight',
                              isNumber: true
                            },
                            { 
                              name: 'diamondQuality', 
                              label: 'Diamond Quality',
                              options: ['Premium', 'Excellent', 'Very Good', 'Good', 'Commercial', 'Industrial', 'Other']
                            },
                          ].map(field => (
                            <div key={field.name}>
                              <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                              <Controller
                                name={field.name as any}
                                control={control}
                                render={({ field: inputField }) => (
                                  field.isNumber ? (
                                    <input
                                      {...inputField}
                                      type="number"
                                      step="0.01"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                                      placeholder={`Enter ${field.label.toLowerCase()}`}
                                    />
                                  ) : field.options ? (
                                    <select
                                      {...inputField}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                                    >
                                      <option value="">Select {field.label}</option>
                                      {field.options.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      {...inputField}
                                      type="text"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                                      placeholder={field.label}
                                    />
                                  )
                                )}
                              />
                            </div>
                          ))}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Diamond Quantity</label>
                            <Controller
                              name="diamondQuantity"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                                  placeholder="Quantity"
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Additional Diamond Details</label>
                          <Controller
                            name="diamondDetails"
                            control={control}
                            render={({ field }) => (
                              <textarea
                                {...field}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                                placeholder="Any other diamond specifics..."
                              />
                            )}
                          />
                        </div>
                      </div>

                      {/* Platinum & Silver Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900 flex items-center border-b pb-2">
                            <Sparkles className="w-5 h-5 mr-2 text-gray-400" />
                            Platinum Details
                          </h3>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Platinum Type</label>
                              <Controller
                                name="platinumType"
                                control={control}
                                render={({ field }) => (
                                  <input {...field} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm" />
                                )}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Platinum Weight</label>
                              <Controller
                                name="platinumWeight"
                                control={control}
                                render={({ field }) => (
                                  <input {...field} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm" />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900 flex items-center border-b pb-2">
                            <Sparkles className="w-5 h-5 mr-2 text-gray-300" />
                            Silver Details
                          </h3>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Silver Type</label>
                              <Controller
                                name="silverType"
                                control={control}
                                render={({ field }) => (
                                  <input {...field} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm" />
                                )}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Silver Weight</label>
                              <Controller
                                name="silverWeight"
                                control={control}
                                render={({ field }) => (
                                  <input {...field} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm" />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* General Jewelry Specs */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center border-b pb-2">
                          <Settings className="w-5 h-5 mr-2 text-gray-600" />
                          General Specifications
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            { 
                              name: 'jewelryType', 
                              label: 'Jewelry Type',
                              options: ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Pendant', 'Bangles', 'Mangalsutra', 'Chain', 'Anklet', 'Brooch', 'Other']
                            },
                            { 
                              name: 'materialType', 
                              label: 'Material Type',
                              options: ['Gold', 'Silver', 'Platinum', 'Diamond', 'Gemstone', 'Mixed Metal', 'Other']
                            },
                            { 
                              name: 'metalType', 
                              label: 'Metal Type',
                              options: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Platinum', 'Silver', 'Sterling Silver', 'Other']
                            },
                            { 
                              name: 'finish', 
                              label: 'Finish',
                              options: ['Polished', 'Matte', 'Brushed', 'Hammered', 'Satin', 'Antique', 'High Polish', 'Other']
                            },
                            { 
                              name: 'orderDuration', 
                              label: 'Order Duration',
                              options: ['1-2 Days', '3-5 Days', '1 Week', '2 Weeks', '1 Month', 'Custom']
                            },
                          ].map(field => (
                            <div key={field.name}>
                              <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                              <Controller
                                name={field.name as any}
                                control={control}
                                render={({ field: inputField }) => (
                                  <select
                                    {...inputField}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                                  >
                                    <option value="">Select {field.label}</option>
                                    {field.options.map(option => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                )}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing Tab */}
                  {activeTab === 'pricing' && (
                    <div className="space-y-6">
                      {/* Basic Pricing */}
                      <div>
                        <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                          <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                          Basic Pricing
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                              <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                              Selling Price (NPR) *
                            </label>
                            <Controller
                              name="price"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="0.00"
                                />
                              )}
                            />
                            {errors.price && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.price.message)}</p>
                            )}
                          </div>

                          <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                              <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                              Compare Price (NPR)
                            </label>
                            <Controller
                              name="comparePrice"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="0.00"
                                />
                              )}
                            />
                            {errors.comparePrice && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.comparePrice.message)}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Original price before discount (for showing strikethrough)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cost & Margin */}
                      <div className="border-t pt-6">
                        <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                          <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                          Cost & Margin
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                              <Calculator className="w-4 h-4 mr-2 text-blue-600" />
                              Cost Price (NPR)
                            </label>
                            <Controller
                              name="costPrice"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="0.00"
                                />
                              )}
                            />
                            {errors.costPrice && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.costPrice.message)}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Your cost to acquire/manufacture this product
                            </p>
                          </div>

                          <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                              <Percent className="w-4 h-4 mr-2 text-blue-600" />
                              Margin (NPR)
                            </label>
                            <Controller
                              name="margin"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="0.00"
                                />
                              )}
                            />
                            {errors.margin && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.margin.message)}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Profit margin (selling price - cost price)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Discount Pricing */}
                      <div className="border-t pt-6">
                        <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                          <Percent className="w-5 h-5 mr-2 text-blue-600" />
                          Discount Pricing
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                              <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                              Discount Price (NPR)
                            </label>
                            <Controller
                              name="discountPrice"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="0.00"
                                />
                              )}
                            />
                            {errors.discountPrice && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.discountPrice.message)}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Special discounted price for promotions
                            </p>
                          </div>

                          <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                              <Percent className="w-4 h-4 mr-2 text-blue-600" />
                              Discount Percentage (%)
                            </label>
                            <Controller
                              name="discountPercentage"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="0.00"
                                />
                              )}
                            />
                            {errors.discountPercentage && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.discountPercentage.message)}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Discount percentage (0-100%)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Variant Pricing */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="flex items-center text-lg font-medium text-gray-900">
                            <Package className="w-5 h-5 mr-2 text-blue-600" />
                            Variant Pricing
                          </h3>
                          <button
                            type="button"
                            onClick={() => appendVariant({
                              name: '',
                              price: 0,
                              comparePrice: 0,
                              costPrice: 0,
                              sku: '',
                              weight: 0,
                              isActive: true
                            })}
                            className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Variant
                          </button>
                        </div>

                        {variantFields.length > 0 ? (
                          <div className="space-y-4">
                            {variantFields.map((field, index) => (
                              <div key={field.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-sm font-medium text-gray-700">Variant {index + 1}</h4>
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="text-red-600 hover:text-red-700 p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Variant Name *
                                    </label>
                                    <Controller
                                      name={`variants.${index}.name`}
                                      control={control}
                                      render={({ field }) => (
                                        <input
                                          {...field}
                                          type="text"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                          placeholder="e.g., 500gm, 1kg, 2kg"
                                        />
                                      )}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Price (NPR) *
                                    </label>
                                    <Controller
                                      name={`variants.${index}.price`}
                                      control={control}
                                      render={({ field }) => (
                                        <input
                                          {...field}
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                          placeholder="0.00"
                                        />
                                      )}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Compare Price (NPR)
                                    </label>
                                    <Controller
                                      name={`variants.${index}.comparePrice`}
                                      control={control}
                                      render={({ field }) => (
                                        <input
                                          {...field}
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                          placeholder="0.00"
                                        />
                                      )}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Cost Price (NPR)
                                    </label>
                                    <Controller
                                      name={`variants.${index}.costPrice`}
                                      control={control}
                                      render={({ field }) => (
                                        <input
                                          {...field}
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                          placeholder="0.00"
                                        />
                                      )}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      SKU
                                    </label>
                                    <Controller
                                      name={`variants.${index}.sku`}
                                      control={control}
                                      render={({ field }) => (
                                        <input
                                          {...field}
                                          type="text"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                          placeholder="Variant SKU"
                                        />
                                      )}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Weight (kg)
                                    </label>
                                    <Controller
                                      name={`variants.${index}.weight`}
                                      control={control}
                                      render={({ field }) => (
                                        <input
                                          {...field}
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                          placeholder="0.00"
                                        />
                                      )}
                                    />
                                  </div>
                                </div>

                                <div className="mt-3 flex items-center">
                                  <Controller
                                    name={`variants.${index}.isActive`}
                                    control={control}
                                    render={({ field }) => (
                                      <label className="flex items-center">
                                        <input
                                          {...field}
                                          type="checkbox"
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Active variant</span>
                                      </label>
                                    )}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No variants added yet</p>
                            <p className="text-xs text-gray-400">Add variants to offer different sizes or quantities</p>
                          </div>
                        )}
                      </div>

                      {/* Order Quantity Limits */}
                      <div className="border-t pt-6">
                        <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                          <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                          Order Quantity Limits
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                              <Minus className="w-4 h-4 mr-2 text-blue-600" />
                              Minimum Order Quantity
                            </label>
                            <Controller
                              name="minOrderQuantity"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  min="1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="1"
                                />
                              )}
                            />
                            {errors.minOrderQuantity && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.minOrderQuantity.message)}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Minimum quantity customers must order
                            </p>
                          </div>

                          <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                              <Plus className="w-4 h-4 mr-2 text-blue-600" />
                              Maximum Order Quantity
                            </label>
                            <Controller
                              name="maxOrderQuantity"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  min="1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="999"
                                />
                              )}
                            />
                            {errors.maxOrderQuantity && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.maxOrderQuantity.message)}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Maximum quantity customers can order
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Inventory Tab */}
                  {activeTab === 'inventory' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Quantity *
                          </label>
                          <Controller
                            name="stock"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                placeholder="0"
                              />
                            )}
                          />
                          {errors.stock && (
                            <p className="text-red-500 text-sm mt-1">{String(errors.stock.message)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weight (kg)
                          </label>
                          <Controller
                            name="weight"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                placeholder="0.00"
                              />
                            )}
                          />
                          {errors.weight && (
                            <p className="text-red-500 text-sm mt-1">{String(errors.weight.message)}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Dimensions (cm)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Length
                            </label>
                            <Controller
                              name="dimensions.length"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="0.00"
                                />
                              )}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Width
                            </label>
                            <Controller
                              name="dimensions.width"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="0.00"
                                />
                              )}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Height
                            </label>
                            <Controller
                              name="dimensions.height"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="0.00"
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Media Tab */}
                  {activeTab === 'media' && (
                    <div className="space-y-8">
                      {/* Main Image */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                          Main Product Image
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                          <div className="space-y-4">
                            <Controller
                              name="imageUrl"
                              control={control}
                              render={({ field }) => (
                                <div className="space-y-4">
                                  <div className="flex gap-2">
                                    <input
                                      {...field}
                                      type="text"
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                                      placeholder="Main image URL"
                                    />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      id="main-image-upload"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = (ev) => {
                                            field.onChange(ev.target?.result);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor="main-image-upload"
                                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors text-sm"
                                    >
                                      Upload
                                    </label>
                                  </div>
                                </div>
                              )}
                            />
                            {errors.imageUrl && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.imageUrl.message)}</p>
                            )}
                          </div>
                          <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                            {watch('imageUrl') ? (
                              <img
                                src={watch('imageUrl')}
                                alt="Main preview"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                <ImageIcon className="w-12 h-12 mb-2" />
                                <span className="text-sm">Main Image Preview</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Gallery Images */}
                      <div className="border-t pt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                          Gallery Images
                        </h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50/50">
                          {previewImages.filter(img => img !== watch('imageUrl')).length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                              {previewImages.filter(img => img !== watch('imageUrl')).map((image, index) => (
                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm">
                                  <img
                                    src={image}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transform scale-0 group-hover:scale-100 transition-transform"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-8 space-y-3">
                              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                              <div className="text-gray-500">
                                <p className="font-medium">No gallery images uploaded</p>
                                <p className="text-xs">Upload additional images for the product gallery</p>
                              </div>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                            id="gallery-upload"
                          />
                          <label
                            htmlFor="gallery-upload"
                            className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 cursor-pointer transition-all shadow-sm font-medium"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Gallery Images
                          </label>
                        </div>
                      </div>

                      {/* Video URL */}
                      <div className="border-t pt-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video URL (YouTube/Vimeo)
                        </label>
                        <Controller
                          name="videoUrl"
                          control={control}
                          render={({ field }) => (
                            <div className="relative">
                              <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                {...field}
                                type="url"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
                                placeholder="https://www.youtube.com/watch?v=..."
                              />
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* SEO & Social Tab */}
                  {activeTab === 'seo' && (
                    <div className="space-y-8">
                      {/* SEO Meta */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
                          <Search className="w-5 h-5 mr-2 text-blue-600" />
                          Search Engine Optimization
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                            <Controller
                              name="seoTitle"
                              control={control}
                              render={({ field }) => (
                                <input {...field} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm" placeholder="Meta title (max 200 chars)" />
                              )}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Slug</label>
                            <Controller
                              name="seoSlug"
                              control={control}
                              render={({ field }) => (
                                <input {...field} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm" placeholder="url-friendly-slug" />
                              )}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                          <Controller
                            name="seoDescription"
                            control={control}
                            render={({ field }) => (
                              <textarea {...field} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm" placeholder="Meta description for search results" />
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                          <Controller
                            name="seoKeywords"
                            control={control}
                            render={({ field }) => (
                              <input {...field} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm" placeholder="keyword1, keyword2, keyword3" />
                            )}
                          />
                        </div>
                      </div>

                      {/* Social Media (OG/Twitter) */}
                      <div className="space-y-4 border-t pt-8">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
                          <Globe className="w-5 h-5 mr-2 text-blue-500" />
                          Social Media Meta
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                            <Controller
                              name="ogTitle"
                              control={control}
                              render={({ field }) => <input {...field} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm" placeholder="Social share title" />}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                            <Controller
                              name="ogImage"
                              control={control}
                              render={({ field }) => <input {...field} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm" placeholder="https://example.com/share-image.jpg" />}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                          <Controller
                            name="ogDescription"
                            control={control}
                            render={({ field }) => <textarea {...field} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm" placeholder="Social share description" />}
                          />
                        </div>
                      </div>

                      {/* Advanced JSON Schema */}
                      <div className="space-y-4 border-t pt-8">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
                          <Eye className="w-5 h-5 mr-2 text-gray-500" />
                          Advanced SEO (JSON-LD)
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">You can paste JSON-LD snippets here for rich results.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['productSchema', 'offerSchema', 'brandSchema', 'faqSchema'].map(schemaName => (
                            <div key={schemaName}>
                              <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{schemaName.replace(/([A-Z])/g, ' $1')}</label>
                              <Controller
                                name={schemaName as any}
                                control={control}
                                render={({ field }) => (
                                  <textarea
                                    {...field}
                                    value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value || ''}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50 text-black"
                                    placeholder="{}"
                                  />
                                )}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Tab */}
                  {activeTab === 'shipping' && (
                    <div className="space-y-6">
                      {/* Shipping Information */}
                      <div>
                        <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                          <Truck className="w-5 h-5 mr-2 text-blue-600" />
                          Shipping Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Country *
                            </label>
                            <Controller
                              name="shippingCountry"
                              control={control}
                              render={({ field }) => (
                                <select
                                  {...field}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                >
                                  <option value="">Select Country</option>
                                  <option value="Nepal">Nepal</option>
                                  <option value="India">India</option>
                                  <option value="Bangladesh">Bangladesh</option>
                                  <option value="Pakistan">Pakistan</option>
                                  <option value="Sri Lanka">Sri Lanka</option>
                                  <option value="Bhutan">Bhutan</option>
                                  <option value="Maldives">Maldives</option>
                                  <option value="Afghanistan">Afghanistan</option>
                                  <option value="China">China</option>
                                  <option value="USA">USA</option>
                                  <option value="UK">UK</option>
                                  <option value="Canada">Canada</option>
                                  <option value="Australia">Australia</option>
                                  <option value="Germany">Germany</option>
                                  <option value="France">France</option>
                                  <option value="Japan">Japan</option>
                                  <option value="South Korea">South Korea</option>
                                  <option value="Singapore">Singapore</option>
                                  <option value="Thailand">Thailand</option>
                                  <option value="Malaysia">Malaysia</option>
                                  <option value="Indonesia">Indonesia</option>
                                  <option value="Philippines">Philippines</option>
                                  <option value="Vietnam">Vietnam</option>
                                  <option value="Other">Other</option>
                                </select>
                              )}
                            />
                            {errors.shippingCountry && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.shippingCountry.message)}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Delivery Charge (NPR) *
                            </label>
                            <Controller
                              name="deliveryCharge"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="0.00"
                                />
                              )}
                            />
                            {errors.deliveryCharge && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.deliveryCharge.message)}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Shipping cost for this product
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Time */}
                      <div className="border-t pt-6">
                        <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                          <Clock className="w-5 h-5 mr-2 text-blue-600" />
                          Delivery Time
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Minimum Delivery Days *
                            </label>
                            <Controller
                              name="minDeliveryDays"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  min="1"
                                  max="30"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="3"
                                />
                              )}
                            />
                            {errors.minDeliveryDays && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.minDeliveryDays.message)}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Minimum days for delivery
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Maximum Delivery Days *
                            </label>
                            <Controller
                              name="maxDeliveryDays"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  min="1"
                                  max="30"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  placeholder="7"
                                />
                              )}
                            />
                            {errors.maxDeliveryDays && (
                              <p className="text-red-500 text-sm mt-1">{String(errors.maxDeliveryDays.message)}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Maximum days for delivery
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <Clock className="w-5 h-5 text-blue-600 mr-2" />
                              <span className="text-sm font-medium text-blue-800">
                                Delivery Time Display:
                                <span className="ml-2 text-blue-600">
                                  {watch('minDeliveryDays') || 3} - {watch('maxDeliveryDays') || 7} days
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Options */}
                      <div className="border-t pt-6">
                        <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                          <Package className="w-5 h-5 mr-2 text-blue-600" />
                          Shipping Options
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Free Shipping Threshold (NPR)
                              </label>
                              <Controller
                                name="freeShippingThreshold"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    placeholder="0.00"
                                  />
                                )}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Minimum order amount for free shipping
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Weight (kg)
                              </label>
                              <Controller
                                name="shippingWeight"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    placeholder="0.00"
                                  />
                                )}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Product weight for shipping calculation
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Controller
                              name="requiresShipping"
                              control={control}
                              render={({ field }) => (
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Requires Shipping</span>
                                </label>
                              )}
                            />
                            <Controller
                              name="isFragile"
                              control={control}
                              render={({ field }) => (
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Fragile Item (Handle with Care)</span>
                                </label>
                              )}
                            />
                            <Controller
                              name="isHazardous"
                              control={control}
                              render={({ field }) => (
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Hazardous Material</span>
                                </label>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status and Advanced Options */}
                  {activeTab === 'advanced' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status *
                        </label>
                        <Controller
                          name="status"
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                            >
                              <option value="draft">Draft</option>
                              <option value="active">Active</option>
                              <option value="archived">Archived</option>
                            </select>
                          )}
                        />
                        {errors.status && (
                          <p className="text-red-500 text-sm mt-1">{String(errors.status.message)}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900">Product Options</h3>
                          <div className="space-y-3">
                            <Controller
                              name="isActive"
                              control={control}
                              render={({ field }) => (
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Active</span>
                                </label>
                              )}
                            />
                            <Controller
                              name="isFeatured"
                              control={control}
                              render={({ field }) => (
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Featured</span>
                                </label>
                              )}
                            />
                            <Controller
                              name="isDigital"
                              control={control}
                              render={({ field }) => (
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Digital Product</span>
                                </label>
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900">Shipping Options</h3>
                          <div className="space-y-3">
                            <Controller
                              name="requiresShipping"
                              control={control}
                              render={({ field }) => (
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Requires Shipping</span>
                                </label>
                              )}
                            />
                            <Controller
                              name="trackQuantity"
                              control={control}
                              render={({ field }) => (
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Track Quantity</span>
                                </label>
                              )}
                            />
                            <Controller
                              name="allowBackorder"
                              control={control}
                              render={({ field }) => (
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Allow Backorder</span>
                                </label>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Promotional Flags */}
                      <div className="border-t pt-6">
                        <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                          <Star className="w-5 h-5 mr-2 text-blue-600" />
                          Promotional Flags
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <Controller
                                name="isTodaysBestDeal"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                )}
                              />
                              <label className="flex items-center ml-3 text-sm font-medium text-gray-700">
                                <Flame className="w-4 h-4 mr-2 text-orange-500" />
                                Today's Best Deal
                              </label>
                            </div>

                            <div className="flex items-center">
                              <Controller
                                name="isOnSale"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                )}
                              />
                              <label className="flex items-center ml-3 text-sm font-medium text-gray-700">
                                <Percent className="w-4 h-4 mr-2 text-red-500" />
                                On Sale
                              </label>
                            </div>

                            <div className="flex items-center">
                              <Controller
                                name="isFestivalOffer"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                )}
                              />
                              <label className="flex items-center ml-3 text-sm font-medium text-gray-700">
                                <Gift className="w-4 h-4 mr-2 text-purple-500" />
                                Festival Offer
                              </label>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center">
                              <Controller
                                name="isNewLaunch"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                )}
                              />
                              <label className="flex items-center ml-3 text-sm font-medium text-gray-700">
                                <Sparkles className="w-4 h-4 mr-2 text-green-500" />
                                New Launch
                              </label>
                            </div>

                            <div className="flex items-center">
                              <Controller
                                name="isBestSeller"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                )}
                              />
                              <label className="flex items-center ml-3 text-sm font-medium text-gray-700">
                                <Award className="w-4 h-4 mr-2 text-yellow-500" />
                                Best Seller
                              </label>
                            </div>

                            <div className="flex items-center">
                              <Controller
                                name="isFeatured"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                )}
                              />
                              <label className="flex items-center ml-3 text-sm font-medium text-gray-700">
                                <Star className="w-4 h-4 mr-2 text-blue-500" />
                                Featured Product
                              </label>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          Select appropriate promotional flags to highlight your product in different sections of the store.
                        </p>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  {showAdvanced ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4 mr-1" />
                  Close
                </button>
              </div>
              <div className="flex space-x-3">
                {activeTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={handlePreviousTab}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {initialData ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    initialData ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedProductForm;

