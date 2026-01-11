import { Request, Response } from 'express';
import prisma from '../config/database';
import { Category as PrismaCategory, Subcategory as PrismaSubcategory } from '@prisma/client';

// Import Zod types
import {
  CreateCategoryWithSubcategoriesInput,
  UpdateCategoryInput,
  SubcategoryInput
} from '../validation/categorySchema';

// Define response types
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

interface CategoryWithSubcategories extends PrismaCategory {
  subcategories: PrismaSubcategory[];
}

// Get all categories (public)
export const getAllCategories = async (req: Request<{}, ApiResponse<PrismaCategory[]>>, res: Response<ApiResponse<PrismaCategory[]>>) => {
  try {
    // @ts-ignore - Prisma client needs to be regenerated after schema update
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all categories with subcategories (admin)
export const getAdminCategories = async (req: Request<{}, ApiResponse<CategoryWithSubcategories[]>>, res: Response<ApiResponse<CategoryWithSubcategories[]>>) => {
  try {
    // @ts-ignore - Prisma client needs to be regenerated after schema update
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        subcategories: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      data: categories as CategoryWithSubcategories[],
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request<{ id: string }, ApiResponse<PrismaCategory>, {}>, res: Response<ApiResponse<PrismaCategory>>) => {
  try {
    const { id } = req.params;
    // @ts-ignore - Prisma client needs to be regenerated after schema update
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create category with subcategories in a single transaction
export const createCategoryWithSubcategories = async (req: Request<{}, ApiResponse<CategoryWithSubcategories>, CreateCategoryWithSubcategoriesInput>, res: Response<ApiResponse<CategoryWithSubcategories>>) => {
  try {
    const isActiveValue: any = req.body.isActive;
    const isActive = typeof isActiveValue === 'string'
      ? isActiveValue.toLowerCase() === 'true'
      : (typeof isActiveValue === 'boolean' ? isActiveValue : true);

    let subcategories = Array.isArray(req.body.subcategories) ? req.body.subcategories : [];

    const {
      title,
      link,
      iconUrl: iconUrlFromBody,
      imageUrl: imageUrlFromBody,
      sortOrder = 0
    } = req.body;

    // Handle file uploads
    let iconUrl = iconUrlFromBody || null;
    let imageUrl = imageUrlFromBody || null;

    // Check for uploaded files
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.icon && files.icon[0]) {
        iconUrl = `/uploads/categories/icons/${files.icon[0].filename}`;
      }
      if (files.image && files.image[0]) {
        imageUrl = `/uploads/categories/images/${files.image[0].filename}`;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const data: any = {
        title,
        iconUrl,
        imageUrl,
        desktopBreadcrumbUrl: (req.files as any)?.desktopBreadcrumb?.[0] ? `/uploads/categories/breadcrumbs/${(req.files as any).desktopBreadcrumb[0].filename}` : null,
        mobileBreadcrumbUrl: (req.files as any)?.mobileBreadcrumb?.[0] ? `/uploads/categories/breadcrumbs/${(req.files as any).mobileBreadcrumb[0].filename}` : null,
        link: link || null,
        isActive,
        sortOrder: typeof sortOrder === 'string' ? parseInt(sortOrder, 10) : sortOrder || 0
      };

      const category = await tx.category.create({
        data
      });

      if (subcategories.length > 0) {
        const subcategoryData = subcategories.map((sub: SubcategoryInput, index: number) => ({
          name: sub.name,
          categoryId: category.id,
          isActive: sub.isActive !== undefined ? sub.isActive : true,
          sortOrder: sub.sortOrder !== undefined ? sub.sortOrder : index
        }));

        await tx.subcategory.createMany({
          data: subcategoryData
        });
      }

      const completeCategory = await tx.category.findUnique({
        where: { id: category.id },
        include: {
          subcategories: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });

      return completeCategory as CategoryWithSubcategories;
    });

    res.status(201).json({
      success: true,
      message: 'Category and subcategories created successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category with subcategories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update category
export const updateCategory = async (req: Request<{ id: string }, ApiResponse<PrismaCategory>, UpdateCategoryInput>, res: Response<ApiResponse<PrismaCategory>>) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle file uploads
    let iconUrl: string | null | undefined = updateData.iconUrl;
    let imageUrl: string | null | undefined = updateData.imageUrl;

    const dataToUpdate: any = {};

    // Check for uploaded files
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.icon && files.icon[0]) {
        iconUrl = `/uploads/categories/icons/${files.icon[0].filename}`;
      }
      if (files.image && files.image[0]) {
        imageUrl = `/uploads/categories/images/${files.image[0].filename}`;
      }
      if (files.desktopBreadcrumb && files.desktopBreadcrumb[0]) {
        dataToUpdate.desktopBreadcrumbUrl = `/uploads/categories/breadcrumbs/${files.desktopBreadcrumb[0].filename}`;
      }
      if (files.mobileBreadcrumb && files.mobileBreadcrumb[0]) {
        dataToUpdate.mobileBreadcrumbUrl = `/uploads/categories/breadcrumbs/${files.mobileBreadcrumb[0].filename}`;
      }
    }

    // Only include fields that were actually provided
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.link !== undefined) {
      dataToUpdate.link = updateData.link === '' ? null : updateData.link;
    }
    if (updateData.isActive !== undefined) {
      dataToUpdate.isActive = typeof updateData.isActive === 'string'
        ? (updateData.isActive as string).toLowerCase() === 'true'
        : updateData.isActive;
    }
    if (updateData.sortOrder !== undefined) {
      const parsed = typeof updateData.sortOrder === 'string' ? parseInt(updateData.sortOrder, 10) : updateData.sortOrder;
      dataToUpdate.sortOrder = Number.isNaN(parsed as any) ? 0 : parsed;
    }

    // Handle file URLs separately to preserve existing values
    if (iconUrl !== undefined) dataToUpdate.iconUrl = iconUrl === '' ? null : iconUrl;
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl === '' ? null : imageUrl;

    const tryUpdate = async () => {
      const data: any = { ...dataToUpdate };
      return prisma.category.update({
        where: { id },
        data
      });
    };

    let category: PrismaCategory | null = null;
    try {
      category = await tryUpdate();
    } catch (err: any) {
      throw err;
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete category
export const deleteCategory = async (req: Request<{ id: string }, ApiResponse<{}>, {}>, res: Response<ApiResponse<{}>>) => {
  try {
    const { id } = req.params;

    // Delete subcategories first, then the category
    await prisma.$transaction([
      prisma.subcategory.deleteMany({
        where: { categoryId: id }
      }),
      prisma.category.delete({
        where: { id }
      })
    ]);

    res.json({
      success: true,
      message: 'Category and associated subcategories deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Toggle category status
export const toggleCategoryStatus = async (req: Request<{ id: string }, ApiResponse<PrismaCategory>, {}>, res: Response<ApiResponse<PrismaCategory>>) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive }
    });

    res.json({
      success: true,
      message: `Category ${updatedCategory.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle category status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get subcategories by category ID
export const getSubcategoriesByCategory = async (req: Request<{ categoryId: string }, ApiResponse<PrismaSubcategory[]>, {}>, res: Response<ApiResponse<PrismaSubcategory[]>>) => {
  try {
    const { categoryId } = req.params;

    const subcategories = await prisma.subcategory.findMany({
      where: {
        categoryId,
        isActive: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: subcategories,
      count: subcategories.length
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get subcategory by ID
export const getSubcategoryById = async (req: Request<{ id: string }, ApiResponse<PrismaSubcategory>, {}>, res: Response<ApiResponse<PrismaSubcategory>>) => {
  try {
    const { id } = req.params;

    const subcategory = await prisma.subcategory.findUnique({
      where: { id }
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    res.json({
      success: true,
      data: subcategory
    });
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategory',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create subcategory
export const createSubcategory = async (req: Request<{ categoryId: string }, ApiResponse<PrismaSubcategory>, SubcategoryInput>, res: Response<ApiResponse<PrismaSubcategory>>) => {
  try {
    const { categoryId } = req.params;
    const { name, isActive = true, sortOrder = 0 } = req.body;

    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        categoryId,
        isActive,
        sortOrder
      }
    });

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: subcategory
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subcategory',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update subcategory
export const updateSubcategory = async (req: Request<{ id: string }, ApiResponse<PrismaSubcategory>, SubcategoryInput>, res: Response<ApiResponse<PrismaSubcategory>>) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: subcategory
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subcategory',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete subcategory
export const deleteSubcategory = async (req: Request<{ id: string }, ApiResponse<{}>, {}>, res: Response<ApiResponse<{}>>) => {
  try {
    const { id } = req.params;

    await prisma.subcategory.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subcategory',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Toggle subcategory status
export const toggleSubcategoryStatus = async (req: Request<{ id: string }, ApiResponse<PrismaSubcategory>, {}>, res: Response<ApiResponse<PrismaSubcategory>>) => {
  try {
    const { id } = req.params;
    const subcategory = await prisma.subcategory.findUnique({
      where: { id }
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    const updatedSubcategory = await prisma.subcategory.update({
      where: { id },
      data: { isActive: !subcategory.isActive }
    });

    res.json({
      success: true,
      message: `Subcategory ${updatedSubcategory.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedSubcategory
    });
  } catch (error) {
    console.error('Error toggling subcategory status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle subcategory status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
