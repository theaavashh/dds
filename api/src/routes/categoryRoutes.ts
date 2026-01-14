import express from 'express';
import {
  getAllCategories,
  getAdminCategories,
  getCategoryById,
  createCategoryWithSubcategories,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getSubcategoriesByCategory,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  toggleSubcategoryStatus
} from '../controllers/categoryController';
import { authMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/upload';
import { validateRequest } from '../middleware/validationMiddleware';
import {
  subcategorySchema,
  createCategoryWithSubcategoriesSchema,
  updateCategorySchema
} from '../validation/categorySchema';

const router = express.Router();

// ================================
// CATEGORY ROUTES
// ================================

// Public routes - for frontend display
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin routes (protected) - for dashboard management
router.get('/admin/all', authMiddleware, getAdminCategories);
// Unified endpoint for creating category with subcategories
router.post('/with-subcategories', authMiddleware, upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'desktopBreadcrumb', maxCount: 1 },
  { name: 'mobileBreadcrumb', maxCount: 1 }
]), validateRequest(createCategoryWithSubcategoriesSchema), createCategoryWithSubcategories);

// Individual category operations using route chaining
router.route('/:id')
  .put(authMiddleware, upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'desktopBreadcrumb', maxCount: 1 },
    { name: 'mobileBreadcrumb', maxCount: 1 }
  ]), validateRequest(updateCategorySchema), updateCategory)
  .delete(authMiddleware, deleteCategory)
  .patch(authMiddleware, toggleCategoryStatus); // Simplified from /:id/toggle-status to just PATCH /:id

// ================================
// SUBCATEGORY ROUTES
// ================================

// Retrieve subcategories
router.get('/:categoryId/subcategories', getSubcategoriesByCategory);
router.get('/subcategories/:id', getSubcategoryById);

// Create subcategory under a category
router.post('/:categoryId/subcategories', authMiddleware, validateRequest(subcategorySchema), createSubcategory);

// Manage individual subcategories with RESTful routing
router.route('/subcategories/:id')
  .put(authMiddleware, validateRequest(subcategorySchema), updateSubcategory)
  .delete(authMiddleware, deleteSubcategory)
  .patch(authMiddleware, toggleSubcategoryStatus); // Simplified from /subcategories/:id/toggle-status to just PATCH /subcategories/:id

export default router;