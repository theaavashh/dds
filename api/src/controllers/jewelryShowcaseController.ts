import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import prisma from '../config/database';

// Get jewelry showcase
export const getJewelryShowcase = async (_req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const showcase = await prisma.jewelryShowcase.findFirst({
      where: {
        isActive: true
      }
    });

    if (!showcase) {
      return res.status(404).json({
        success: false,
        message: 'Jewelry showcase not found'
      });
    }

    res.json({
      success: true,
      data: showcase,
      message: 'Jewelry showcase retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching jewelry showcase:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jewelry showcase'
    });
  }
};

export const createJewelryShowcase = async (req: Request, res: Response) => {
  try {
    const { title, quote1, quote2, quote3, buttonText, isActive } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const showcase = await prisma.jewelryShowcase.create({
      data: {
        title: title || 'I see bold accessories as a woman\'s armour.',
        quote1: quote1 || 'Jewellery has the power to be the one little thing that makes you feel unique.',
        quote2: quote2 || 'I\'ve always thought of accessories as the exclamation point of a woman\'s outfit.',
        quote3: quote3 || 'Jewellery is a very personal thing... it should tell a story about the person who\'s wearing it.',
        buttonText: buttonText || 'Explore',
        leftImage: files?.['leftImage']?.[0] ? `/uploads/jewelry-showcase/${files['leftImage'][0].filename}` : null,
        rightImage: files?.['rightImage']?.[0] ? `/uploads/jewelry-showcase/${files['rightImage'][0].filename}` : null,
        isActive: isActive !== undefined ? String(isActive) === 'true' : true
      }
    });

    res.status(201).json({ success: true, data: showcase });
  } catch (error) {
    console.error('Error creating jewelry showcase:', error);
    res.status(500).json({ success: false, message: 'Failed to create jewelry showcase' });
  }
};

export const updateJewelryShowcase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, quote1, quote2, quote3, buttonText, isActive } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const existingShowcase = await prisma.jewelryShowcase.findUnique({
      where: { id }
    });

    if (!existingShowcase) {
      return res.status(404).json({ success: false, message: 'Jewelry showcase not found' });
    }

    const updatedShowcase = await prisma.jewelryShowcase.update({
      where: { id },
      data: {
        title: title || existingShowcase.title,
        quote1: quote1 || existingShowcase.quote1,
        quote2: quote2 || existingShowcase.quote2,
        quote3: quote3 || existingShowcase.quote3,
        buttonText: buttonText || existingShowcase.buttonText,
        leftImage: files?.['leftImage']?.[0] ? `/uploads/jewelry-showcase/${files['leftImage'][0].filename}` : existingShowcase.leftImage,
        rightImage: files?.['rightImage']?.[0] ? `/uploads/jewelry-showcase/${files['rightImage'][0].filename}` : existingShowcase.rightImage,
        isActive: isActive !== undefined ? String(isActive) === 'true' : existingShowcase.isActive
      }
    });

    res.status(200).json({ success: true, data: updatedShowcase });
  } catch (error) {
    console.error('Error updating jewelry showcase:', error);
    res.status(500).json({ success: false, message: 'Failed to update jewelry showcase' });
  }
};

export const deleteJewelryShowcase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingShowcase = await prisma.jewelryShowcase.findUnique({
      where: { id }
    });

    if (!existingShowcase) {
      return res.status(404).json({ success: false, message: 'Jewelry showcase not found' });
    }

    await prisma.jewelryShowcase.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: 'Jewelry showcase deleted successfully' });
  } catch (error) {
    console.error('Error deleting jewelry showcase:', error);
    res.status(500).json({ success: false, message: 'Failed to delete jewelry showcase' });
  }
};