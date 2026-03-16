'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCsrfToken } from '@/lib/csrfClient';
import RichTextEditor from './RichTextEditor';
import DynamicDropdown from './DynamicDropdown';
import ProductPreviewModal from './ProductPreviewModal';
import { productAttributeService } from '@/services/productAttributeService';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getApiBaseUrl } from '@/lib/api';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Gem,
  Image as ImageIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Save,
  Plus,
  Trash2,
  Upload,
  Globe,
  Share2,
  Code,
  Clock,
  DollarSign,
  Box,
  Layout,
  CheckCircle2,
  HelpCircle,
  Twitter
} from 'lucide-react';



// Product interfaces
interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  fullDescription?: string;
  category: string;
  subCategory?: string;
  jewelryType?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  status: 'draft' | 'active' | 'inactive';

  // Gold Fields
  goldWeight?: string;
  goldPurity?: string;
  goldType?: string;
  goldCraftsmanship?: string;
  goldDesignDescription?: string;
  goldFinishedType?: string;
  goldStones?: string;
  goldStoneQuality?: string;

  // Diamond Fields
  diamondType?: string;
  diamondShapeCut?: string;
  diamondColorGrade?: string;
  diamondClarityGrade?: string;
  diamondCutGrade?: string;
  diamondMetalDetails?: string;
  diamondCertification?: string;
  diamondOrigin?: string;
  diamondCaratWeight?: string;
  diamondQuantity?: number;

  // Platinum Fields
  platinumWeight?: string;
  platinumType?: string;

  // Silver Fields
  silverWeight?: string;
  silverType?: string;

  // Additional Fields
  orderDuration?: string;
  digitalBrowser?: boolean;
  website?: boolean;
  distributor?: boolean;
  normalUser?: boolean;
  resellerUser?: boolean;
  culture?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoSlug?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  robotsMeta?: string;
  xmlSitemap?: boolean;
  indexingAndDiscovery?: string;
  structuredData?: any;
  seoFriendlyImageFilename?: string;
  imageAltText?: string;
  imageTitle?: string;
  imageWidth?: number;
  imageHeight?: number;
  lazyLoading?: boolean;
  productSchema?: any;
  offerSchema?: any;
  brandSchema?: any;
  breadcrumbSchema?: any;
  itemListSchema?: any;
  faqSchema?: any;
  contentElement?: string;
  faqs?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  optimizedImageFormat?: string;
  images?: ProductImage[];
  videoUrl?: string;
  stoneWeight?: string;
  caret?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSuccess: () => void;
}

interface ProductPreviewData extends Partial<Product> {
  imageUrl?: string;
}

interface Category {
  id: string;
  title: string;
  imageUrl: string | null;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  category: Category;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Validation schema
const productSchema = z.object({
  productCode: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  fullDescription: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  jewelryType: z.string().optional(),
  price: z.string().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['draft', 'active', 'inactive']).optional(),
  goldWeight: z.string().optional(),
  goldPurity: z.string().optional(),
  goldType: z.string().optional(),
  goldCraftsmanship: z.string().optional(),
  goldDesignDescription: z.string().optional(),
  goldFinishedType: z.string().optional(),
  goldStones: z.string().optional(),
  goldStoneQuality: z.string().optional(),
  diamondType: z.string().optional(),
  diamondShapeCut: z.string().optional(),
  diamondColorGrade: z.string().optional(),
  diamondClarityGrade: z.string().optional(),
  diamondCutGrade: z.string().optional(),
  diamondMetalDetails: z.string().optional(),
  diamondCertification: z.string().optional(),
  diamondOrigin: z.string().optional(),
  diamondCaratWeight: z.string().optional(),
  diamondQuantity: z.string().optional().transform((val) => val ? parseInt(val) : undefined).refine((val) => val === undefined || !isNaN(val), { message: 'Invalid number' }),
  platinumWeight: z.string().optional(),
  platinumType: z.string().optional(),
  silverWeight: z.string().optional(),
  silverType: z.string().optional(),
  digitalBrowser: z.boolean().optional(),
  website: z.boolean().optional(),
  distributor: z.boolean().optional(),
  normalUser: z.boolean().optional(),
  resellerUser: z.boolean().optional(),
  culture: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  seoSlug: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  robotsMeta: z.string().optional(),
  xmlSitemap: z.boolean().optional(),
  indexingAndDiscovery: z.string().optional(),
  structuredData: z.any().optional(),
  seoFriendlyImageFilename: z.string().optional(),
  imageAltText: z.string().optional(),
  imageTitle: z.string().optional(),
  imageWidth: z.string().optional().transform((val) => val ? parseInt(val) : undefined).refine((val) => val === undefined || !isNaN(val), { message: 'Invalid number' }),
  imageHeight: z.string().optional().transform((val) => val ? parseInt(val) : undefined).refine((val) => val === undefined || !isNaN(val), { message: 'Invalid number' }),
  lazyLoading: z.boolean().optional(),
  productSchema: z.any().optional(),
  offerSchema: z.any().optional(),
  brandSchema: z.any().optional(),
  breadcrumbSchema: z.any().optional(),
  itemListSchema: z.any().optional(),
  faqSchema: z.any().optional(),
  contentElement: z.string().optional(),
  faqs: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterCard: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().optional(),
  optimizedImageFormat: z.string().optional(),
  videoUrl: z.string().optional(),
  stoneWeight: z.string().optional(),
  caret: z.string().optional(),
  orderDuration: z.string().optional()
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm({ isOpen, onClose, editingProduct, onSuccess }: ProductFormProps) {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ProductPreviewData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Image/Video state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');

  // Crop state
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null);
  const [croppingImageUrl, setCroppingImageUrl] = useState<string>('');
  const [isImageHovering, setIsImageHovering] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: FileText },
    { id: 'materials', label: 'Gold & Metals', icon: Sparkles },
    { id: 'diamonds', label: 'Diamonds', icon: Gem },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'marketing', label: 'Marketing & SEO', icon: Search },
  ];

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
    reset,
    setValue,
    watch,
    getValues,
    trigger
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productCode: '',
      name: '',
      description: '',
      fullDescription: '',
      category: '',
      subCategory: '',
      jewelryType: '',
      price: '',
      isActive: true,
      status: 'draft',
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
      diamondQuantity: '',
      platinumWeight: '',
      platinumType: '',
      silverWeight: '',
      silverType: '',
      digitalBrowser: true,
      website: true,
      distributor: true,
      normalUser: false,
      resellerUser: false,
      culture: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      seoSlug: '',
      metaDescription: '',
      canonicalUrl: '',
      robotsMeta: 'index, follow',
      xmlSitemap: true,
      indexingAndDiscovery: 'auto',
      structuredData: null,
      seoFriendlyImageFilename: '',
      imageAltText: '',
      imageTitle: '',
      imageWidth: '',
      imageHeight: '',
      lazyLoading: true,
      productSchema: null,
      offerSchema: null,
      brandSchema: null,
      breadcrumbSchema: null,
      itemListSchema: null,
      faqSchema: null,
      contentElement: '',
      faqs: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterCard: 'summary_large_image',
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: '',
      optimizedImageFormat: 'webp',
      videoUrl: '',
      stoneWeight: '',
      caret: '',
      orderDuration: '',
    }
  });

  const watchCategory = watch('category');

  // Fetch categories and subcategories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE_URL = getApiBaseUrl();
        const resp = await fetch(`${API_BASE_URL}/categories/admin/all`, { credentials: 'include' });
        if (resp.ok) {
          const json = await resp.json();
          const cats = (json.data || []) as Category[];
          setCategories(cats);

          const flattened = (json.data || []).flatMap((cat: any) => {
            const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
            return subs.map((s: any) => ({
              id: String(s.id ?? s._id ?? ''),
              name: String(s.name ?? s.title ?? ''),
              categoryId: String(cat.id ?? ''),
            }));
          });
          setSubcategories(flattened as any);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchData();
  }, []);

  // Filter subcategories when category changes
  useEffect(() => {
    if (watchCategory) {
      const selected = categories.find(c => String(c.id) === String(watchCategory) || String(c.title).toLowerCase() === String(watchCategory).toLowerCase());
      const catId = selected ? selected.id : String(watchCategory);
      setFilteredSubcategories(subcategories.filter(s => String(s.categoryId) === String(catId)));
    } else {
      setFilteredSubcategories([]);
    }
  }, [watchCategory, subcategories, categories]);

  // Handle initial data pop
  useEffect(() => {
    if (editingProduct) {
      reset({
        ...editingProduct,
        price: editingProduct.price?.toString() || '',
        diamondQuantity: editingProduct.diamondQuantity?.toString() || '',
        imageWidth: editingProduct.imageWidth?.toString() || '',
        imageHeight: editingProduct.imageHeight?.toString() || '',
        status: editingProduct.status || 'draft',
      } as any);

      // Handle images
      if (editingProduct.images && editingProduct.images.length > 0) {
        setPreviewImages(editingProduct.images.sort((a, b) => a.order - b.order).map(img => img.url));
      } else if (editingProduct.imageUrl) {
        setPreviewImages([editingProduct.imageUrl]);
      } else {
        setPreviewImages([]);
      }

      setVideoPreview(editingProduct.videoUrl || '');
    } else {
      reset();
      setPreviewImages([]);
      setVideoPreview('');
    }
  }, [editingProduct, reset]);

  const handleNext = async () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      setSelectedImages(prev => [...prev, ...fileList]);
      const urls = fileList.map(f => URL.createObjectURL(f));
      setPreviewImages(prev => [...prev, ...urls]);
    }
  };

  const handleCompleteCrop = () => {
    if (imgRef.current && completedCrop && croppingImageIndex !== null) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const image = imgRef.current;
      const pixelRatio = window.devicePixelRatio;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width * pixelRatio;
      canvas.height = completedCrop.height * pixelRatio;

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0, 0,
        completedCrop.width,
        completedCrop.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `cropped-${Date.now()}.png`, { type: 'image/png' });
          const newImages = [...selectedImages];
          const newPreviews = [...previewImages];
          newImages[croppingImageIndex] = file;
          newPreviews[croppingImageIndex] = URL.createObjectURL(file);
          setSelectedImages(newImages);
          setPreviewImages(newPreviews);
          setCroppingImageIndex(null);
        }
      }, 'image/png');
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      selectedImages.forEach(img => formData.append('images', img));
      if (selectedVideoFile) formData.append('video', selectedVideoFile);

      const token = await fetchCsrfToken();
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `${getApiBaseUrl()}/products/${editingProduct.id}` : `${getApiBaseUrl()}/products`;

      const resp = await fetch(url, {
        method,
        body: formData,
        credentials: 'include',
        headers: { 'x-csrf-token': token || '' }
      });

      if (resp.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product created!');
        onSuccess();
        onClose();
      } else {
        const err = await resp.json();
        toast.error(err.message || 'Error saving product');
      }
    } catch (err) {
      toast.error('Submission failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30  flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden bg-black"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 title-regular">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-sm text-gray-800 mt-1">Multi-step product management</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar bg-white z-50 h-24">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium transition-all relative border-b-2 whitespace-nowrap ${isActive ? 'text-[#cca43b] border-[#cca43b] ' : 'text-gray-800 border-transparent hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-[#cca43b]' : 'text-gray-800'}`} />
                {tab.label}
                {isActive && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cca43b]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <form onSubmit={handleFormSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 custom-scrollbar  z-10 ">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* GENERAL TAB */}
              {activeTab === 'general' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center text-[#cca43b] title-regular"><Layout className="w-5 h-5 mr-2 text-[#cca43b]" /> Basic Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
                          <Controller name="productCode" control={control} render={({ field }) => (
                            <input {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all text-black" placeholder="SKU-001" />
                          )} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                          <Controller name="name" control={control} render={({ field }) => (
                            <input {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all text-black" placeholder="Exquisite Diamond Ring" />
                          )} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR)</label>
                          <Controller name="price" control={control} render={({ field }) => (
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input {...field} type="number" disabled className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all text-black" placeholder="0.00" />
                            </div>
                          )} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-4">
                                              <h3 className="text-lg font-semibold flex items-center text-[#cca43b] title-regular"><Layout className="w-5 h-5 mr-2 text-[#cca43b]" /> Classification</h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 title-regular">Category</label>
                            <Controller name="category" control={control} render={({ field }) => (
                              <select {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-black">
                                <option value="">Select</option>                      <h3 className="text-lg font-semibold flex items-center text-gray-800"><Layout className="w-5 h-5 mr-2 text-[#" /> Basic Information</h3>

                                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                              </select>
                            )} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                            <Controller name="subCategory" control={control} render={({ field }) => (
                              <select {...field} disabled={!watchCategory} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-black disabled:opacity-50">
                                <option value="">Select</option>
                                {filteredSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            )} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Jewelry Type</label>
                          <Controller name="jewelryType" control={control} render={({ field }) => (
                            <select {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-black">
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Kids">Kids</option>
                            </select>
                          )} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <Controller name="status" control={control} render={({ field }) => (
                            <select {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-black">
                              <option value="draft">Draft</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          )} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center text-[#cca43b] title-regular"><Save className="w-5 h-5 mr-2 text-[#cca43b] title-regular" /> Descriptions</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                      <Controller name="fullDescription" control={control} render={({ field }) => (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <RichTextEditor value={field.value || ''} onChange={field.onChange} height="300px" />
                        </div>
                      )} />
                    </div>
                  </div>
                </div>
              )}

              {/* MATERIALS TAB */}
              {activeTab === 'materials' && (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold italic pb-2 flex items-center text-[#cca43b] title-regular"> Gold Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {['goldPurity', 'goldType', 'goldWeight', 'goldFinishedType', 'goldStones', 'goldStoneQuality'].map(attr => (
                        <div key={attr}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{attr.replace('gold', 'Gold ')}</label>
                          <Controller name={attr as any} control={control} render={({ field }) => (
                            <DynamicDropdown attribute={attr as any} value={field.value || ''} onChange={field.onChange} placeholder={`Select ${attr}`} forceDropdown allowCustomValue />
                          )} />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Craftsmanship</label>
                        <Controller name="goldCraftsmanship" control={control} render={({ field }) => (
                          <textarea {...field} rows={2} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-black" />
                        )} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Design Description</label>
                        <Controller name="goldDesignDescription" control={control} render={({ field }) => (
                          <textarea {...field} rows={2} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-black" />
                        )} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 border-t border-gray-100">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold italic flex items-center text-[#cca43b] title-regular">Platinum</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                          <Controller name="platinumWeight" control={control} render={({ field }) => (
                            <DynamicDropdown attribute="platinumWeight" value={field.value || ''} onChange={field.onChange} forceDropdown allowCustomValue />
                          )} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <Controller name="platinumType" control={control} render={({ field }) => (
                            <DynamicDropdown attribute="platinumType" value={field.value || ''} onChange={field.onChange} forceDropdown allowCustomValue />
                          )} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold italic flex items-center text-[#cca43b] title-regular">Silver</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                          <Controller name="silverWeight" control={control} render={({ field }) => (
                            <DynamicDropdown attribute="silverWeight" value={field.value || ''} onChange={field.onChange} forceDropdown allowCustomValue />
                          )} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <Controller name="silverType" control={control} render={({ field }) => (
                            <DynamicDropdown attribute="silverType" value={field.value || ''} onChange={field.onChange} forceDropdown allowCustomValue />
                          )} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Clock className="w-4 h-4 mr-2" /> Order Duration</label>
                    <Controller name="orderDuration" control={control} render={({ field }) => (
                      <input {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-black" placeholder="e.g. 2-3 weeks" />
                    )} />
                  </div>
                </div>
              )}

              {/* DIAMONDS TAB */}
              {activeTab === 'diamonds' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold italic flex items-center pb-2 title-regular text-[#cca43b]"> Diamond Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: 'diamondType', label: 'Type' },
                      { name: 'diamondShapeCut', label: 'Shape/Cut' },
                      { name: 'diamondColorGrade', label: 'Color' },
                      { name: 'diamondClarityGrade', label: 'Clarity' },
                      { name: 'diamondCutGrade', label: 'Cut Grade' },
                      { name: 'diamondMetalDetails', label: 'Metal Details' },
                      { name: 'diamondCertification', label: 'Certification' },
                      { name: 'diamondOrigin', label: 'Origin' },
                    ].map(d => (
                      <div key={d.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{d.label}</label>
                        <Controller name={d.name as any} control={control} render={({ field }) => (
                          <DynamicDropdown attribute={d.name as any} value={field.value || ''} onChange={field.onChange} forceDropdown allowCustomValue />
                        )} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Carat Weight</label>
                      <Controller name="diamondCaratWeight" control={control} render={({ field }) => (
                        <input {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-black" />
                      )} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Diamond Pieces</label>
                      <Controller name="diamondQuantity" control={control} render={({ field }) => (
                        <input {...field} type="number" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-black" />
                      )} />
                    </div>
                  </div>
                </div>
              )}

              {/* MEDIA TAB */}
              {activeTab === 'media' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center text-[#cca43b] title-regular"><ImageIcon className="w-6 h-6 mr-2 text-[#cca43b]" /> Product Gallery</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                      {previewImages.map((src, i) => (
                        <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                          <img src={src} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                            <button type="button" onClick={() => {
                              setCroppingImageUrl(src);
                              setCroppingImageIndex(i);
                            }} className="p-2 bg-white rounded-full text-gray-800 hover:scale-110 transition-transform"><Save className="w-4 h-4" /></button>
                            <button type="button" onClick={() => {
                              setPreviewImages(prev => prev.filter((_, idx) => idx !== i));
                              setSelectedImages(prev => prev.filter((_, idx) => idx !== i));
                            }} className="p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                      <label className="aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all group">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-500" />
                        <span className="text-xs text-gray-500 mt-2 font-medium">Add Images</span>
                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center text-gray-800"><Code className="w-5 h-5 mr-2 text-purple-500" /> Image SEO</h3>
                      <div className="space-y-3">
                        <Controller name="seoFriendlyImageFilename" control={control} render={({ field }) => (
                          <input {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-black text-sm" placeholder="Filename" />
                        )} />
                        <div className="grid grid-cols-2 gap-3">
                          <Controller name="imageAltText" control={control} render={({ field }) => (
                            <input {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-black text-sm" placeholder="Alt Text" />
                          )} />
                          <Controller name="imageTitle" control={control} render={({ field }) => (
                            <input {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-black text-sm" placeholder="Title" />
                          )} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center text-gray-800"><ImageIcon className="w-5 h-5 mr-2 text-purple-500" /> Video</h3>
                      <Controller name="videoUrl" control={control} render={({ field }) => (
                        <input {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-black text-sm" placeholder="YouTube/Vimeo URL" />
                      )} />
                      <div className="relative">
                        <input type="file" className="hidden" id="video-up" accept="video/*" onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setSelectedVideoFile(f);
                            setVideoPreview(URL.createObjectURL(f));
                          }
                        }} />
                        <label htmlFor="video-up" className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                          <Plus className="w-4 h-4 mr-2" /> Upload Video File
                        </label>
                        {videoPreview && (
                          <div className="mt-2 relative group">
                            <video src={videoPreview} className="w-full rounded-xl border" controls />
                            <button type="button" onClick={() => { setVideoPreview(''); setSelectedVideoFile(null); }} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MARKETING & SEO TAB */}
              {activeTab === 'marketing' && (
                <div className="space-y-8 z-10">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center text-[#cca43b] title-regular"><Globe className="w-6 h-6 mr-2 text-[#cca43b]" /> Visibility & Distribution</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {['digitalBrowser', 'website', 'distributor', 'normalUser', 'resellerUser'].map(key => (
                        <Controller key={key} name={key as any} control={control} render={({ field }) => (
                          <label className="flex items-center p-5 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} className="w-4 h-4 text-[#cca43b] rounded bg-gray-100" />
                            <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{key.replace('User', ' User')}</span>
                          </label>
                        )} />
                      ))}
                    </div>
                  </div>

                  {/* Basic SEO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center text-[#cca43b] title-regular"><Share2 className="w-6 h-6 mr-2 text-[#cca43b]" /> SEO Meta</h3>
                      <div className="space-y-4">
                        <Controller name="seoTitle" control={control} render={({ field }) => (
                          <input {...field} className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-black" placeholder="SEO Title" />
                        )} />
                        <Controller name="seoSlug" control={control} render={({ field }) => (
                          <input {...field} className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-black text-lg placeholder:text-gray-800" placeholder="Url-Slug" />
                        )} />
                        <Controller name="seoDescription" control={control} render={({ field }) => (
                          <textarea {...field} rows={5} className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-black placeholder:text-black" placeholder="SEO Description" />
                        )} />
                        <Controller name="canonicalUrl" control={control} render={({ field }) => (
                          <input {...field} className="w-full px-4 py-8 bg-gray-100 border border-gray-200 rounded-xl text-black text-lg placeholder:text-black" placeholder="https://example.com/product/canonical-url" />
                        )} />
                        <Controller name="robotsMeta" control={control} render={({ field }) => (
                          <select {...field} className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-black text-sm">
                            <option value="index, follow">Index, Follow</option>
                            <option value="noindex, nofollow">Noindex, Nofollow</option>
                            <option value="index, nofollow">Index, Nofollow</option>
                            <option value="noindex, follow">Noindex, Follow</option>
                          </select>
                        )} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center text-[#cca43b] title-regular"><Code className="w-6 h-6 mr-2 text-[#cca43b]" /> Structured Data</h3>
                      <div className="space-y-4">
                        <Controller name="structuredData" control={control} render={({ field }) => (
                          <textarea {...field} rows={5} className="w-full px-3 py-2 bg-gray-100 text-gray-800  text-lg rounded-lg border border-gray-300 placeholder:text-gray-800" placeholder="General Structured Data (JSON-LD)" />
                        )} />
                        <div className="grid grid-cols-2 gap-3">
                          {['productSchema', 'brandSchema', 'breadcrumbSchema', 'faqSchema'].map(schema => (
                            <Controller key={schema} name={schema as any} control={control} render={({ field }) => (
                              <textarea {...field} rows={8} className="w-full px-3 py-1 bg-gray-100 text-gray-800 title-regular text-lg rounded-lg border border-gray-300 placeholder:text-gray-800" placeholder={schema} />
                            )} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Elements & FAQs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center text-[#cca43b] title-regular"><FileText className="w-6 h-6 mr-2 text-[#cca43b]" /> Content Elements</h3>
                      <Controller name="contentElement" control={control} render={({ field }) => (
                        <textarea {...field} rows={7} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-800" placeholder="Additional content elements, specifications, features..." />
                      )} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center text-[#cca43b] title-regular"><HelpCircle className="w-6 h-6 mr-2 text-[#cca43b]" /> FAQs</h3>
                      <Controller name="faqs" control={control} render={({ field }) => (
                        <textarea {...field} rows={4} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-800" placeholder="Frequently asked questions (Q: Question?&#10;A: Answer)" />
                      )} />
                    </div>
                  </div>

                  {/* Open Graph */}
                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-xl font-bold flex items-center text-[#cca43b] title-regular mb-4"><Share2 className="w-6 h-6 mr-2 text-[#cca43b]" /> Open Graph Meta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Controller name="ogTitle" control={control} render={({ field }) => (
                        <input {...field} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-800" placeholder="OG Title" />
                      )} />
                      <Controller name="ogImage" control={control} render={({ field }) => (
                        <input {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-800" placeholder="OG Image URL" />
                      )} />
                      <div className="md:col-span-2">
                        <Controller name="ogDescription" control={control} render={({ field }) => (
                          <textarea {...field} rows={8} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-800" placeholder="OG Description" />
                        )} />
                      </div>
                    </div>
                  </div>

                  {/* Twitter Card */}
                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-xl font-bold flex items-center text-[#cca43b] title-regular mb-4"><Twitter className="w-6 h-6 mr-2 text-[#cca43b]" /> Twitter Card Meta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Controller name="twitterCard" control={control} render={({ field }) => (
                        <select {...field} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-black text-sm">
                          <option value="summary">Summary</option>
                          <option value="summary_large_image">Summary with Large Image</option>
                          <option value="app">App</option>
                          <option value="player">Player</option>
                        </select>
                      )} />
                      <Controller name="twitterImage" control={control} render={({ field }) => (
                        <input {...field} className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-black placeholder:text-gray-800" placeholder="Twitter Image URL" />
                      )} />
                      <Controller name="twitterTitle" control={control} render={({ field }) => (
                        <input {...field} className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-black placeholder:text-gray-800" placeholder="Twitter Title" />
                      )} />
                      <Controller name="twitterDescription" control={control} render={({ field }) => (
                        <input {...field} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-800" placeholder="Twitter Description" />
                      )} />
                    </div>
                  </div>

                  {/* Indexing & Discovery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center title-regular text-[#cca43b]"><Search className="w-6 h-6 mr-2 text-[#cca43b]" /> Indexing & Discovery</h3>
                      <div className="space-y-4">
                        <Controller name="indexingAndDiscovery" control={control} render={({ field }) => (
                          <select {...field} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-black text-sm">
                            <option value="auto">Auto Discovery</option>
                            <option value="manual">Manual Only</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        )} />
                        <div className="flex items-center space-x-3">
                          <Controller name="xmlSitemap" control={control} render={({ field }) => (
                            <label className="flex items-center p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                              <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
                              <span className="ml-2 text-md font-medium text-gray-700">Include in XML Sitemap</span>
                            </label>
                          )} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center text-[#cca43b] title-regular"><Globe className="w-6 h-6 mr-2 text-[#cca43b]" /> Additional Schemas</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {['offerSchema', 'itemListSchema'].map(schema => (
                          <Controller key={schema} name={schema as any} control={control} render={({ field }) => (
                            <textarea {...field} rows={5} className="w-full px-3 py-3 bg-gray-100 text-gray-800 text-md  rounded-lg border border-gray-300 placeholder:text-gray-700" placeholder={schema} />
                          )} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center sm:grid-cols-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => {
              const formData = getValues();
              setPreviewData({
                ...formData,
                price: formData.price ? parseFloat(formData.price) : 0,
                diamondQuantity: formData.diamondQuantity ? parseInt(formData.diamondQuantity as any) : 0,
                images: previewImages.map((url, index) => ({
                  id: `preview-${index}`,
                  productId: 'preview',
                  url,
                  order: index,
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }))
              } as any);
              setIsPreviewOpen(true);
            }} className="px-4 py-2 text-lg title-regular font-bold text-[#cca43b]  rounded-xl hover:bg-purple-100 transition-colors flex items-center">
              <Eye className="w-4 h-4 mr-2" /> Preview
            </button>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={handleBack} disabled={activeTab === tabs[0].id} className="px-4 py-2 text-lg font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center disabled:opacity-30">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </button>

            {activeTab === tabs[tabs.length - 1].id ? (
              <button type="submit" disabled={formIsSubmitting} onClick={handleFormSubmit(onSubmit)} className="px-6 py-2 text-lg font-bold text-white bg-[#cca43b] rounded-xl shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center">
                {formIsSubmitting ? <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Saving...</span> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Finish & Save</>}
              </button>
            ) : (
              <button type="button" onClick={handleNext} className="px-6 py-2 text-sm font-semibold text-white bg-[#cca43b] rounded-xl shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center">
                Next Step <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Crop Modal */}
      {croppingImageIndex !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Crop Image</h3>
              <button onClick={() => setCroppingImageIndex(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="max-h-[60vh] overflow-hidden rounded-xl border flex justify-center bg-gray-50">
              <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}>
                <img ref={imgRef} src={croppingImageUrl} className="max-h-[60vh] object-contain" />
              </ReactCrop>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setCroppingImageIndex(null)} className="px-4 py-2 text-gray-600 font-medium">Cancel</button>
              <button onClick={handleCompleteCrop} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all">Apply Crop</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Product Preview Modal */}
      {isPreviewOpen && previewData && (
        <ProductPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewData(null);
          }}
          product={previewData as any}
          categories={categories}
          subcategories={subcategories}
        />
      )}
    </div>
  );
}

