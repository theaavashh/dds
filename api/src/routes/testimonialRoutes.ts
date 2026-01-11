import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/upload';
import { listTestimonials, listTestimonialsPublic, createTestimonial, deleteTestimonial, updateTestimonial } from '../controllers/testimonialController';

const router = express.Router();

router.get('/', authMiddleware, listTestimonials);
router.get('/public', listTestimonialsPublic);
router.post('/', authMiddleware, upload.single('image'), createTestimonial);
router.put('/:id', authMiddleware, upload.single('image'), updateTestimonial);
router.delete('/:id', authMiddleware, deleteTestimonial);

export default router;
