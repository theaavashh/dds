import express from 'express';
import {
  getProductReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleReviewStatus,
} from '../controllers/reviewController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);
router.post('/', createReview);

// Admin routes (protected)
router.get('/all', authMiddleware, getAllReviews);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);
router.patch('/:id/toggle', authMiddleware, toggleReviewStatus);

export default router;






