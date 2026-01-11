import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/upload';
import { listServices, createService, updateService, deleteService } from '../controllers/serviceController';

const router = express.Router();

router.get('/', authMiddleware, listServices);
router.post('/', authMiddleware, upload.single('image'), createService);
router.put('/:id', authMiddleware, upload.single('image'), updateService);
router.delete('/:id', authMiddleware, deleteService);

export default router;
