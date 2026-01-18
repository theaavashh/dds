import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/upload';
import { 
  getLowerBanners,
  getLowerBannerByPosition,
  createOrUpdateLowerBanner,
  updateLowerBanner,
  deleteLowerBanner
} from '../controllers/lowerBannerController';

const router = express.Router();

// Public routes
router.get('/', getLowerBanners);
router.get('/position/:position', getLowerBannerByPosition);

// Admin routes (protected)
router.post('/', authMiddleware, upload.single('image'), createOrUpdateLowerBanner);
router.put('/:id', authMiddleware, upload.single('image'), updateLowerBanner);
router.delete('/:id', authMiddleware, deleteLowerBanner);

export default router;