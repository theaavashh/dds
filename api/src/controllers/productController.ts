import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { ApiResponse } from '../types';
import { Product } from '../types';
import fs from 'fs';
import path from 'path';


// Import prisma client
const prisma = new PrismaClient();

// Helper function to ensure directory exists
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Move uploaded files to category-specific directory
const moveFilesToCategoryDir = (imageUrls: string[], category: string): string[] => {
  if (!category) return imageUrls;
  
  const categoryDir = path.join('uploads', 'products', category.toLowerCase());
  ensureDirectoryExists(categoryDir);
  
  return imageUrls.map(url => {
    // Parse the filename from the URL
    const filename = path.basename(url);
    const oldPath = path.join(process.cwd(), url.substring(1)); // Remove leading slash
    const newPath = path.join(categoryDir, filename);
    
    // Move the file to the category directory
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }
    
    // Return the new URL with category subdirectory
    return `/uploads/products/${category.toLowerCase()}/${filename}`;
  });
};

function toBool(v: any, fallback: boolean = false): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v.toLowerCase() === 'true';
  return fallback;
}

function toNum(v: any, fallback: number = 0): number {
  if (v === '' || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

function toStr(v: any, fallback: string = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function extractUploads(req: Request) {
  let imageUrls: string[] = [];
  let uploadedVideoUrl: string | null = null;
  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files.images) {
      // Initially store in the default location
      imageUrls = files.images.map(f => `/uploads/products/${f.filename}`);
    }
    if (files.video && files.video.length > 0) {
      uploadedVideoUrl = `/uploads/products/${files.video[0].filename}`;
    }
  }
  return { imageUrls, uploadedVideoUrl };
}

async function upsertImages(productId: string, uploaded: string[], preserved?: string[] | null) {
  if (uploaded.length > 0) {
    const existingImages = await prisma.productImage.findMany({ where: { productId } });
    const productImages = uploaded.map((url, i) => ({ productId, url, order: i, isActive: true }));
    await prisma.productImage.createMany({ data: productImages });
    for (const image of existingImages) {
      await prisma.productImage.update({ where: { id: image.id }, data: { isActive: false } });
    }
    return uploaded[0] || null;
  }
  if (preserved && preserved.length > 0) {
    const existingImages = await prisma.productImage.findMany({ where: { productId } });
    for (let i = 0; i < preserved.length; i++) {
      const url = preserved[i];
      const existing = existingImages.find((img: any) => img.url === url);
      if (existing) {
        await prisma.productImage.update({ where: { id: existing.id }, data: { order: i, isActive: true } });
      } else {
        await prisma.productImage.create({ data: { productId, url, order: i, isActive: true } });
      }
    }
    const keep = new Set(preserved);
    const deactivate = existingImages.filter((img: any) => !keep.has(img.url));
    for (const image of deactivate) {
      await prisma.productImage.update({ where: { id: image.id }, data: { isActive: false } });
    }
    return preserved[0] || null;
  }
  return null;
}

// Get all products (public)
export const getAllProducts = async (req: Request, res: Response<ApiResponse<Product[]>>) => {
  try {
    const { category, search, page = '1', limit = '12', auth } = req.query;
    const isAuthenticated = auth === 'true';
    
    // Convert page and limit to numbers with defaults
    const pageNum = Number(page);
    const limitNum = Number(limit);
    
    // Validate and set defaults if conversion fails
    const validPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const validLimit = isNaN(limitNum) || limitNum < 1 ? 12 : Math.min(limitNum, 100); // Max 100 per page to prevent abuse

    const channelCheck = isAuthenticated
      ? { OR: [{ website: true }, { distributor: true }] }
      : { OR: [{ website: true }, { normalUser: true }] };

    const searchConditions = search ? {
      OR: [
        { productCode: { equals: search as string, mode: 'insensitive' } }, // Exact match priority (in some cases)
        { productCode: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ]
    } : {};

    const where: any = {
      isActive: true,
      ...channelCheck,
      ...(category ? { category: { equals: category as string, mode: 'insensitive' } } : {}),
      ...searchConditions
    };

    const skip = (validPage - 1) * validLimit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: validLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            where: { isActive: true },
            orderBy: { order: 'asc' as const }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    const sanitized = products.map((p: any) => {
      const { caret, otherGemstones, stoneWeight, stoneType, settingType, size, color, ...rest } = p;
      return rest;
    });
    res.json({
      success: true,
      data: sanitized as unknown as Product[],
      count: sanitized.length,
      total,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        pages: Math.ceil(total / validLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all products (admin)
export const getAdminProducts = async (req: Request, res: Response<ApiResponse<Product[]>>) => {
  try {
    const { category, search, status, page = '1', limit = '10' } = req.query;
    
    // Convert page and limit to numbers with defaults
    const pageNum = Number(page);
    const limitNum = Number(limit);
    
    // Validate and set defaults if conversion fails
    const adminValidPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const adminValidLimit = isNaN(limitNum) || limitNum < 1 ? 10 : Math.min(limitNum, 100); // Max 100 per page to prevent abuse

    const where: any = {};

    if (category) {
      where.category = {
        equals: category as string,
        mode: 'insensitive'
      };
    }

    if (search) {
      where.OR = [
        { productCode: { equals: search as string, mode: 'insensitive' } },
        { productCode: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      where.status = status as string;
    }

    const skip = (adminValidPage - 1) * adminValidLimit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: adminValidLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            orderBy: { order: 'asc' as const }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    const sanitized = products.map((p: any) => {
      const { caret, otherGemstones, stoneWeight, stoneType, settingType, size, color, ...rest } = p;
      return rest;
    });
    res.json({
      success: true,
      data: sanitized as unknown as Product[],
      count: sanitized.length,
      total,
      pagination: {
        page: adminValidPage,
        limit: adminValidLimit,
        total,
        pages: Math.ceil(total / adminValidLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response<ApiResponse<Product>>) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          where: { isActive: true },
          orderBy: { order: 'asc' as const }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { caret, otherGemstones, stoneWeight, stoneType, settingType, size, color, ...rest } = product as any;
    res.json({
      success: true,
      data: rest as unknown as Product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create product
export const createProduct = async (req: Request, res: Response<ApiResponse<Product>>) => {
  try {
    const {
      productCode,
      name,
      description,
      fullDescription,
      category,
      subCategory,
      price,
      comparePrice,
      costPrice,
      discountPrice,
      discountPercentage,
      stock,
      isActive = true,
      // Gold Fields
      goldWeight,
      goldPurity,
      goldType,
      goldCraftsmanship,
      goldDesignDescription,
      goldFinishedType,
      goldStones,
      goldStoneQuality,
      // Diamond Fields
      diamondType,
      diamondShapeCut,
      diamondColorGrade,
      diamondClarityGrade,
      diamondCutGrade,
      diamondMetalDetails,
      diamondCertification,
      diamondOrigin,
      diamondCaratWeight,
      diamondDetails,
      diamondQuantity,
      diamondSize,
      diamondWeight,
      diamondQuality,
      // Platinum Fields
      platinumWeight,
      platinumType,
      // Silver Fields
      silverWeight,
      silverType,
      // Other Fields
      orderDuration,
      jewelryType,
      materialType,
      metalType,
      finish,
      digitalBrowser = false,
      website = false,
      distributor = false,
      normalUser = false,
      resellerUser = false,
      culture,
      // Inventory & SKU
      sku,
      weight,
      dimensions,
      minOrderQuantity,
      maxOrderQuantity,
      stoneWeight,
      caret,
      // Feature Flags
      isFeatured,
      isDigital,
      requiresShipping,
      trackQuantity,
      allowBackorder,
      xmlSitemap,
      // Additional Content
      indexingAndDiscovery,
      contentElement,
      faqs,
      tags,
      // SEO Fields
      seoTitle,
      seoDescription,
      seoKeywords,
      seoSlug,
      metaDescription,
      canonicalUrl,
      robotsMeta,
      seoFriendlyImageFilename,
      imageAltText,
      imageTitle,
      imageWidth,
      imageHeight,
      lazyLoading,
      productSchema,
      offerSchema,
      brandSchema,
      breadcrumbSchema,
      itemListSchema,
      faqSchema,
      ogTitle,
      ogDescription,
      ogImage,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage,
      optimizedImageFormat,
      videoUrl
    } = req.body;

    const safeName = toStr(name);
    const safeCategory = toStr(category);
    const { imageUrls, uploadedVideoUrl } = extractUploads(req);
    
    // If category is provided, move files to category-specific directory
    let processedImageUrls = imageUrls;
    if (safeCategory) {
      processedImageUrls = moveFilesToCategoryDir(imageUrls, safeCategory);
    }

    // Check if productCode already exists
    if (productCode) {
      const existingProduct = await prisma.product.findUnique({
        where: { productCode }
      });
      
      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: 'Product Code already exists',
          error: 'Unique constraint violation'
        });
      }
    }

    // Create product first
    const product = await prisma.product.create({
      data: {
        productCode,
        name: safeName,
        description,
        fullDescription: fullDescription || null,
        category: safeCategory,
        subCategory,
        price: toNum(price, 0),
        comparePrice: comparePrice ? toNum(comparePrice) : null,
        costPrice: costPrice ? toNum(costPrice) : null,
        discountPrice: discountPrice ? toNum(discountPrice) : null,
        discountPercentage: discountPercentage ? toNum(discountPercentage) : null,
        stock: toNum(stock, 0),
        isActive: toBool(isActive, true),
        imageUrl: processedImageUrls.length > 0 ? processedImageUrls[0] : null, // Keep for backward compatibility
        // Gold Fields
        goldWeight,
        goldPurity,
        goldType,
        goldCraftsmanship,
        goldDesignDescription,
        goldFinishedType,
        goldStones,
        goldStoneQuality,
        // Diamond Fields
        diamondType,
        diamondShapeCut,
        diamondColorGrade,
        diamondClarityGrade,
        diamondCutGrade,
        diamondMetalDetails,
        diamondCertification,
        diamondOrigin,
        diamondCaratWeight,
        diamondDetails,
        diamondQuantity: diamondQuantity ? toNum(diamondQuantity) : null,
        diamondSize,
        diamondWeight,
        diamondQuality,
        // Platinum Fields
        platinumWeight,
        platinumType,
        // Silver Fields
        silverWeight,
        silverType,
        // Other Fields
        orderDuration,
        jewelryType,
        materialType,
        metalType,
        finish,
        digitalBrowser: toBool(digitalBrowser, false),
        website: toBool(website, false),
        distributor: toBool(distributor, false),
        normalUser: toBool(normalUser, false),
        resellerUser: toBool(resellerUser, false),
        culture: culture || null,
        // Inventory & SKU
        sku: sku || null,
        weight: weight ? toNum(weight) : null,
        dimensions: dimensions || null,
        minOrderQuantity: minOrderQuantity ? toNum(minOrderQuantity) : null,
        maxOrderQuantity: maxOrderQuantity ? toNum(maxOrderQuantity) : null,
        stoneWeight: stoneWeight || null,
        caret: caret || null,
        // Feature Flags
        isFeatured: toBool(isFeatured, false),
        isDigital: toBool(isDigital, false),
        requiresShipping: toBool(requiresShipping, true),
        trackQuantity: toBool(trackQuantity, true),
        allowBackorder: toBool(allowBackorder, false),
        xmlSitemap: toBool(xmlSitemap, false),
        // Additional Content
        indexingAndDiscovery: indexingAndDiscovery || null,
        contentElement: contentElement || null,
        faqs: faqs || null,
        tags: tags || [],
        // SEO Fields
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        seoSlug: seoSlug || null,
        metaDescription: metaDescription || null,
        canonicalUrl: canonicalUrl || null,
        robotsMeta: robotsMeta || null,
        seoFriendlyImageFilename: seoFriendlyImageFilename || null,
        imageAltText: imageAltText || null,
        imageTitle: imageTitle || null,
        imageWidth: imageWidth ? toNum(imageWidth) : null,
        imageHeight: imageHeight ? toNum(imageHeight) : null,
        lazyLoading: lazyLoading !== undefined ? toBool(lazyLoading) : true,
        productSchema: productSchema ? JSON.parse(productSchema) : null,
        offerSchema: offerSchema ? JSON.parse(offerSchema) : null,
        brandSchema: brandSchema ? JSON.parse(brandSchema) : null,
        breadcrumbSchema: breadcrumbSchema ? JSON.parse(breadcrumbSchema) : null,
        itemListSchema: itemListSchema ? JSON.parse(itemListSchema) : null,
        faqSchema: faqSchema ? JSON.parse(faqSchema) : null,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        twitterCard: twitterCard || null,
        twitterTitle: twitterTitle || null,
        twitterDescription: twitterDescription || null,
        twitterImage: twitterImage || null,
        optimizedImageFormat: optimizedImageFormat || null,
        // @ts-ignore - videoUrl exists in schema but TypeScript is not recognizing it
        videoUrl: uploadedVideoUrl || videoUrl || null,
        status: 'draft' // Default status
      } as any
    });

    if (processedImageUrls.length > 0) {
      const productImages = processedImageUrls.map((url: string, index: number) => ({ productId: product.id, url, order: index, isActive: true }));
      await prisma.productImage.createMany({ data: productImages });
    }

    // Fetch the complete product with images
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        images: {
          orderBy: { order: 'asc' as const }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: completeProduct as unknown as Product
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = error.meta?.target as string[];
      const field = target?.[0] || 'field';
      res.status(409).json({
        success: false,
        message: `${field} already exists`,
        error: 'Unique constraint violation'
      });
      return;
    }
    if (error instanceof Error) {
      const response: any = {
        success: false,
        message: 'Failed to create product',
        error: error.message
      };
      if (process.env.NODE_ENV === 'development' && error.stack) {
        response.stack = error.stack;
      }
      res.status(500).json(response);
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: 'Unknown error occurred'
      });
    }
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response<ApiResponse<Product>>) => {
  try {
    const { id } = req.params;
    let {
      productCode,
      name,
      description,
      fullDescription,
      category,
      subCategory,
      price,
      comparePrice,
      costPrice,
      discountPrice,
      discountPercentage,
      stock,
      isActive,
      status,
      // Gold Fields
      goldWeight,
      goldPurity,
      goldType,
      goldCraftsmanship,
      goldDesignDescription,
      goldFinishedType,
      goldStones,
      goldStoneQuality,
      // Diamond Fields
      diamondType,
      diamondShapeCut,
      diamondColorGrade,
      diamondClarityGrade,
      diamondCutGrade,
      diamondMetalDetails,
      diamondCertification,
      diamondOrigin,
      diamondCaratWeight,
      diamondDetails,
      diamondQuantity,
      diamondSize,
      diamondWeight,
      diamondQuality,
      // Platinum Fields
      platinumWeight,
      platinumType,
      // Silver Fields
      silverWeight,
      silverType,
      // Other Fields
      orderDuration,
      jewelryType,
      materialType,
      metalType,
      finish,
      digitalBrowser,
      website,
      distributor,
      normalUser,
      resellerUser,
      culture,
      // Inventory & SKU
      sku,
      weight,
      dimensions,
      minOrderQuantity,
      maxOrderQuantity,
      stoneWeight,
      caret,
      // Feature Flags
      isFeatured,
      isDigital,
      requiresShipping,
      trackQuantity,
      allowBackorder,
      xmlSitemap,
      // Additional Content
      indexingAndDiscovery,
      contentElement,
      faqs,
      tags,
      // SEO Fields
      seoTitle,
      seoDescription,
      seoKeywords,
      seoSlug,
      metaDescription,
      canonicalUrl,
      robotsMeta,
      seoFriendlyImageFilename,
      imageAltText,
      imageTitle,
      imageWidth,
      imageHeight,
      lazyLoading,
      productSchema,
      offerSchema,
      brandSchema,
      breadcrumbSchema,
      itemListSchema,
      faqSchema,
      ogTitle,
      ogDescription,
      ogImage,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage,
      optimizedImageFormat,
      videoUrl
    } = req.body;

    // Log incoming data for debugging
    console.log('Update product request for ID:', id);
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);

    // Validate product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (isActive !== undefined) isActive = toBool(isActive, existingProduct.isActive);
    if (digitalBrowser !== undefined) digitalBrowser = toBool(digitalBrowser, (existingProduct as any)?.digitalBrowser ?? false);
    if (website !== undefined) website = toBool(website, (existingProduct as any)?.website ?? false);
    if (distributor !== undefined) distributor = toBool(distributor, (existingProduct as any)?.distributor ?? false);
    if (normalUser !== undefined) normalUser = toBool(normalUser, (existingProduct as any)?.normalUser ?? false);
    if (resellerUser !== undefined) resellerUser = toBool(resellerUser, (existingProduct as any)?.resellerUser ?? false);

    if (price !== undefined) price = toNum(price, 0);
    if (stock !== undefined) stock = toNum(stock, 0);
    if (diamondQuantity !== undefined) diamondQuantity = diamondQuantity ? toNum(diamondQuantity) : null;

    const { imageUrls, uploadedVideoUrl } = extractUploads(req);

    let preservedImageUrls: string[] | null = null;
    if (req.body.imageUrls) {
      try { preservedImageUrls = JSON.parse(req.body.imageUrls); } catch { }
    }

    // If category changed and new images were uploaded, move files to new category directory
    let processedImageUrls = imageUrls;
    if (category && category !== existingProduct.category && imageUrls.length > 0) {
      processedImageUrls = moveFilesToCategoryDir(imageUrls, category);
    }

    // If new images are uploaded, update the product and create new image records
    let mainImageUrl = await upsertImages(id, processedImageUrls, preservedImageUrls);
    (req.body as any).imageUrl = mainImageUrl;

    console.log('Final update data:', {
      productCode,
      name,
      description,
      fullDescription,
      category,
      subCategory,
      price,
      stock,
      isActive,
      // Gold Fields
      goldWeight,
      goldPurity,
      goldType,
      goldCraftsmanship,
      goldDesignDescription,
      goldFinishedType,
      goldStones,
      goldStoneQuality,
      // Diamond Fields
      diamondType,
      diamondShapeCut,
      diamondColorGrade,
      diamondClarityGrade,
      diamondCutGrade,
      diamondMetalDetails,
      diamondCertification,
      diamondOrigin,
      diamondCaratWeight,
      diamondDetails,
      diamondQuantity,
      diamondSize,
      diamondWeight,
      diamondQuality,
      // Platinum Fields
      platinumWeight,
      platinumType,
      // Silver Fields
      silverWeight,
      silverType,
      // Other Fields
      orderDuration,
      jewelryType,
      materialType,
      metalType,
      finish,
      digitalBrowser,
      website,
      distributor,
      normalUser,
      resellerUser,
      culture,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoSlug,
      videoUrl
    });

    const product = await prisma.product.update({
      where: { id },
      data: {
        productCode,
        name,
        description,
        fullDescription: fullDescription || null,
        category,
        subCategory,
        price: toNum(price, 0),
        comparePrice: comparePrice ? toNum(comparePrice) : null,
        costPrice: costPrice ? toNum(costPrice) : null,
        discountPrice: discountPrice ? toNum(discountPrice) : null,
        discountPercentage: discountPercentage ? toNum(discountPercentage) : null,
        stock: toNum(stock, 0),
        isActive: toBool(isActive, true),
        // @ts-ignore - status exists in schema but TypeScript is not recognizing it
        status: status || 'draft',
        imageUrl: mainImageUrl,
        // Gold Fields
        goldWeight,
        goldPurity,
        goldType,
        goldCraftsmanship,
        goldDesignDescription,
        goldFinishedType,
        goldStones,
        goldStoneQuality,
        // Diamond Fields
        diamondType,
        diamondShapeCut,
        diamondColorGrade,
        diamondClarityGrade,
        diamondCutGrade,
        diamondMetalDetails,
        diamondCertification,
        diamondOrigin,
        diamondCaratWeight,
        diamondDetails,
        diamondQuantity: diamondQuantity ? toNum(diamondQuantity) : null,
        diamondSize,
        diamondWeight,
        diamondQuality,
        // Platinum Fields
        platinumWeight,
        platinumType,
        // Silver Fields
        silverWeight,
        silverType,
        // Other Fields
        orderDuration,
        jewelryType,
        materialType,
        metalType,
        finish,
        digitalBrowser: toBool(digitalBrowser, false),
        website: toBool(website, false),
        distributor: toBool(distributor, false),
        normalUser: toBool(normalUser, false),
        resellerUser: toBool(resellerUser, false),
        culture: culture || null,
        // Inventory & SKU
        sku: sku || null,
        weight: weight ? toNum(weight) : null,
        dimensions: dimensions || null,
        minOrderQuantity: minOrderQuantity ? toNum(minOrderQuantity) : null,
        maxOrderQuantity: maxOrderQuantity ? toNum(maxOrderQuantity) : null,
        stoneWeight: stoneWeight || null,
        caret: caret || null,
        // Feature Flags
        isFeatured: toBool(isFeatured, false),
        isDigital: toBool(isDigital, false),
        requiresShipping: toBool(requiresShipping, true),
        trackQuantity: toBool(trackQuantity, true),
        allowBackorder: toBool(allowBackorder, false),
        xmlSitemap: toBool(xmlSitemap, false),
        // Additional Content
        indexingAndDiscovery: indexingAndDiscovery || null,
        contentElement: contentElement || null,
        faqs: faqs || null,
        tags: tags || [],
        // SEO Fields
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        seoSlug: seoSlug || null,
        metaDescription: metaDescription || null,
        canonicalUrl: canonicalUrl || null,
        robotsMeta: robotsMeta || null,
        seoFriendlyImageFilename: seoFriendlyImageFilename || null,
        imageAltText: imageAltText || null,
        imageTitle: imageTitle || null,
        imageWidth: imageWidth ? toNum(imageWidth) : null,
        imageHeight: imageHeight ? toNum(imageHeight) : null,
        lazyLoading: lazyLoading !== undefined ? toBool(lazyLoading) : true,
        productSchema: productSchema ? JSON.parse(productSchema) : null,
        offerSchema: offerSchema ? JSON.parse(offerSchema) : null,
        brandSchema: brandSchema ? JSON.parse(brandSchema) : null,
        breadcrumbSchema: breadcrumbSchema ? JSON.parse(breadcrumbSchema) : null,
        itemListSchema: itemListSchema ? JSON.parse(itemListSchema) : null,
        faqSchema: faqSchema ? JSON.parse(faqSchema) : null,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        twitterCard: twitterCard || null,
        twitterTitle: twitterTitle || null,
        twitterDescription: twitterDescription || null,
        twitterImage: twitterImage || null,
        optimizedImageFormat: optimizedImageFormat || null,
        // @ts-ignore - videoUrl exists in schema but TypeScript is not recognizing it
        videoUrl: uploadedVideoUrl || videoUrl || null
      } as any
    });

    // Fetch the complete product with images
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        images: {
          where: { isActive: true },
          orderBy: { order: 'asc' as const }
        }
      }
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: completeProduct as unknown as Product
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Product Code already available',
        error: 'Unique constraint violation'
      });
      return;
    }
    if (error instanceof Error) {
      const response: any = {
        success: false,
        message: 'Failed to update product',
        error: error.message
      };
      if (process.env.NODE_ENV === 'development' && error.stack) {
        response.stack = error.stack;
      }
      res.status(500).json(response);
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: 'Unknown error occurred'
      });
    }
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response<ApiResponse<null>>) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Toggle product status
export const toggleProductStatus = async (req: Request, res: Response<ApiResponse<Product>>) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    }) as any; // Explicit cast to any to bypass type checking temporarily

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Cycle through status values: draft -> active -> inactive -> draft
    let newStatus = product.status;
    if (product.status === 'draft') {
      newStatus = 'active';
    } else if (product.status === 'active') {
      newStatus = 'inactive';
    } else {
      newStatus = 'draft';
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        // @ts-ignore - status exists in schema but TypeScript is not recognizing it
        status: newStatus
      }
    }) as any; // Explicit cast to any to bypass type checking temporarily

    res.json({
      success: true,
      message: `Product status updated to ${newStatus} successfully`,
      data: updatedProduct as unknown as Product
    });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get product categories
export const getProductCategories = async (_req: Request, res: Response<ApiResponse<any[]>>) => {
  try {
    // Get distinct categories from products
    const productCategories = await prisma.product.groupBy({
      by: ['category'],
      where: {
        isActive: true
      }
    });

    // Get full category objects from the categories table
    const categoryIds = productCategories.map((c: any) => c.category);
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        isActive: true
      }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
