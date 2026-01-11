import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getAbout, upsertAbout, updateAbout } from '../controllers/aboutController';

const router = express.Router();

router.get('/', getAbout);
router.post('/', authMiddleware, upsertAbout);
router.put('/:id', authMiddleware, updateAbout);

export default router;
