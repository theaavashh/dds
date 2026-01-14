import express from 'express';
import { body } from 'express-validator';
import {
  getAllProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductCategories
} from '../controllers/productController';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadMixedFiles } from '../middleware/upload';

const router = express.Router();

// Validation rules
const productValidation = [
  body('productCode')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Product code must be less than 50 characters')
    .optional(),
  
  body('name')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Product name must be less than 200 characters')
    .optional(),
  
  body('description')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
    .optional(),
  
  body('category')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must be less than 100 characters')
    .optional(),
  
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('diamondQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Diamond quantity must be a non-negative integer'),
  
  body('digitalBrowser')
    .optional()
    .isBoolean()
    .withMessage('Digital Browser must be a boolean'),
  
  body('website')
    .optional()
    .isBoolean()
    .withMessage('Website must be a boolean'),
  
  body('distributor')
    .optional()
    .isBoolean()
    .withMessage('Distributor must be a boolean')
];

// Public routes
router.get('/', getAllProducts);
router.get('/categories', getProductCategories);
router.get('/:id', getProductById);

// Admin routes (protected)
router.get('/admin/all', authMiddleware, getAdminProducts);
router.post('/', authMiddleware, uploadMixedFiles, productValidation, createProduct);
router.put('/:id', authMiddleware, uploadMixedFiles, productValidation, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.patch('/:id/toggle', authMiddleware, toggleProductStatus);

export default router;