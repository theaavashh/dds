import express from 'express';
import { getSiteSettings, upsertSiteSettings } from '../controllers/settingsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public read (optional) and admin read
router.get('/', getSiteSettings);
router.get('/admin', authMiddleware, getSiteSettings);

// Admin update
router.put('/', authMiddleware, upsertSiteSettings);
router.put('/admin', authMiddleware, upsertSiteSettings);

export default router;

