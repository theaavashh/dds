import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import prisma from '../config/database';

// List all banners
export const listBanners = async (_req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { 
        isActive: true 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: banners,
      message: 'Banners retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners'
    });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }
    const imageUrl = `/uploads/banners/${req.file.filename}`;
    const existing = await (prisma as any).banner.findFirst();
    let item: any;
    if (existing) {
      item = await (prisma as any).banner.update({ where: { id: existing.id }, data: { imageUrl, isActive: true } });
    } else {
      item = await (prisma as any).banner.create({ data: { imageUrl, isActive: true } });
    }
    const data = { id: item.id, imageUrl: item.imageUrl, isActive: item.isActive, createdAt: item.createdAt };
    res.status(201).json({ success: true, data, message: 'Banner saved' });
  } catch (error) {
    console.error('createBanner error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await (prisma as any).banner.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = `/uploads/banners/${req.file.filename}`;
    }
    const data: any = {};
    if (typeof imageUrl !== 'undefined') data.imageUrl = imageUrl;
    const updated = await (prisma as any).banner.update({ where: { id }, data });
    const item = { id: updated.id, imageUrl: updated.imageUrl, isActive: updated.isActive, createdAt: updated.createdAt };
    res.status(200).json({ success: true, data: item, message: 'Updated' });
  } catch (error) {
    console.error('updateBanner error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await (prisma as any).banner.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    await (prisma as any).banner.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error('deleteBanner error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const toggleBannerStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await (prisma as any).banner.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    const updated = await (prisma as any).banner.update({ where: { id }, data: { isActive: !existing.isActive } });
    const item = { id: updated.id, imageUrl: updated.imageUrl, isActive: updated.isActive, createdAt: updated.createdAt };
    res.status(200).json({ success: true, data: item, message: 'Status updated' });
  } catch (error) {
    console.error('toggleBannerStatus error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
