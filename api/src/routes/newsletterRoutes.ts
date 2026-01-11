import express from 'express';
import { subscribe, newsletterValidation, listSubscriptions, exportSubscriptions, deleteSubscription } from '../controllers/newsletterController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/subscribe', newsletterValidation, subscribe);
router.get('/subscriptions', authMiddleware, listSubscriptions);
router.get('/subscriptions/export', authMiddleware, exportSubscriptions);
router.delete('/subscriptions/:id', authMiddleware, deleteSubscription);

export default router;
