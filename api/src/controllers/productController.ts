import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { Product, ApiResponse } from '../types';

const prisma = new PrismaClient();

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
      const existing = existingImages.find(img => img.url === url);
      if (existing) {
        await prisma.productImage.update({ where: { id: existing.id }, data: { order: i, isActive: true } });
      } else {
        await prisma.productImage.create({ data: { productId, url, order: i, isActive: true } });
      }
    }
    const keep = new Set(preserved);
    const deactivate = existingImages.filter(img => !keep.has(img.url));
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
    const { category, search, page = 1, limit = 12, auth } = req.query;
    const isAuthenticated = auth === 'true';

    const channelCheck = isAuthenticated
      ? { OR: [{ website: true }, { distributor: true }] }
      : { website: true };

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

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
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
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
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
    const { category, search, status, page = 1, limit = 10 } = req.query;

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

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
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
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
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
      seoTitle,
      seoDescription,
      seoKeywords,
      seoSlug,
      videoUrl
    } = req.body;

    const safeName = toStr(name);
    const safeCategory = toStr(category);
    const { imageUrls, uploadedVideoUrl } = extractUploads(req);

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
        stock: toNum(stock, 0),
        isActive: toBool(isActive, true),
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : null, // Keep for backward compatibility
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
        culture: culture || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        seoSlug: seoSlug || null,
        // @ts-ignore - videoUrl exists in schema but TypeScript is not recognizing it
        videoUrl: uploadedVideoUrl || videoUrl || null,
        normalUser: toBool(normalUser, false),
        resellerUser: toBool(resellerUser, false),
        status: 'draft' // Default status
      } as any
    });

    if (imageUrls.length > 0) {
      const productImages = imageUrls.map((url: string, index: number) => ({ productId: product.id, url, order: index, isActive: true }));
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
  } catch (error) {
    console.error('Error creating product:', error);
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
      seoTitle,
      seoDescription,
      seoKeywords,
      seoSlug,
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

    // If new images are uploaded, update the product and create new image records
    const mainImageUrl = await upsertImages(id, imageUrls, preservedImageUrls);
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
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        seoSlug: seoSlug || null,
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
  } catch (error) {
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
    const categoryIds = productCategories.map(c => c.category);
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
