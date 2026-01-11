import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import prisma from '../config/database';

// Get all hero sections
export const getAllHeroSections = async (_req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const heroSections = await prisma.heroSection.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: heroSections,
      message: 'Hero sections retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching hero sections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hero sections'
    });
  }
};

export const createHeroSection = async (req: Request, res: Response) => {
  try {
    const { 
      desktopImageUrl,
      mobileImageUrl
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Handle desktop and mobile images
    let desktopImageValue = desktopImageUrl;
    if (files?.['desktopImage']?.[0]) {
      desktopImageValue = `/uploads/hero-section/${files['desktopImage'][0].filename}`;
    }

    let mobileImageValue = mobileImageUrl;
    if (files?.['mobileImage']?.[0]) {
      mobileImageValue = `/uploads/hero-section/${files['mobileImage'][0].filename}`;
    }

    const heroSection = await prisma.heroSection.create({
      data: {
        desktopImageUrl: desktopImageValue,
        mobileImageUrl: mobileImageValue,
        isActive: true
      }
    });

    res.json({ success: true, data: heroSection });
  } catch (error) {
    console.error('Error creating hero section:', error);
    res.status(500).json({ success: false, message: 'Failed to create hero section' });
  }
};

export const updateHeroSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      desktopImageUrl,
      mobileImageUrl,
      isActive
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Handle desktop and mobile images
    let desktopImageValue = desktopImageUrl;
    if (files?.['desktopImage']?.[0]) {
      desktopImageValue = `/uploads/hero-section/${files['desktopImage'][0].filename}`;
    }

    let mobileImageValue = mobileImageUrl;
    if (files?.['mobileImage']?.[0]) {
      mobileImageValue = `/uploads/hero-section/${files['mobileImage'][0].filename}`;
    }

    const heroSection = await prisma.heroSection.update({
      where: { id },
      data: {
        desktopImageUrl: desktopImageValue,
        mobileImageUrl: mobileImageValue,
        ...(isActive !== undefined && { isActive: String(isActive) === 'true' })
      }
    });

    res.json({ success: true, data: heroSection });
  } catch (error) {
    console.error('Error updating hero section:', error);
    res.status(500).json({ success: false, message: 'Failed to update hero section' });
  }
};

export const deleteHeroSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.heroSection.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Hero section deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero section:', error);
    res.status(500).json({ success: false, message: 'Failed to delete hero section' });
  }
};
