import express from 'express';
import {
  getActiveCatalogItems,
  getAllCatalogItems,
  getCatalogItemById,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  toggleCatalogItemStatus
} from '../controllers/catalogController';
import { authMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/upload';

const router = express.Router();

// Public route - for frontend display
router.get('/', getActiveCatalogItems);

// Admin routes (protected)
router.get('/admin/all', authMiddleware, getAllCatalogItems);
router.get('/:id', authMiddleware, getCatalogItemById);

// CRUD operations
router.post('/', authMiddleware, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), createCatalogItem);

router.put('/:id', authMiddleware, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), updateCatalogItem);

router.delete('/:id', authMiddleware, deleteCatalogItem);
router.patch('/:id', authMiddleware, toggleCatalogItemStatus);

export default router;