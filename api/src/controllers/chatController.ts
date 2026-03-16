import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all conversations for admin
export const getConversations = async (_req: any, res: Response) => {
  try {
    const conversations = await prisma.chatConversation.findMany({
      include: {
        distributor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            companyName: true,
          },
        },
        admin: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderType: 'distributor',
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Get conversation details with messages
export const getConversationById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.chatConversation.findUnique({
      where: { id },
      include: {
        distributor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            companyName: true,
            phone: true,
            city: true,
            country: true,
          },
        },
        admin: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Mark unread messages as read
    await prisma.chatMessage.updateMany({
      where: {
        conversationId: id,
        isRead: false,
        senderType: 'distributor',
      },
      data: {
        isRead: true,
      },
    });

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

// Send a message
export const sendMessage = async (req: any, res: Response) => {
  try {
    const { conversationId, content, messageType = 'text' } = req.body;
    const adminId = req.user?.id;

    if (!conversationId || !content) {
      return res.status(400).json({ error: 'Conversation ID and content are required' });
    }

    // Verify conversation exists
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: adminId!,
        senderType: 'admin',
        content,
        messageType,
      },
    });

    // Update conversation's last message time and assign admin if not already assigned
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        adminId: adminId!,
      },
    });

    // Fetch the complete message with sender info
    const completeMessage = await prisma.chatMessage.findUnique({
      where: { id: message.id },
      include: {
        conversation: {
          select: {
            distributor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(completeMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Create a new conversation (for when admin initiates contact)
export const createConversation = async (req: any, res: Response) => {
  try {
    const { distributorId, initialMessage } = req.body;
    const adminId = req.user?.id;

    if (!distributorId) {
      return res.status(400).json({ error: 'Distributor ID is required' });
    }

    // Check if conversation already exists
    const existingConversation = await prisma.chatConversation.findFirst({
      where: {
        distributorId,
      },
    });

    if (existingConversation) {
      return res.status(400).json({ error: 'Conversation already exists', conversation: existingConversation });
    }

    // Verify distributor exists
    const distributor = await prisma.distributor.findUnique({
      where: { id: distributorId },
    });

    if (!distributor) {
      return res.status(404).json({ error: 'Distributor not found' });
    }

    // Create conversation
    const conversation = await prisma.chatConversation.create({
      data: {
        distributorId,
        adminId,
        status: 'active',
      },
      include: {
        distributor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            companyName: true,
          },
        },
      },
    });

    // If initial message is provided, create it
    if (initialMessage) {
      await prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: adminId!,
          senderType: 'admin',
          content: initialMessage,
        },
      });
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Update conversation status
export const updateConversationStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'closed', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required (active, closed, archived)' });
    }

    const conversation = await prisma.chatConversation.update({
      where: { id },
      data: { status },
      include: {
        distributor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            companyName: true,
          },
        },
      },
    });

    res.json(conversation);
  } catch (error) {
    console.error('Error updating conversation status:', error);
    res.status(500).json({ error: 'Failed to update conversation status' });
  }
};

// Get unread message count
export const getUnreadCount = async (_req: any, res: Response) => {
  try {
    const unreadCount = await prisma.chatMessage.count({
      where: {
        isRead: false,
        senderType: 'distributor',
      },
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};