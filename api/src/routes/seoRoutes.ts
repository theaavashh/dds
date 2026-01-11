import express from 'express';
import { getSeoReport } from '../controllers/seoController';

const router = express.Router();

// Get SEO report
router.get('/report', getSeoReport);

// Get SEO settings
router.get('/', async (_req, res) => {
  try {
    res.json({
      success: true,
      message: 'SEO settings endpoint',
      data: {}
    });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SEO settings'
    });
  }
});

// Update SEO settings
router.put('/', async (_req, res) => {
  try {
    res.json({
      success: true,
      message: 'SEO settings updated',
      data: _req.body
    });
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating SEO settings'
    });
  }
});

export default router;