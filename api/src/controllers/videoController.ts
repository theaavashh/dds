import { Request, Response } from 'express';
import prisma from '../config/database';

export const listVideos = async (req: Request, res: Response) => {
  try {
    const pageRaw = (req.query.page as string) || '1';
    const limitRaw = (req.query.limit as string) || '20';
    let page = parseInt(pageRaw);
    let limit = parseInt(limitRaw);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 1000) limit = 20;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    const where = search ? { title: { contains: search, mode: 'insensitive' } } : {};
    const items = await (prisma as any).video.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit });
    const total = await (prisma as any).video.count({ where });

    res.status(200).json({
      success: true,
      data: items.map((v: any) => ({ id: v.id, title: v.title, videoUrl: v.videoUrl, isActive: v.isActive, createdAt: v.createdAt })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: skip + items.length < total, hasPrev: page > 1 },
    });
  } catch (error) {
    console.error('listVideos error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createVideo = async (req: Request, res: Response) => {
  try {
    const { title } = req.body as { title?: string };
    let videoUrl: string | null = null;
    if (req.file) {
      videoUrl = `/uploads/videos/${req.file.filename}`;
    }
    if (!videoUrl) return res.status(400).json({ success: false, message: 'Video file is required' });
    const created = await (prisma as any).video.create({ data: { title: title ?? null, videoUrl, isActive: true, sortOrder: 0 } });
    const item = { id: created.id, title: created.title, videoUrl: created.videoUrl, isActive: created.isActive, createdAt: created.createdAt };
    res.status(201).json({ success: true, data: item, message: 'Video created' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateVideo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { title, isActive } = req.body as { title?: string; isActive?: boolean };
    const existing = await (prisma as any).video.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    let videoUrl: string | undefined;
    if (req.file) {
      videoUrl = `/uploads/videos/${req.file.filename}`;
    }

    const data: any = {};
    if (typeof title !== 'undefined') data.title = title;
    if (typeof isActive !== 'undefined') data.isActive = isActive;
    if (typeof videoUrl !== 'undefined') data.videoUrl = videoUrl;

    const updated = await (prisma as any).video.update({ where: { id }, data });
    const item = { id: updated.id, title: updated.title, videoUrl: updated.videoUrl, isActive: updated.isActive, createdAt: updated.createdAt };
    res.status(200).json({ success: true, data: item, message: 'Updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await (prisma as any).video.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    await (prisma as any).video.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const toggleVideoStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await (prisma as any).video.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    const updated = await (prisma as any).video.update({ where: { id }, data: { isActive: !existing.isActive } });
    const item = { id: updated.id, title: updated.title, videoUrl: updated.videoUrl, isActive: updated.isActive, createdAt: updated.createdAt };
    res.status(200).json({ success: true, data: item, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
