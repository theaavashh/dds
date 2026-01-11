import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/upload';
import { listVideos, createVideo, updateVideo, deleteVideo, toggleVideoStatus } from '../controllers/videoController';

const router = express.Router();

router.get('/', authMiddleware, listVideos);
router.post('/', authMiddleware, upload.single('video'), createVideo);
router.put('/:id', authMiddleware, upload.single('video'), updateVideo);
router.delete('/:id', authMiddleware, deleteVideo);
router.patch('/:id/toggle', authMiddleware, toggleVideoStatus);

export default router;
