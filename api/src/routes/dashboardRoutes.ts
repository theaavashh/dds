import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Get dashboard statistics (protected)
router.get('/stats', authMiddleware, getDashboardStats);

// Get dashboard data (legacy endpoint)
router.get('/', async (_req, res) => {
  try {
    res.json({
      success: true,
      message: 'Dashboard endpoint',
      data: {
        stats: {},
        recent: []
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

export default router;






