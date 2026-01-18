import { Request, Response } from 'express';
import prisma from '../config/database';

export const getPrivacyPolicy = async (_req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).privacyPolicy.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (!existing) {
      return res.status(200).json({ success: true, data: null });
    }

    const data = {
      id: existing.id,
      title: existing.title,
      content: existing.content,
      isActive: existing.isActive,
      lastUpdated: existing.updatedAt
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getPrivacyPolicy error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const upsertPrivacyPolicy = async (req: Request, res: Response) => {
  try {
    const { title, content, isActive } = req.body as {
      title: string;
      content: string;
      isActive?: boolean;
    };

    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }

    const existing = await (prisma as any).privacyPolicy.findFirst();
    
    let item;
    if (existing) {
      item = await (prisma as any).privacyPolicy.update({
        where: { id: existing.id },
        data: {
          title,
          content,
          isActive: typeof isActive === 'boolean' ? isActive : existing.isActive
        }
      });
    } else {
      item = await (prisma as any).privacyPolicy.create({
        data: {
          title,
          content,
          isActive: typeof isActive === 'boolean' ? isActive : true
        }
      });
    }

    const data = {
      id: item.id,
      title: item.title,
      content: item.content,
      isActive: item.isActive,
      lastUpdated: item.updatedAt
    };

    res.status(201).json({ 
      success: true, 
      data, 
      message: 'Privacy policy saved successfully' 
    });
  } catch (error) {
    console.error('upsertPrivacyPolicy error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updatePrivacyPolicy = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { title, content, isActive } = req.body as {
      title?: string;
      content?: string;
      isActive?: boolean;
    };

    const existing = await (prisma as any).privacyPolicy.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Privacy policy not found' });
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isActive !== undefined) updateData.isActive = isActive;

    const item = await (prisma as any).privacyPolicy.update({
      where: { id },
      data: updateData
    });

    const data = {
      id: item.id,
      title: item.title,
      content: item.content,
      isActive: item.isActive,
      lastUpdated: item.updatedAt
    };

    res.status(200).json({ 
      success: true, 
      data, 
      message: 'Privacy policy updated successfully' 
    });
  } catch (error) {
    console.error('updatePrivacyPolicy error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};