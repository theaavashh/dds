'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCsrfToken, getCsrfToken } from '@/lib/csrfClient';
import RichTextEditor from './RichTextEditor';
import DynamicDropdown from './DynamicDropdown';
import { productAttributeService } from '@/services/productAttributeService';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getApiBaseUrl } from '@/lib/api';
import { Lato } from 'next/font/google';

const lato = Lato({ subsets: ['latin'], display: 'swap', weight: ['400','700'] });

// Enhanced Product interface with proper typing
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

// Enhanced ProductPreviewData interface
interface ProductPreviewData {
  id?: string;
  productCode?: string;
  name?: string;
  description?: string;
  fullDescription?: string;
  category?: string;
  subCategory?: string;
  jewelryType?: string;
  price?: number;
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
  digitalBrowser: boolean;
  website: boolean;
  distributor: boolean;
  normalUser: boolean;
  resellerUser: boolean;
  culture?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoSlug?: string;
  imageUrl?: string;
  images?: ProductImage[];
  videoUrl?: string;
  stoneWeight?: string;
  caret?: string;
  createdAt?: string;
  updatedAt?: string;
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

// Enhanced validation schema with better error messages
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
  videoUrl: z.string().optional(),
  stoneWeight: z.string().optional(),
  caret: z.string().optional(),
  orderDuration: z.string().optional()
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm({ isOpen, onClose, editingProduct, onSuccess }: ProductFormProps) {
  const { isAuthenticated } = useAuth();
  
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ProductPreviewData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Image cropping refs
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Handle keyboard navigation for image carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPreviewOpen || !previewData?.images || previewData.images.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : previewData.images!.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex(prev => (prev < previewData.images!.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen, previewData]);

  // Reset image index when preview data changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [previewData]);
  
  // hover auto-carousel effect moved below after state declarations
  
  // Form setup with React Hook Form
  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
    reset,
    setValue,
    watch,
    getValues
  } = useForm({
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
      isActive: false,
      status: 'draft',
      
      // Gold Fields
      goldWeight: '',
      goldPurity: '',
      goldType: '',
      goldCraftsmanship: '',
      goldDesignDescription: '',
      goldFinishedType: '',
      goldStones: '',
      goldStoneQuality: '',
      
      // Diamond Fields
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
      
      // Platinum Fields
      platinumWeight: '',
      platinumType: '',
      
      // Silver Fields
      silverWeight: '',
      silverType: '',
      
      digitalBrowser: true,
      website: true,
      distributor: true,
      culture: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      seoSlug: '',
      videoUrl: '',
      stoneWeight: '',
      caret: '',
      orderDuration: '',
    }
  });
  
  // Watch category field for subcategory filtering
  const watchCategory = watch('category');
  
  // Image and video state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  
  // Image cropping state
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null);
  const [croppingImageUrl, setCroppingImageUrl] = useState<string>('');
  const [isImageHovering, setIsImageHovering] = useState(false);
  
  useEffect(() => {
    let interval: number | undefined;
    if (isPreviewOpen && isImageHovering && previewData?.images && previewData.images.length > 1) {
      interval = window.setInterval(() => {
        setCurrentImageIndex(prev => {
          const len = previewData.images!.length;
          return prev < len - 1 ? prev + 1 : 0;
        });
      }, 1500);
    }
    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isPreviewOpen, isImageHovering, previewData]);

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const API_BASE_URL = getApiBaseUrl();
        
        // Fetch categories with subcategories (admin endpoint)
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories/admin/all`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          const list: Category[] = (categoriesData.data || []) as Category[];
          setCategories(list);
          const rawList: any[] = (categoriesData.data || []) as any[];
          const flattenedSubs: Subcategory[] = rawList.flatMap((cat: any) => {
            const subs: any[] = Array.isArray(cat.subcategories) ? cat.subcategories : [];
            return subs.map((sc: any) => ({
              id: String(sc.id ?? sc._id ?? ''),
              name: String(sc.name ?? sc.title ?? ''),
              categoryId: String(sc.categoryId ?? cat.id ?? ''),
              category: {
                id: String(cat.id ?? ''),
                title: String(cat.title ?? ''),
                imageUrl: cat.imageUrl ?? null,
                link: cat.link ?? null,
                isActive: !!cat.isActive,
                sortOrder: Number(cat.sortOrder ?? 0),
                createdAt: String(cat.createdAt ?? ''),
                updatedAt: String(cat.updatedAt ?? '')
              },
              isActive: !!sc.isActive,
              sortOrder: Number(sc.sortOrder ?? 0),
              createdAt: String(sc.createdAt ?? ''),
              updatedAt: String(sc.updatedAt ?? '')
            }));
          });
          setSubcategories(flattenedSubs);
        }
      } catch (error) {
        console.error('Error fetching categories and subcategories:', error);
        toast.error('Failed to load categories and subcategories');
      }
    };
    
    fetchCategoriesAndSubcategories();
  }, []);

  // Filter and fetch subcategories when category changes
  useEffect(() => {
    if (watchCategory) {
      const selected = categories.find(c => String(c.id) === String(watchCategory) || String(c.title).toLowerCase() === String(watchCategory).toLowerCase());
      const categoryIdForFetch = selected ? selected.id : String(watchCategory);

      // Show locally available ones immediately
      const localFiltered = subcategories.filter(sub => String(sub.categoryId) === String(categoryIdForFetch));
      setFilteredSubcategories(localFiltered);

      // Always fetch latest from API to ensure accuracy
      const API_BASE_URL = getApiBaseUrl();
      fetch(`${API_BASE_URL}/categories/${categoryIdForFetch}/subcategories`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(async (resp) => {
          if (resp.ok) {
            const json = await resp.json();
            const arr = Array.isArray(json.data) ? json.data : [];
            const mapped = arr.map((sc: any) => {
              const cid = String(sc.categoryId ?? categoryIdForFetch);
              const cat = categories.find(c => c.id === cid) || {
                id: cid,
                title: '',
                imageUrl: null,
                link: null,
                isActive: true,
                sortOrder: 0,
                createdAt: '',
                updatedAt: ''
              };
              return {
                id: String(sc.id ?? sc._id ?? ''),
                name: String(sc.name ?? sc.title ?? ''),
                categoryId: cid,
                category: cat,
                isActive: !!sc.isActive,
                sortOrder: Number(sc.sortOrder ?? 0),
                createdAt: String(sc.createdAt ?? ''),
                updatedAt: String(sc.updatedAt ?? '')
              } as Subcategory;
            });
            setFilteredSubcategories(mapped);
          }
        })
        .catch(() => {
          // ignore network errors for fetch
        });
    } else {
      setFilteredSubcategories([]);
    }
  }, [watchCategory, subcategories, categories]);

  useEffect(() => {
    if (!watchCategory) {
      // reset subcategory when category cleared
      setValue('subCategory', '');
    } else {
      // if selected subCategory is not in filtered list, reset it
      const currentSub = watch('subCategory');
      if (currentSub && !filteredSubcategories.some(s => s.id === currentSub)) {
        setValue('subCategory', '');
      }
    }
  }, [watchCategory, filteredSubcategories, setValue]);

  useEffect(() => {
    const currentCategory = watch('category');
    if (!editingProduct && !currentCategory) {
      // keep category unselected by default
    }
  }, [categories, editingProduct, setValue, watch]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      setSelectedImages(prevImages => [...prevImages, ...fileList]);
      
      const previewUrls = fileList.map(file => URL.createObjectURL(file));
      setPreviewImages(prevPreviews => [...prevPreviews, ...previewUrls]);
    }
  };

  // Handle image cropping
  const handleCropImage = (index: number) => {
    setCroppingImageIndex(index);
    setCroppingImageUrl(previewImages[index]);
    setCrop({
      unit: '%',
      width: 50,
      height: 50,
      x: 25,
      y: 25
    });
  };

  // Complete image cropping
  const handleCompleteCrop = () => {
    if (imgRef.current && completedCrop && croppingImageIndex !== null) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error('Failed to create canvas context');
        return;
      }
      
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
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
      
      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = `cropped-${Date.now()}.png`;
          const croppedFile = new File([blob], fileName, { type: 'image/png' });
          
          const newSelectedImages = [...selectedImages];
          const newPreviewImages = [...previewImages];
          
          newSelectedImages[croppingImageIndex] = croppedFile;
          newPreviewImages[croppingImageIndex] = URL.createObjectURL(croppedFile);
          
          setSelectedImages(newSelectedImages);
          setPreviewImages(newPreviewImages);
          
          setCroppingImageIndex(null);
          setCroppingImageUrl('');
          setCrop(undefined);
          setCompletedCrop(undefined);
          
          toast.success('Image cropped successfully!');
        }
      }, 'image/png');
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    reset({
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
      
      // Gold Fields
      goldWeight: '',
      goldPurity: '',
      goldType: '',
      goldCraftsmanship: '',
      goldDesignDescription: '',
      goldFinishedType: '',
      goldStones: '',
      goldStoneQuality: '',
      
      // Diamond Fields
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
      
      // Platinum Fields
      platinumWeight: '',
      platinumType: '',
      
      // Silver Fields
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
      videoUrl: '',
      stoneWeight: '',
      caret: '',
      orderDuration: ''
    });
    setSelectedImages([]);
    setPreviewImages([]);
    setSelectedVideoFile(null);
    setVideoPreview('');
    
    setCroppingImageIndex(null);
    setCroppingImageUrl('');
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  // Populate form when editing
  useEffect(() => {
    if (editingProduct) {
      reset({
        productCode: editingProduct.productCode || '',
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        fullDescription: editingProduct.fullDescription || '',
        category: editingProduct.category || '',
        subCategory: editingProduct.subCategory || '',
        jewelryType: editingProduct.jewelryType || '',
        price: editingProduct.price?.toString() || '',
        isActive: editingProduct.isActive,
        status: editingProduct.status || 'draft',
        goldWeight: editingProduct.goldWeight || '',
        goldPurity: editingProduct.goldPurity || '',
        goldType: editingProduct.goldType || '',
        goldCraftsmanship: editingProduct.goldCraftsmanship || '',
        goldDesignDescription: editingProduct.goldDesignDescription || '',
        goldFinishedType: editingProduct.goldFinishedType || '',
        goldStones: editingProduct.goldStones || '',
        goldStoneQuality: editingProduct.goldStoneQuality || '',
        diamondType: editingProduct.diamondType || '',
        diamondShapeCut: editingProduct.diamondShapeCut || '',
        diamondColorGrade: editingProduct.diamondColorGrade || '',
        diamondClarityGrade: editingProduct.diamondClarityGrade || '',
        diamondCutGrade: editingProduct.diamondCutGrade || '',
        diamondMetalDetails: editingProduct.diamondMetalDetails || '',
        diamondCertification: editingProduct.diamondCertification || '',
        diamondOrigin: editingProduct.diamondOrigin || '',
        diamondCaratWeight: editingProduct.diamondCaratWeight || '',
        diamondQuantity: editingProduct.diamondQuantity?.toString() || '',
        platinumWeight: editingProduct.platinumWeight || '',
        platinumType: editingProduct.platinumType || '',
        silverWeight: editingProduct.silverWeight || '',
        silverType: editingProduct.silverType || '',
        digitalBrowser: editingProduct.digitalBrowser || false,
        website: editingProduct.website || false,
        distributor: editingProduct.distributor || false,
        normalUser: editingProduct.normalUser || false,
        resellerUser: editingProduct.resellerUser || false,
        culture: editingProduct.culture || '',
        seoTitle: editingProduct.seoTitle || '',
        seoDescription: editingProduct.seoDescription || '',
        seoKeywords: editingProduct.seoKeywords || '',
        seoSlug: editingProduct.seoSlug || ''
      });
      setSelectedImages([]);
      if (editingProduct.images && editingProduct.images.length > 0) {
        const imageUrls = editingProduct.images
          .slice()
          .sort((a, b) => a.order - b.order)
          .map(img => {
            if (img.url.startsWith('http')) {
              return img.url;
            } else if (img.url.startsWith('/')) {
              const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
              const fullUrl = baseUrl.endsWith('/') ? `${baseUrl.slice(0, -1)}${img.url}` : `${baseUrl}${img.url}`;
              return fullUrl;
            } else {
              const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
              const basePath = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
              const fullUrl = `${basePath}${img.url}`;
              return fullUrl;
            }
          });
        setPreviewImages(imageUrls);
      } else if (editingProduct.imageUrl) {
        let fullImageUrl = editingProduct.imageUrl;
        if (!editingProduct.imageUrl.startsWith('http')) {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
          if (editingProduct.imageUrl.startsWith('/')) {
            fullImageUrl = baseUrl.endsWith('/') ? `${baseUrl.slice(0, -1)}${editingProduct.imageUrl}` : `${baseUrl}${editingProduct.imageUrl}`;
          } else {
            const basePath = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
            fullImageUrl = `${basePath}${editingProduct.imageUrl}`;
          }
        }
        setPreviewImages([fullImageUrl]);
      } else {
        setPreviewImages([]);
      }
      if (editingProduct.videoUrl) {
        setVideoPreview(editingProduct.videoUrl);
      } else {
        setVideoPreview('');
      }
      setSelectedVideoFile(null);
    } else {
      resetForm();
    }
  }, [editingProduct, reset]);

  useEffect(() => {
    if (editingProduct && categories.length > 0) {
      const resolvedCategoryId =
        categories.find(c => c.id === (editingProduct.category || ''))?.id ||
        categories.find(c => c.title.toLowerCase() === (editingProduct.category || '').toLowerCase())?.id ||
        '';
      setValue('category', resolvedCategoryId);
      if (subcategories.length > 0) {
        const resolvedSubcategoryId =
          subcategories.find(s => s.id === (editingProduct.subCategory || ''))?.id ||
          subcategories.find(s => s.name.toLowerCase() === (editingProduct.subCategory || '').toLowerCase() && (resolvedCategoryId ? s.categoryId === resolvedCategoryId : true))?.id ||
          '';
        setValue('subCategory', resolvedSubcategoryId);
      }
    }
  }, [editingProduct, categories, subcategories, setValue]);

  useEffect(() => {
    if (isOpen && !editingProduct) {
      resetForm();
    }
  }, [isOpen, editingProduct]);

  // Handle form submission
  const onSubmit = async (data: ProductFormData) => {
    try {
      const apiUrl = `${getApiBaseUrl()}/products`;
      
      // if (!isAuthenticated) {
      //   toast.error('Authentication required. Please log in again.');
      //   if (typeof window !== 'undefined') {
      //     window.location.href = '/';
      //   }
      //   return;
      // }
      if (!editingProduct && data.productCode && data.productCode.trim() !== '') {
        const checkUrl = `${getApiBaseUrl()}/products/admin/all?search=${encodeURIComponent(data.productCode.trim())}&status=all&limit=5&page=1`;
        try {
          const dupResp = await fetch(checkUrl, { method: 'GET', credentials: 'include' });
          if (dupResp.ok) {
            const dupJson = await dupResp.json();
            const list = dupJson?.data || [];
            const exists = Array.isArray(list) && list.some((p: any) => ((p?.productCode || '').toLowerCase() === data.productCode!.trim().toLowerCase()));
            if (exists) {
              toast.error('Product Code already available');
              return;
            }
          }
        } catch {}
      }
      
      const formData = new FormData();
      formData.append('productCode', data.productCode || '');
      formData.append('name', data.name || '');
      formData.append('description', data.description || '');
      if (data.fullDescription) {
        formData.append('fullDescription', data.fullDescription);
      }
      formData.append('category', data.category || '');
      formData.append('subCategory', data.subCategory || '');
      if (data.jewelryType) {
        formData.append('jewelryType', data.jewelryType);
      }
      if (data.price && data.price.trim() !== '') {
        formData.append('price', data.price);
      }
      formData.append('isActive', (data.isActive ?? false).toString());
      formData.append('status', data.status ?? 'draft');
      
      // Gold Fields
      formData.append('goldWeight', data.goldWeight || '');
      formData.append('goldPurity', data.goldPurity || '');
      formData.append('goldType', data.goldType || '');
      formData.append('goldCraftsmanship', data.goldCraftsmanship || '');
      formData.append('goldDesignDescription', data.goldDesignDescription || '');
      formData.append('goldFinishedType', data.goldFinishedType || '');
      formData.append('goldStones', data.goldStones || '');
      formData.append('goldStoneQuality', data.goldStoneQuality || '');
      
      // Diamond Fields
      formData.append('diamondType', data.diamondType || '');
      formData.append('diamondShapeCut', data.diamondShapeCut || '');
      formData.append('diamondColorGrade', data.diamondColorGrade || '');
      formData.append('diamondClarityGrade', data.diamondClarityGrade || '');
      formData.append('diamondCutGrade', data.diamondCutGrade || '');
      formData.append('diamondMetalDetails', data.diamondMetalDetails || '');
      formData.append('diamondCertification', data.diamondCertification || '');
      formData.append('diamondOrigin', data.diamondOrigin || '');
      formData.append('diamondCaratWeight', data.diamondCaratWeight || '');
      formData.append('diamondQuantity', data.diamondQuantity !== undefined && data.diamondQuantity !== null ? data.diamondQuantity.toString() : '');
      
      // Platinum Fields
      formData.append('platinumWeight', data.platinumWeight || '');
      formData.append('platinumType', data.platinumType || '');
      
      // Silver Fields
      formData.append('silverWeight', data.silverWeight || '');
      formData.append('silverType', data.silverType || '');
      // Other Fields
      formData.append('orderDuration', data.orderDuration || '');
      formData.append('digitalBrowser', (data.digitalBrowser ?? false).toString());
      formData.append('website', (data.website ?? false).toString());
      formData.append('distributor', (data.distributor ?? false).toString());
      formData.append('normalUser', (data.normalUser ?? false).toString());
      formData.append('resellerUser', (data.resellerUser ?? false).toString());
      if (data.culture) {
        formData.append('culture', data.culture);
      }
      if (data.seoTitle) {
        formData.append('seoTitle', data.seoTitle);
      }
      if (data.seoDescription) {
        formData.append('seoDescription', data.seoDescription);
      }
      if (data.seoKeywords) {
        formData.append('seoKeywords', data.seoKeywords);
      }
      formData.append('seoSlug', data.seoSlug || '');
      if (data.videoUrl) {
        formData.append('videoUrl', data.videoUrl);
      }
      
      // Handle image uploads
      if (selectedImages.length > 0) {
        selectedImages.forEach((image, index) => {
          formData.append('images', image);
        });
      } else if (editingProduct && editingProduct.images && editingProduct.images.length > 0) {
        const imageUrls = editingProduct.images
          .filter(img => img.isActive)
          .sort((a, b) => a.order - b.order)
          .map(img => img.url);
        if (imageUrls.length > 0) {
          formData.append('imageUrls', JSON.stringify(imageUrls));
        }
      }
      
      // Handle video upload
      if (selectedVideoFile) {
        formData.append('video', selectedVideoFile);
      }
      
      // Make API request
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `${apiUrl}/${editingProduct.id}` : apiUrl;
      
      console.log('Making API request:', { method, url, formData });
      
      // Ensure we have a CSRF token
      const token = await fetchCsrfToken();
      if (!token) {
        console.error('Failed to fetch CSRF token');
        toast.error('Authentication failed. Please refresh the page and try again.');
        return;
      }
      
      const response = await fetch(url, {
        method,
        body: formData,
        credentials: 'include',
        headers: {
          'x-csrf-token': token
        }
      });
      
      console.log('API response received:', { status: response.status, statusText: response.statusText, headers: Object.fromEntries(response.headers.entries()) });
      
      let result: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        let json: any = null;
        try {
          json = await response.json();
        } catch {}
        if (json && typeof json === 'object') {
          result = {
            success: typeof json.success === 'boolean' ? json.success : response.ok,
            message: json.message || json.error || (response.ok ? 'Success' : `HTTP ${response.status}: ${response.statusText}`),
            data: json.data ?? json
          };
        } else {
          const text = await response.text();
          result = {
            success: response.ok,
            message: response.ok ? 'Success' : `HTTP ${response.status}: ${response.statusText}`,
            data: text
          };
        }
        console.log('JSON response normalized:', result);
      } else {
        const text = await response.text();
        console.log('Text response body:', text);
        result = {
          success: response.ok,
          message: response.ok ? 'Success' : `HTTP ${response.status}: ${response.statusText}`,
          data: text
        };
      }
      
      if (response.ok && result.success) {
        Object.keys(data).forEach(key => {
          if ([
            'diamondType', 'diamondShapeCut', 'diamondColorGrade', 'diamondClarityGrade', 
            'diamondCutGrade', 'diamondMetalDetails', 'diamondCertification', 'diamondOrigin',
            'diamondCaratWeight', 'diamondQuantity', 'goldPurity', 'goldType', 'goldCraftsmanship', 
            'goldDesignDescription', 'goldFinishedType', 'goldStones', 'goldStoneQuality',
            'platinumType', 'silverType'
          ].includes(key)) {
            const value = data[key as keyof ProductFormData];
            if (value && typeof value === 'string') {
              productAttributeService.addToCache(key as any, value);
            }
          }
        });
        
        toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        onSuccess();
        onClose();
      } else {
        const fallbackMessage = result && typeof result === 'object'
          ? (result.message || (response.ok ? 'Unexpected response' : `HTTP ${response.status}: ${response.statusText}`))
          : `HTTP ${response.status}: ${response.statusText}`;
        console.error('API error:', fallbackMessage);
        console.error('API error payload:', result);
        console.error('Request URL:', url);
        console.error('Request method:', method);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        } else {
          const message409 = response.status === 409 ? 'Product Code already available' : undefined;
          toast.error(message409 || fallbackMessage || (editingProduct ? 'Failed to update product' : 'Failed to create product'));
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form');
    }
  };

  // Handle video file selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto title-regular`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black italic">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-black hover:text-black"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium text-black mb-2">
                  Product Code
                </label>
                <Controller
                  name="productCode"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.productCode ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter Product Code"
                    />
                  )}
                />
                {errors.productCode && <p className="text-red-500 text-sm mt-1">{errors.productCode.message}</p>}
              </div>

              <div>
                <label className="block text-lg font-medium text-black mb-2">
                  Name
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Product Name"
                    />
                  )}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-medium text-black mb-2">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                    rows={10}
                    placeholder="Enter product description"
                  />
                )}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-lg font-medium text-black mb-2">
                Full Description
              </label>
              <Controller
                name="fullDescription"
                control={control}
                render={({ field }) => {
                  return (
                    <RichTextEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      height="500px"
                    />
                  );
                }}
              />
              {errors.fullDescription && <p className="text-red-500 text-sm mt-1">{errors.fullDescription.message}</p>}
            </div>

            {/* Category and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-lg font-medium text-black mb-2">
                  Category
                </label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                      value={field.value || ''}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <label className="block text-lg font-medium text-black mb-2">
                  Subcategory
                </label>
                <Controller
                  name="subCategory"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black ${errors.subCategory ? 'border-red-500' : 'border-gray-300'}`}
                      value={field.value || ''}
                      disabled={!watchCategory}
                    >
                      <option value="">Select Subcategory</option>
                      {filteredSubcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.subCategory && <p className="text-red-500 text-sm mt-1">{errors.subCategory.message}</p>}
              </div>
              <div>
                <label className="block text-lg font-medium text-black mb-2">
                  Jewelry Type
                </label>
                <Controller
                  name="jewelryType"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black ${errors.jewelryType ? 'border-red-500' : 'border-gray-300'}`}
                      value={field.value || ''}
                    >
                      <option value="">Select Jewelry Type</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Kids">Kids</option>
                    </select>
                  )}
                />
                {errors.jewelryType && <p className="text-red-500 text-sm mt-1">{errors.jewelryType.message}</p>}
              </div>
              <div>
                <label className="block text-lg font-medium text-black mb-2">
                  Price
                </label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="0.00"
                    />
                  )}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
              </div>
            </div>

            {/* Culture */}
            <div>
              <label className="block text-lg font-medium text-black mb-2">
                Cultural Background
              </label>
              <Controller
                name="culture"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black ${errors.culture ? 'border-red-500' : 'border-gray-300'}`}
                    value={field.value || ''}
                  >
                    <option value="">Select Culture</option>
                    <option value="None">None</option>
                    <option value="Newari">Newari</option>
                    <option value="Brahmin/Chhetri">Brahmin/Chhetri</option>
                    <option value="Tamang">Tamang</option>
                  </select>
                )}
              />
              {errors.culture && <p className="text-red-500 text-sm mt-1">{errors.culture.message}</p>}
            </div>

            {/* Product Images */}
            <div>
              <label className="block text-lg font-medium text-black mb-2">
                Product Images
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-auto object-contain rounded-lg border border-gray-300 max-h-64"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleCropImage(index)}
                        className="bg-white text-black px-2 py-1 rounded text-xs font-medium"
                      >
                        Crop
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newPreviewImages = previewImages.filter((_, i) => i !== index);
                        const newSelectedImages = selectedImages.filter((_, i) => i !== index);
                        setPreviewImages(newPreviewImages);
                        setSelectedImages(newSelectedImages);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-black mt-2">Add Images</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </label>
              </div>
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-lg font-medium text-black mb-2">
                Product Video
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-black mt-2">Upload Video</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handleVideoChange}
                    />
                  </label>
                </div>
                {videoPreview && (
                  <div className="relative">
                    <video 
                      src={videoPreview} 
                      controls 
                      className="w-full h-auto object-contain rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setVideoPreview('');
                        setSelectedVideoFile(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Diamond Details */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold italic text-gray-900 mb-4">Diamond Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Diamond Type
                  </label>
                  <Controller
                    name="diamondType"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="diamondType"
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Select or enter diamond type"
                        forceDropdown={true}
                        allowCustomValue={true}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.diamondType ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.diamondType && <p className="text-red-500 text-sm mt-1">{errors.diamondType.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Diamond Shape/Cut
                  </label>
                  <Controller
                    name="diamondShapeCut"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="diamondShapeCut"
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Select or enter shape/cut"
                        forceDropdown={true}
                        allowCustomValue={true}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.diamondShapeCut ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.diamondShapeCut && <p className="text-red-500 text-sm mt-1">{errors.diamondShapeCut.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Color Grade
                  </label>
                  <Controller
                    name="diamondColorGrade"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="diamondColorGrade"
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Select or enter color grade"
                        forceDropdown={true}
                        allowCustomValue={true}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.diamondColorGrade ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.diamondColorGrade && <p className="text-red-500 text-sm mt-1">{errors.diamondColorGrade.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Origin
                  </label>
                  <Controller
                    name="diamondOrigin"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="diamondOrigin"
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Select or enter origin"
                        forceDropdown={true}
                        allowCustomValue={true}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.diamondOrigin ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.diamondOrigin && <p className="text-red-500 text-sm mt-1">{errors.diamondOrigin.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Clarity
                  </label>
                  <Controller
                    name="diamondClarityGrade"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="diamondClarityGrade"
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Select or enter clarity"
                        forceDropdown={true}
                        allowCustomValue={true}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.diamondClarityGrade ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.diamondClarityGrade && <p className="text-red-500 text-sm mt-1">{errors.diamondClarityGrade.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Cut Grade
                  </label>
                  <Controller
                    name="diamondCutGrade"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="diamondCutGrade"
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Select or enter cut grade"
                        forceDropdown={true}
                        allowCustomValue={true}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.diamondCutGrade ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.diamondCutGrade && <p className="text-red-500 text-sm mt-1">{errors.diamondCutGrade.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Metal Details
                  </label>
                  <Controller
                    name="diamondMetalDetails"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="diamondMetalDetails"
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Select or enter metal details"
                        forceDropdown={true}
                        allowCustomValue={true}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.diamondMetalDetails ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.diamondMetalDetails && <p className="text-red-500 text-sm mt-1">{errors.diamondMetalDetails.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Certification
                  </label>
                  <Controller
                    name="diamondCertification"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="diamondCertification"
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Select or enter certification"
                        forceDropdown={true}
                        allowCustomValue={true}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.diamondCertification ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.diamondCertification && <p className="text-red-500 text-sm mt-1">{errors.diamondCertification.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Carat Weight
                  </label>
                  <Controller
                    name="diamondCaratWeight"
                    control={control}
                    render={({ field }) => (
                      <input
                       {...field}
                       type='text'
                        placeholder="Select or enter carat weight"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.diamondCaratWeight ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.diamondCaratWeight && <p className="text-red-500 text-sm mt-1">{errors.diamondCaratWeight.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Diamond Pieces
                  </label>
                  <Controller
                    name="diamondQuantity"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        placeholder="Enter number of diamond pieces"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.diamondQuantity ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.diamondQuantity && <p className="text-red-500 text-sm mt-1">{errors.diamondQuantity.message}</p>}
                </div>
              </div>
            </div>

            {/* Gold Details */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold italic text-gray-900 mb-4">Gold Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Gold Purity
                  </label>
                  <Controller
                    name="goldPurity"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="goldPurity"
                        value={field.value || ''}
                        onChange={field.onChange}
                        forceDropdown={true}
                        allowCustomValue={true}
                        placeholder="Select or enter gold purity"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.goldPurity ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.goldPurity && <p className="text-red-500 text-sm mt-1">{errors.goldPurity.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Gold Type
                  </label>
                  <Controller
                    name="goldType"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="goldType"
                        value={field.value || ''}
                        onChange={field.onChange}
                         forceDropdown={true}
                        allowCustomValue={true}
                        placeholder="Select or enter gold type"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.goldType ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.goldType && <p className="text-red-500 text-sm mt-1">{errors.goldType.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Gold Weight
                  </label>
                  <Controller
                    name="goldWeight"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="goldWeight"
                        value={field.value || ''}
                         forceDropdown={true}
                        allowCustomValue={true}
                        onChange={field.onChange}
                        placeholder="Select or enter gold weight"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.goldWeight ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.goldWeight && <p className="text-red-500 text-sm mt-1">{errors.goldWeight.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Craftsmanship
                  </label>
                  <Controller
                    name="goldCraftsmanship"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        placeholder="Select or enter craftsmanship"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.goldCraftsmanship ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.goldCraftsmanship && <p className="text-red-500 text-sm mt-1">{errors.goldCraftsmanship.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Design Description
                  </label>
                  <Controller
                    name="goldDesignDescription"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        placeholder="Select or enter design description"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.goldDesignDescription ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.goldDesignDescription && <p className="text-red-500 text-sm mt-1">{errors.goldDesignDescription.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Finished Type
                  </label>
                  <Controller
                    name="goldFinishedType"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="goldFinishedType"
                        value={field.value || ''}
                        onChange={field.onChange}
                         forceDropdown={true}
                        allowCustomValue={true}
                        placeholder="Select or enter finished type"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.goldFinishedType ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.goldFinishedType && <p className="text-red-500 text-sm mt-1">{errors.goldFinishedType.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Stones
                  </label>
                  <Controller
                    name="goldStones"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="goldStones"
                        value={field.value || ''}
                        onChange={field.onChange}
                        forceDropdown={true}
                        allowCustomValue={true}
                        placeholder="Select or enter stones"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.goldStones ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.goldStones && <p className="text-red-500 text-sm mt-1">{errors.goldStones.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Stone Quality
                  </label>
                  <Controller
                    name="goldStoneQuality"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="goldStoneQuality"
                        value={field.value || ''}
                         forceDropdown={true}
                        allowCustomValue={true}
                        onChange={field.onChange}
                        placeholder="Select or enter stone quality"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.goldStoneQuality ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.goldStoneQuality && <p className="text-red-500 text-sm mt-1">{errors.goldStoneQuality.message}</p>}
                </div>
              </div>
            </div>

            {/* Platinum Details */}
            <div className="border-t pt-6">
              <h3 className="text-xl italic font-semibold text-gray-900 mb-4">Platinum Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Platinum Weight
                  </label>
                  <Controller
                    name="platinumWeight"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="platinumWeight"
                        value={field.value || ''}
                        onChange={field.onChange}
                         forceDropdown={true}
                        allowCustomValue={true}
                        placeholder="Select or enter platinum weight"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.platinumWeight ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.platinumWeight && <p className="text-red-500 text-sm mt-1">{errors.platinumWeight.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Platinum Type
                  </label>
                  <Controller
                    name="platinumType"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="platinumType"
                        value={field.value || ''}
                        onChange={field.onChange}
                        forceDropdown={true}
                        allowCustomValue={true}
                        placeholder="Select or enter platinum type"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.platinumType ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.platinumType && <p className="text-red-500 text-sm mt-1">{errors.platinumType.message}</p>}
                </div>
              </div>
            </div>

            {/* Silver Details */}
            <div className="border-t pt-6">
              <h3 className="text-xl italic font-semibold text-gray-900 mb-4">Silver Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Silver Weight
                  </label>
                  <Controller
                    name="silverWeight"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="silverWeight"
                        value={field.value || ''}
                        onChange={field.onChange}
                        forceDropdown={true}
                        allowCustomValue={true}
                        placeholder="Select or enter silver weight"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.silverWeight ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.silverWeight && <p className="text-red-500 text-sm mt-1">{errors.silverWeight.message}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    Silver Type
                  </label>
                  <Controller
                    name="silverType"
                    control={control}
                    render={({ field }) => (
                      <DynamicDropdown
                        attribute="silverType"
                        value={field.value || ''}
                        onChange={field.onChange}
                        forceDropdown={true}
                        allowCustomValue={true}
                        placeholder="Select or enter silver type"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.silverType ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  />
                  {errors.silverType && <p className="text-red-500 text-sm mt-1">{errors.silverType.message}</p>}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="border-t pt-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
                        value={field.value}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    )}
                  />
                  {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                </div>
              </div>
            </div>

            {/* Estimated Order Period */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Estimated Order Period
                  </label>
                  <Controller
                    name="orderDuration"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.orderDuration ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter estimated order period (e.g., 2-3 weeks)"
                      />
                    )}
                  />
                  {errors.orderDuration && <p className="text-red-500 text-sm mt-1">{errors.orderDuration.message}</p>}
                </div>
              </div>
            </div>

            {/* Distribution Channels */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Channels</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Controller
                    name="digitalBrowser"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Digital Browser
                  </label>
                </div>
                <div className="flex items-center">
                  <Controller
                    name="website"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Website
                  </label>
                </div>
                <div className="flex items-center">
                  <Controller
                    name="distributor"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Distributor
                  </label>
                </div>
                <div className="flex items-center">
                  <Controller
                    name="normalUser"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Normal User
                  </label>
                </div>
                <div className="flex items-center">
                  <Controller
                    name="resellerUser"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Reseller User
                  </label>
                </div>
              </div>
            </div>

            {/* SEO Information */}
            <div className="border-t pt-6">
              <h3 className="text-xl italic font-semibold text-gray-900 mb-4">SEO Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-black mb-2">
                    SEO Title
                  </label>
                  <Controller
                    name="seoTitle"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.seoTitle ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Meta title"
                      />
                    )}
                  />
                  {errors.seoTitle && <p className="text-red-500 text-sm mt-1">{errors.seoTitle.message}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-lg font-medium text-black mb-2">
                    SEO Slug
                  </label>
                  <Controller
                    name="seoSlug"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.seoSlug ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter SEO slug"
                      />
                    )}
                  />
                  {errors.seoSlug && <p className="text-red-500 text-sm mt-1">{errors.seoSlug.message}</p>}
                </div>

                {/* Video URL */}
                <div className="col-span-2">
                  <label className="block text-lg font-medium text-black mb-2">
                    Video URL
                  </label>
                  <Controller
                    name="videoUrl"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.videoUrl ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter video URL"
                      />
                    )}
                  />
                  {errors.videoUrl && <p className="text-red-500 text-sm mt-1">{errors.videoUrl.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-medium text-black mb-2">
                    SEO Description
                  </label>
                  <Controller
                    name="seoDescription"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.seoDescription ? 'border-red-500' : 'border-gray-300'}`}
                        rows={3}
                        placeholder="Meta description"
                      />
                    )}
                  />
                  {errors.seoDescription && <p className="text-red-500 text-sm mt-1">{errors.seoDescription.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-lg font-medium text-black mb-2">
                    SEO Keywords
                  </label>
                  <Controller
                    name="seoKeywords"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black placeholder-black ${errors.seoKeywords ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Meta keywords (comma separated)"
                      />
                    )}
                  />
                  {errors.seoKeywords && <p className="text-red-500 text-sm mt-1">{errors.seoKeywords.message}</p>}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={formIsSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const formData = getValues();
                  const previewProduct: ProductPreviewData = {
                    id: editingProduct?.id,
                    productCode: formData.productCode || '',
                    name: formData.name || '',
                    description: formData.description || '',
                    fullDescription: formData.fullDescription,
                    category: formData.category || '',
                    subCategory: formData.subCategory,
                    jewelryType: formData.jewelryType,
                    price: formData.price ? parseFloat(formData.price) : 0,
                    isActive: formData.isActive ?? false,
                    status: (formData.status as 'draft' | 'active' | 'inactive') || 'draft',
                    
                    // Gold Fields
                    goldWeight: formData.goldWeight,
                    goldPurity: formData.goldPurity,
                    goldType: formData.goldType,
                    goldCraftsmanship: formData.goldCraftsmanship,
                    goldDesignDescription: formData.goldDesignDescription,
                    goldFinishedType: formData.goldFinishedType,
                    goldStones: formData.goldStones,
                    goldStoneQuality: formData.goldStoneQuality,
                    
                    // Diamond Fields
                    diamondType: formData.diamondType,
                    diamondShapeCut: formData.diamondShapeCut,
                    diamondColorGrade: formData.diamondColorGrade,
                    diamondClarityGrade: formData.diamondClarityGrade,
                    diamondCutGrade: formData.diamondCutGrade,
                    diamondMetalDetails: formData.diamondMetalDetails,
                    diamondCertification: formData.diamondCertification,
                    diamondOrigin: formData.diamondOrigin,
                    diamondCaratWeight: formData.diamondCaratWeight,
                    diamondQuantity: formData.diamondQuantity && !isNaN(parseInt(formData.diamondQuantity)) ? parseInt(formData.diamondQuantity) : undefined,
                    
                    // Platinum Fields
                    platinumWeight: formData.platinumWeight,
                    platinumType: formData.platinumType,
                    
                    // Silver Fields
                    silverWeight: formData.silverWeight,
                    silverType: formData.silverType,
                    
                    orderDuration: formData.orderDuration,
                    digitalBrowser: formData.digitalBrowser ?? false,
                    website: formData.website ?? false,
                    distributor: formData.distributor ?? false,
                    normalUser: formData.normalUser ?? false,
                    resellerUser: formData.resellerUser ?? false,
                    culture: formData.culture,
                    seoTitle: formData.seoTitle,
                    seoDescription: formData.seoDescription,
                    seoKeywords: formData.seoKeywords,
                    seoSlug: formData.seoSlug,
                    stoneWeight: formData.stoneWeight,
                    caret: formData.caret,
                    imageUrl: previewImages.length > 0 ? previewImages[0] : '',
                    images: previewImages.map((url, index) => ({
                      id: `preview-${index}`,
                      url,
                      altText: `Preview ${index + 1}`,
                      order: index,
                      isActive: true,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    })),
                    videoUrl: videoPreview || undefined,
                    createdAt: editingProduct?.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  setPreviewData(previewProduct);
                  setIsPreviewOpen(true);
                }}
                className="px-6 py-2 bg-[#9A8873] text-white rounded-lg hover:bg-[#242f40] transition-colors"
                disabled={formIsSubmitting}
              >
                Preview
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#9A8873] text-white rounded-lg hover:bg-[#242f40] transition-colors"
                disabled={formIsSubmitting}
              >
                {formIsSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </form>
        </div>

        {/* Image Cropping Modal */}
        {croppingImageIndex !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Crop Image</h3>
                  <button
                    onClick={() => {
                      setCroppingImageIndex(null);
                      setCroppingImageUrl('');
                      setCrop(undefined);
                      setCompletedCrop(undefined);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-full max-h-[70vh] overflow-auto">
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      minWidth={100}
                      minHeight={100}
                    >
                      <img
                        ref={imgRef}
                        src={croppingImageUrl}
                        alt="Crop preview"
                        className="max-h-[65vh] w-auto"
                        onLoad={() => {
                          const img = imgRef.current;
                          if (img) {
                            const { width, height } = img;
                            const crop = centerCrop(
                              makeAspectCrop(
                                {
                                  unit: '%',
                                  width: 50,
                                  height: 50
                                },
                                1,
                                width,
                                height
                              ),
                              width,
                              height
                            );
                            setCrop(crop);
                          }
                        }}
                      />
                    </ReactCrop>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={handleCompleteCrop}
                      className="px-4 py-2 bg-[#9A8873] text-white rounded hover:bg-[#242f40] transition-colors"
                    >
                      Confirm Crop
                    </button>
                    <button
                      onClick={() => {
                        setCroppingImageIndex(null);
                        setCroppingImageUrl('');
                        setCrop(undefined);
                        setCompletedCrop(undefined);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Preview Modal */}
        {isPreviewOpen && previewData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" onClick={() => setIsPreviewOpen(false)}>
            <div 
              className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <h2 className="text-3xl font-bold text-black">{previewData.name}</h2>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left side - Product Images */}
                  <div
                    className="group relative aspect-square bg-gray-100 rounded-xl"
                    onMouseEnter={() => setIsImageHovering(true)}
                    onMouseLeave={() => setIsImageHovering(false)}
                    onTouchStart={() => setIsImageHovering(true)}
                    onTouchEnd={() => setIsImageHovering(false)}
                  >
                    {previewData.images && previewData.images.length > 0 ? (
                      <>
                        <img
                          src={previewData.images[currentImageIndex].url}
                          alt={`${previewData.name} - Image ${currentImageIndex + 1}`}
                          className="object-cover w-full h-full rounded-xl shadow-lg"
                        />
                        
                        {/* Navigation arrows */}
                        {previewData.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(prev => 
                                  prev > 0 ? prev - 1 : previewData.images!.length - 1
                                );
                              }}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                              aria-label="Previous image"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(prev => 
                                  prev < previewData.images!.length - 1 ? prev + 1 : 0
                                );
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                              aria-label="Next image"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            
                            {/* Image indicators */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                              {previewData.images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex(index);
                                  }}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentImageIndex 
                                      ? 'bg-white w-4' 
                                      : 'bg-white/50 hover:bg-white/75'
                                  }`}
                                  aria-label={`Go to image ${index + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Right side - Product Details */}
                  <div className="space-y-8">
                    {/* Description */}
                    <div>
                      <h3 className="text-xl font-semibold text-black mb-4">Description</h3>
                      <p className="text-black leading-relaxed text-lg">{previewData.description}</p>
                    </div>

                    {/* Product Information */}
                    <div className="border border-gray-200 rounded-lg">
                      <div className="px-6 py-4 space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-black">Product Code:</span>
                          <span className="font-medium text-black">{previewData.productCode || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-black">Category:</span>
                          <span className="font-medium text-black">
                            {categories.find(cat => cat.id === previewData.category)?.title || previewData.category || 'N/A'}
                          </span>
                        </div>
                        {previewData.subCategory && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-black">Sub Category:</span>
                            <span className="font-medium text-black">
                              {subcategories.find(sub => sub.id === previewData.subCategory)?.name || previewData.subCategory}
                            </span>
                          </div>
                        )}
                        {previewData.jewelryType && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-black">Jewelry Type:</span>
                            <span className="font-medium text-black">{previewData.jewelryType}</span>
                          </div>
                        )}
                        {previewData.culture && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-black">Culture Background:</span>
                            <span className="font-medium text-black">{previewData.culture}</span>
                          </div>
                        )}
                        {previewData.orderDuration && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-black">Estimated Order Period:</span>
                            <span className="font-medium text-black">{previewData.orderDuration}</span>
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Distribution Channels */}
                    <div>
                      <h3 className="text-xl font-semibold text-black mb-4">Distribution Channels</h3>
                      <div className="flex flex-wrap gap-2">
                        {previewData.digitalBrowser && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black">
                            Digital Browser
                          </span>
                        )}
                        {previewData.website && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black">
                            Website
                          </span>
                        )}
                        {previewData.distributor && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black">
                            Distributor
                          </span>
                        )}
                        {previewData.normalUser && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black">
                            Normal User
                          </span>
                        )}
                        {previewData.resellerUser && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black">
                            Reseller User
                          </span>
                        )}
                        {!previewData.digitalBrowser && !previewData.website && !previewData.distributor && !previewData.normalUser && !previewData.resellerUser && (
                          <span className="text-sm text-black">No distribution channels selected</span>
                        )}
                      </div>
                    </div>

                    {/* Gold Details */}
                    {(previewData.goldWeight || 
                      previewData.goldPurity || 
                      previewData.goldType ||
                      previewData.goldCraftsmanship ||
                      previewData.goldDesignDescription ||
                      previewData.goldFinishedType ||
                      previewData.goldStones ||
                      previewData.goldStoneQuality) && (
                      <div className="border border-gray-200 rounded-lg">
                        <div className="px-6 py-4 space-y-3">
                          <h3 className="text-xl font-semibold text-black mb-4">Gold Details</h3>
                          {previewData.goldWeight && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Gold Weight:</span>
                              <span className="font-medium text-black">{previewData.goldWeight}</span>
                            </div>
                          )}
                          {previewData.goldPurity && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Gold Purity:</span>
                              <span className="font-medium text-black">{previewData.goldPurity}</span>
                            </div>
                          )}
                          {previewData.goldType && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Gold Type:</span>
                              <span className="font-medium text-black">{previewData.goldType}</span>
                            </div>
                          )}
                          {previewData.goldCraftsmanship && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Craftsmanship:</span>
                              <span className="font-medium text-black">{previewData.goldCraftsmanship}</span>
                            </div>
                          )}
                          {previewData.goldDesignDescription && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Design Description:</span>
                              <span className="font-medium text-black">{previewData.goldDesignDescription}</span>
                            </div>
                          )}
                          {previewData.goldFinishedType && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Finished Type:</span>
                              <span className="font-medium text-black">{previewData.goldFinishedType}</span>
                            </div>
                          )}
                          {previewData.goldStones && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Stones:</span>
                              <span className="font-medium text-black">{previewData.goldStones}</span>
                            </div>
                          )}
                          {previewData.goldStoneQuality && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Stone Quality:</span>
                              <span className="font-medium text-black">{previewData.goldStoneQuality}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Diamond Details */}
                    {(previewData.diamondType || 
                      previewData.diamondShapeCut || 
                      previewData.diamondColorGrade || 
                      previewData.diamondClarityGrade ||
                      previewData.diamondCutGrade ||
                      previewData.diamondCaratWeight ||
                      previewData.diamondMetalDetails ||
                      previewData.diamondCertification ||
                      previewData.diamondOrigin) && (
                      <div className="border border-gray-200 rounded-lg">
                        <div className="px-6 py-4 space-y-3">
                          <h3 className="text-xl font-semibold text-black mb-4">Diamond Details</h3>
                          {previewData.diamondType && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Diamond Type:</span>
                              <span className="font-medium text-black">{previewData.diamondType}</span>
                            </div>
                          )}
                          {previewData.diamondShapeCut && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Diamond Shape/Cut:</span>
                              <span className="font-medium text-black">{previewData.diamondShapeCut}</span>
                            </div>
                          )}
                          {previewData.diamondColorGrade && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Color Grade:</span>
                              <span className="font-medium text-black">{previewData.diamondColorGrade}</span>
                            </div>
                          )}
                          {previewData.diamondClarityGrade && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Clarity:</span>
                              <span className="font-medium text-black">{previewData.diamondClarityGrade}</span>
                            </div>
                          )}
                          {previewData.diamondCutGrade && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Cut Grade:</span>
                              <span className="font-medium text-black">{previewData.diamondCutGrade}</span>
                            </div>
                          )}
                          {previewData.diamondCaratWeight && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Carat Weight:</span>
                              <span className="font-medium text-black">{previewData.diamondCaratWeight}</span>
                            </div>
                          )}
                          {previewData.diamondQuantity !== undefined && previewData.diamondQuantity !== null && previewData.diamondQuantity !== 0 && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Diamond Pieces:</span>
                              <span className="font-medium text-black">{previewData.diamondQuantity}</span>
                            </div>
                          )}
                          {previewData.diamondMetalDetails && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Metal Details:</span>
                              <span className="font-medium text-black">{previewData.diamondMetalDetails}</span>
                            </div>
                          )}
                          {previewData.diamondCertification && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Certification:</span>
                              <span className="font-medium text-black">{previewData.diamondCertification}</span>
                            </div>
                          )}
                          {previewData.diamondOrigin && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Origin:</span>
                              <span className="font-medium text-black">{previewData.diamondOrigin}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Platinum Details */}
                    {(previewData.platinumWeight || 
                      previewData.platinumType) && (
                      <div className="border border-gray-200 rounded-lg">
                        <div className="px-6 py-4 space-y-3">
                          <h3 className="text-xl font-semibold text-black mb-4">Platinum Details</h3>
                          {previewData.platinumWeight && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Platinum Weight:</span>
                              <span className="font-medium text-black">{previewData.platinumWeight}</span>
                            </div>
                          )}
                          {previewData.platinumType && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Platinum Type:</span>
                              <span className="font-medium text-black">{previewData.platinumType}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Silver Details */}
                    {(previewData.silverWeight || 
                      previewData.silverType) && (
                      <div className="border border-gray-200 rounded-lg">
                        <div className="px-6 py-4 space-y-3">
                          <h3 className="text-xl font-semibold text-black mb-4">Silver Details</h3>
                          {previewData.silverWeight && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Silver Weight:</span>
                              <span className="font-medium text-black">{previewData.silverWeight}</span>
                            </div>
                          )}
                          {previewData.silverType && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-black">Silver Type:</span>
                              <span className="font-medium text-black">{previewData.silverType}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SEO Information */}
                    {(previewData.seoTitle || previewData.seoDescription || previewData.seoKeywords || previewData.seoSlug) && (
                      <div>
                        <h3 className="text-xl font-semibold text-black mb-4">SEO Information</h3>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="space-y-3">
                            {previewData.seoTitle && (
                              <div>
                                <span className="font-medium text-black">SEO Title:</span>
                                <p className="text-black mt-1">{previewData.seoTitle}</p>
                              </div>
                            )}
                            {previewData.seoSlug && (
                              <div>
                                <span className="font-medium text-black">SEO Slug:</span>
                                <p className="text-black mt-1">{previewData.seoSlug}</p>
                              </div>
                            )}
                            {previewData.seoDescription && (
                              <div>
                                <span className="font-medium text-black">SEO Description:</span>
                                <p className="text-black mt-1">{previewData.seoDescription}</p>
                              </div>
                            )}
                            {previewData.seoKeywords && (
                              <div>
                                <span className="font-medium text-black">SEO Keywords:</span>
                                <p className="text-black mt-1">{previewData.seoKeywords}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
