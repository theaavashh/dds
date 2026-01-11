import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/upload';
import { listBanners, createBanner, updateBanner, deleteBanner, toggleBannerStatus } from '../controllers/bannerController';

const router = express.Router();

router.get('/', authMiddleware, listBanners);
router.post('/', authMiddleware, upload.single('image'), createBanner);
router.put('/:id', authMiddleware, upload.single('image'), updateBanner);
router.delete('/:id', authMiddleware, deleteBanner);
router.patch('/:id/toggle', authMiddleware, toggleBannerStatus);

export default router;
