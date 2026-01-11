import { Router } from 'express';
import * as inquiryController from '../controllers/inquiryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { distributorAuthMiddleware } from '../middleware/distributorAuthMiddleware';

const router = Router();

// Distributor routes
router.post('/', distributorAuthMiddleware, inquiryController.createInquiry);
router.get('/my-inquiries', distributorAuthMiddleware, inquiryController.getCustomerInquiries);

// Admin routes
router.get('/', authMiddleware, inquiryController.getAllInquiries);
router.get('/:id', authMiddleware, inquiryController.getInquiryById);
router.patch('/:id/status', authMiddleware, inquiryController.updateInquiryStatus);

export default router;
