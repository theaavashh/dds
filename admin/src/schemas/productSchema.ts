import { z } from 'zod';

export const productSchema = z.object({
  // Basic Info
  name: z.string().min(1, 'Product name is required').max(200),
  productCode: z.string().min(1, 'Product code is required').max(100),
  description: z.string().max(5000).optional(),
  fullDescription: z.string().max(10000).optional(),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  status: z.string().default('draft'),

  // Pricing & Stock
  price: z.coerce.number().min(0),
  comparePrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  discountPrice: z.coerce.number().min(0).optional(),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  stock: z.coerce.number().int().min(0).default(0),

  // Channel Flags
  isActive: z.boolean().default(true),
  digitalBrowser: z.boolean().default(false),
  distributor: z.boolean().default(false),
  website: z.boolean().default(false),
  normalUser: z.boolean().default(false),
  resellerUser: z.boolean().default(false),
  culture: z.string().optional(),

  // Jewelry - Gold
  goldWeight: z.string().optional(),
  goldPurity: z.string().optional(),
  goldType: z.string().optional(),
  goldCraftsmanship: z.string().optional(),
  goldDesignDescription: z.string().optional(),
  goldFinishedType: z.string().optional(),
  goldStones: z.string().optional(),
  goldStoneQuality: z.string().optional(),

  // Jewelry - Diamond
  diamondType: z.string().optional(),
  diamondShapeCut: z.string().optional(),
  diamondColorGrade: z.string().optional(),
  diamondClarityGrade: z.string().optional(),
  diamondCutGrade: z.string().optional(),
  diamondMetalDetails: z.string().optional(),
  diamondCertification: z.string().optional(),
  diamondOrigin: z.string().optional(),
  diamondCaratWeight: z.string().optional(),
  diamondDetails: z.string().optional(),
  diamondQuantity: z.coerce.number().int().optional(),
  diamondSize: z.string().optional(),
  diamondWeight: z.string().optional(),
  diamondQuality: z.string().optional(),

  // Jewelry - Platinum & Silver
  platinumType: z.string().optional(),
  platinumWeight: z.string().optional(),
  silverType: z.string().optional(),
  silverWeight: z.string().optional(),

  // Jewelry - General
  jewelryType: z.string().optional(),
  materialType: z.string().optional(),
  metalType: z.string().optional(),
  finish: z.string().optional(),
  orderDuration: z.string().optional(),

  // Media
  imageUrl: z.string().optional(), // Main Image
  images: z.array(z.any()).optional().default([]), // Gallery Images (relation)
  videoUrl: z.string().optional(),

  // Inventory & Shipping
  sku: z.string().optional(),
  weight: z.coerce.number().min(0).optional(),
  dimensions: z.object({
    length: z.coerce.number().min(0).optional(),
    width: z.coerce.number().min(0).optional(),
    height: z.coerce.number().min(0).optional(),
  }).optional(),
  minOrderQuantity: z.coerce.number().int().min(1).optional(),
  maxOrderQuantity: z.coerce.number().int().min(1).optional(),

  // SEO Meta
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  seoKeywords: z.string().optional(),
  seoSlug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  robotsMeta: z.string().default('index, follow'),

  // Image SEO
  seoFriendlyImageFilename: z.string().optional(),
  imageAltText: z.string().optional(),
  imageTitle: z.string().optional(),
  imageWidth: z.coerce.number().int().optional(),
  imageHeight: z.coerce.number().int().optional(),
  lazyLoading: z.boolean().default(true),

  // Social Meta
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterCard: z.string().optional(),
  optimizedImageFormat: z.string().default('webp'),

  // Structured Data (JSON)
  productSchema: z.any().optional(),
  offerSchema: z.any().optional(),
  brandSchema: z.any().optional(),
  breadcrumbSchema: z.any().optional(),
  itemListSchema: z.any().optional(),
  faqSchema: z.any().optional(),

  // Legacy/Other Tags
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isDigital: z.boolean().default(false),
  requiresShipping: z.boolean().default(true),
  trackQuantity: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Advanced filter schema
export const productFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  stockMin: z.number().min(0).optional(),
  stockMax: z.number().min(0).optional(),
  isFeatured: z.boolean().optional(),
  isDigital: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'stock', 'createdAt', 'updatedAt']),
  sortOrder: z.enum(['asc', 'desc']),
});

export type ProductFilterData = z.infer<typeof productFilterSchema>;
