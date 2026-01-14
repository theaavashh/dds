import express from 'express';
import { 
  getAllDistributors,
  getDistributorById,
  createDistributor,
  updateDistributor,
  deleteDistributor,
  updateDistributorStatus,
  loginDistributor,
  getDistributorProfile
} from '../controllers/distributorController';
import { distributorAuthMiddleware } from '../middleware/distributorAuthMiddleware';

const router = express.Router();

// Distributor login
router.post('/login', loginDistributor);

// Distributor logout
router.post('/logout', async (_req, res) => {
  try {
    // Clear the auth cookie with enhanced security settings
    const isProduction = process.env['NODE_ENV'] === 'production';
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      domain: isProduction ? process.env['COOKIE_DOMAIN'] || '' : '',
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
      data: { message: 'Logged out successfully' }
    });
  } catch (error) {
    console.error('Distributor logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// Get distributor profile (protected route)
router.get('/profile', distributorAuthMiddleware, getDistributorProfile);

// Get all distributors with pagination
router.get('/', getAllDistributors);

// Get distributor by ID
router.get('/:id', getDistributorById);

// Create new distributor (registration)
router.post('/', createDistributor);

// Update distributor
router.put('/:id', updateDistributor);

// Delete distributor
router.delete('/:id', deleteDistributor);

// Update distributor status
router.patch('/:id/status', updateDistributorStatus);

export default router;