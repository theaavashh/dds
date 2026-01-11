import express from 'express';
import { body } from 'express-validator';
import {
  getAllAttributeOptions,
  getAttributeOptionsByAttribute,
  createAttributeOption,
  updateAttributeOption,
  deleteAttributeOption,
  toggleAttributeOptionStatus
} from '../controllers/attributeOptionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Validation rules
const attributeOptionValidation = [
  body('attribute')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Attribute name is required and must be less than 50 characters'),
  
  body('value')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Option value is required and must be less than 100 characters')
];

// Public routes (if needed)
// router.get('/', getAllAttributeOptions);

// Admin routes (protected)
router.get('/admin/all', authMiddleware, getAllAttributeOptions);
router.get('/admin/:attribute', authMiddleware, getAttributeOptionsByAttribute);
router.post('/admin', authMiddleware, attributeOptionValidation, createAttributeOption);
router.put('/admin/:id', authMiddleware, attributeOptionValidation, updateAttributeOption);
router.delete('/admin/:id', authMiddleware, deleteAttributeOption);
router.patch('/admin/:id/toggle', authMiddleware, toggleAttributeOptionStatus);

export default router;