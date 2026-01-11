import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import prisma from '../config/database';

// Get dashboard statistics
export const getDashboardStats = async (_req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    // Get counts
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const testimonialCount = await prisma.testimonial.count();
    const newsletterCount = await prisma.newsletterSubscription.count();

    res.json({
      success: true,
      data: {
        totalProducts: productCount,
        totalCategories: categoryCount,
        totalTestimonials: testimonialCount,
        totalSubscribers: newsletterCount
      },
      message: 'Dashboard stats retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
};

