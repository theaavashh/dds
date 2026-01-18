import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getPrivacyPolicy, upsertPrivacyPolicy, updatePrivacyPolicy } from '../controllers/privacyPolicyController';

const router = express.Router();

router.get('/', getPrivacyPolicy);
router.post('/', authMiddleware, upsertPrivacyPolicy);
router.put('/:id', authMiddleware, updatePrivacyPolicy);

export default router;