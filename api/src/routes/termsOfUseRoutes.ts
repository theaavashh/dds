import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getTermsOfUse, upsertTermsOfUse, updateTermsOfUse } from '../controllers/termsOfUseController';

const router = express.Router();

router.get('/', getTermsOfUse);
router.post('/', authMiddleware, upsertTermsOfUse);
router.put('/:id', authMiddleware, updateTermsOfUse);

export default router;