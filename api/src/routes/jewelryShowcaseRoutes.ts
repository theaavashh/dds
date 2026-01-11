import express from 'express';
import { 
  getJewelryShowcase, 
  createJewelryShowcase, 
  updateJewelryShowcase, 
  deleteJewelryShowcase 
} from '../controllers/jewelryShowcaseController';
import { authMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/upload';

const router = express.Router();

router.get('/', getJewelryShowcase);

router.post('/', authMiddleware, upload.fields([
  { name: 'leftImage', maxCount: 1 },
  { name: 'rightImage', maxCount: 1 }
]), createJewelryShowcase);

router.put('/:id', authMiddleware, upload.fields([
  { name: 'leftImage', maxCount: 1 },
  { name: 'rightImage', maxCount: 1 }
]), updateJewelryShowcase);

router.delete('/:id', authMiddleware, deleteJewelryShowcase);

export default router;