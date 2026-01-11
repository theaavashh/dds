import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAbout = async (_req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).aboutPage.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    if (!existing) return res.status(200).json({ success: true, data: null });
    const data = {
      id: existing.id,
      title: existing.title,
      description: existing.description,
      ctaLink: existing.ctaLink,
      ctaTitle: existing.ctaTitle,
      isActive: existing.isActive,
      createdAt: existing.createdAt
    };
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getAbout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const upsertAbout = async (req: Request, res: Response) => {
  try {
    const { title, description, ctaLink, ctaTitle, isActive } = req.body as {
      title: string;
      description: string;
      ctaLink?: string;
      ctaTitle?: string;
      isActive?: boolean;
    };
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const existing = await (prisma as any).aboutPage.findFirst();
    let item;
    if (existing) {
      item = await (prisma as any).aboutPage.update({
        where: { id: existing.id },
        data: {
          title,
          description,
          ctaLink,
          ctaTitle,
          isActive: typeof isActive === 'boolean' ? isActive : existing.isActive
        }
      });
    } else {
      item = await (prisma as any).aboutPage.create({
        data: {
          title,
          description,
          ctaLink,
          ctaTitle,
          isActive: typeof isActive === 'boolean' ? isActive : true
        }
      });
    }

    const data = {
      id: item.id,
      title: item.title,
      description: item.description,
      ctaLink: item.ctaLink,
      ctaTitle: item.ctaTitle,
      isActive: item.isActive,
      createdAt: item.createdAt
    };
    res.status(201).json({ success: true, data, message: 'About page saved' });
  } catch (error) {
    console.error('upsertAbout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateAbout = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { title, description, ctaLink, ctaTitle, isActive } = req.body as {
      title?: string;
      description?: string;
      ctaLink?: string;
      ctaTitle?: string;
      isActive?: boolean;
    };

    const existing = await (prisma as any).aboutPage.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    const item = await (prisma as any).aboutPage.update({
      where: { id },
      data: {
        title,
        description,
        ctaLink,
        ctaTitle,
        isActive
      }
    });

    res.status(200).json({ success: true, data: item, message: 'Updated' });
  } catch (error) {
    console.error('updateAbout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
