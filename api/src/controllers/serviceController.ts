import { Request, Response } from 'express';
import prisma from '../config/database';

export const listServices = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    const where = search ? { title: { contains: search, mode: 'insensitive' } } : {};
    const items = await (prisma as any).service.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit });
    const total = await (prisma as any).service.count({ where });

    res.status(200).json({
      success: true,
      data: items.map((s: any) => ({
        id: s.id,
        title: s.title,
        imageUrl: s.imageUrl,
        isActive: s.isActive,
        createdAt: s.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + items.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const { title, link } = req.body as { title: string; link?: string };
    let imageUrl: string | null = null;
    if (req.file) {
      imageUrl = `/uploads/services/${req.file.filename}`;
    }

    const created = await (prisma as any).service.create({
      data: { title, link: link ?? null, imageUrl, isActive: true, sortOrder: 0 },
    });
    const item = { id: created.id, title: created.title, imageUrl: created.imageUrl, isActive: created.isActive, createdAt: created.createdAt };
    res.status(201).json({ success: true, data: item, message: 'Service created' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { title, link, isActive } = req.body as { title?: string; link?: string; isActive?: boolean };
    const existing = await (prisma as any).service.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = `/uploads/services/${req.file.filename}`;
    }

    const data: any = {};
    if (typeof title !== 'undefined') data.title = title;
    if (typeof link !== 'undefined') data.link = link;
    if (typeof isActive !== 'undefined') data.isActive = isActive;
    if (typeof imageUrl !== 'undefined') data.imageUrl = imageUrl;

    const updated = await (prisma as any).service.update({ where: { id }, data });
    const item = { id: updated.id, title: updated.title, imageUrl: updated.imageUrl, isActive: updated.isActive, createdAt: updated.createdAt };
    res.status(200).json({ success: true, data: item, message: 'Updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existingDel = await (prisma as any).service.findUnique({ where: { id } });
    if (!existingDel) return res.status(404).json({ success: false, message: 'Not found' });
    await (prisma as any).service.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
