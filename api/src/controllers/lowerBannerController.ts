import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import prisma from '../config/database';

// Get all lower banners
export const getLowerBanners = async (_req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const banners = await prisma.lowerBanner.findMany({
      orderBy: {
        position: 'asc'
      }
    });

    res.json({
      success: true,
      data: banners,
      message: 'Lower banners retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching lower banners:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lower banners'
    });
  }
};

// Get lower banner by position (1 for left, 2 for right)
export const getLowerBannerByPosition = async (req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const { position } = req.params;
    const banner = await prisma.lowerBanner.findUnique({
      where: { 
        position: parseInt(position)
      }
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Lower banner not found'
      });
    }

    res.json({
      success: true,
      data: banner,
      message: 'Lower banner retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching lower banner:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lower banner'
    });
  }
};

// Create/update lower banner by position
export const createOrUpdateLowerBanner = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const { position } = req.body;
    const positionNum = parseInt(position);

    if (positionNum !== 1 && positionNum !== 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Position must be 1 (left) or 2 (right)' 
      });
    }

    const imageUrl = `/uploads/lower-banners/${req.file.filename}`;

    // Check if banner with this position already exists
    const existingBanner = await prisma.lowerBanner.findUnique({
      where: { position: positionNum }
    });

    let banner;
    if (existingBanner) {
      // Update existing banner
      banner = await prisma.lowerBanner.update({
        where: { position: positionNum },
        data: { imageUrl }
      });
    } else {
      // Create new banner
      banner = await prisma.lowerBanner.create({
        data: { 
          position: positionNum,
          imageUrl 
        }
      });
    }

    res.status(201).json({
      success: true,
      data: banner,
      message: `Lower banner ${positionNum === 1 ? 'left' : 'right'} created/updated successfully`
    });
  } catch (error) {
    console.error('Error creating/updating lower banner:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update lower banner
export const updateLowerBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const existingBanner = await prisma.lowerBanner.findUnique({
      where: { id }
    });

    if (!existingBanner) {
      return res.status(404).json({
        success: false,
        message: 'Lower banner not found'
      });
    }

    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = `/uploads/lower-banners/${req.file.filename}`;
    }

    const data: any = {};
    if (typeof imageUrl !== 'undefined') data.imageUrl = imageUrl;

    const updatedBanner = await prisma.lowerBanner.update({
      where: { id },
      data
    });

    res.status(200).json({
      success: true,
      data: updatedBanner,
      message: 'Lower banner updated successfully'
    });
  } catch (error) {
    console.error('Error updating lower banner:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete lower banner
export const deleteLowerBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const existingBanner = await prisma.lowerBanner.findUnique({
      where: { id }
    });

    if (!existingBanner) {
      return res.status(404).json({
        success: false,
        message: 'Lower banner not found'
      });
    }

    await prisma.lowerBanner.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Lower banner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lower banner:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};