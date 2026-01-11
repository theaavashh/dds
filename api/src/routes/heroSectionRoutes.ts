import express from 'express';
import { 
  getAllHeroSections, 
  createHeroSection, 
  updateHeroSection, 
  deleteHeroSection 
} from '../controllers/heroSectionController';
import { authMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/upload';

const router = express.Router();

router.get('/', getAllHeroSections);

router.post('/', authMiddleware, upload.fields([
  { name: 'desktopImage', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 }
]), createHeroSection);

router.put('/:id', authMiddleware, upload.fields([
  { name: 'desktopImage', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 }
]), updateHeroSection);

router.delete('/:id', authMiddleware, deleteHeroSection);

export default router;