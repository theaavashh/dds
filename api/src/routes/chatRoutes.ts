import express from 'express';
import {
  getConversations,
  getConversationById,
  sendMessage,
  createConversation,
  updateConversationStatus,
  getUnreadCount,
} from '../controllers/chatController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All chat routes require admin authentication
router.use(authenticateAdmin);

// Get all conversations
router.get('/', getConversations);

// Get unread message count
router.get('/unread/count', getUnreadCount);

// Create a new conversation
router.post('/', createConversation);

// Get conversation by ID with messages
router.get('/:id', getConversationById);

// Update conversation status
router.patch('/:id/status', updateConversationStatus);

// Send a message to a conversation
router.post('/:id/messages', sendMessage);

export default router;