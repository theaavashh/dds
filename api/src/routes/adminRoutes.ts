import express from 'express';

const router = express.Router();

// Get admin data
router.get('/', async (_req, res) => {
  try {
    res.json({
      success: true,
      message: 'Admin endpoint',
      data: {}
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin data'
    });
  }
});

export default router;





