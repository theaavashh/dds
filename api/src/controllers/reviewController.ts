import { Request, Response } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../types';

// Note: Using the Prisma-generated Review type which has 'name' instead of 'customerName'
type Review = {
  id: string;
  productId: string;
  name: string; // Prisma field name
  rating: number;
  comment?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  email: string; // Assuming this field exists
  title: string; // Assuming this field exists
}

// Get all reviews for a specific product
export const getProductReviews = async (req: Request, res: Response<ApiResponse<Review[]>>) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
    });
  }
};

// Get all reviews (Admin)
export const getAllReviews = async (_req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map Prisma review fields to expected response format
    const mappedReviews = reviews.map(review => ({
      id: review.id,
      productId: review.productId,
      customerName: review.name, // Map name to customerName for frontend compatibility
      rating: review.rating,
      comment: review.comment,
      isActive: review.isActive,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      email: review.email, // assuming this exists
      title: review.title  // assuming this exists
    }));

    res.json({
      success: true,
      data: mappedReviews,
      count: mappedReviews.length,
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
    });
  }
};

// Create a new review
export const createReview = async (req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const { productId, customerName, rating, comment } = req.body;

    // Validation
    if (!productId || !customerName || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        name: customerName, // Map customerName to name field
        rating,
        comment: comment || '',
        email: req.body.email || '', // assuming email is provided
        title: req.body.title || 'Review' // assuming title is provided
      },
    });

    res.json({
      success: true,
      data: {
        id: review.id,
        productId: review.productId,
        customerName: review.name, // Map name to customerName for frontend compatibility
        rating: review.rating,
        comment: review.comment,
        isActive: review.isActive,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        email: review.email || '',
        title: review.title || ''
      },
      message: 'Review created successfully',
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
    });
  }
};

// Update review (Admin)
export const updateReview = async (req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const { id } = req.params;
    const { customerName, rating, comment, isActive } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: {
        name: customerName,
        rating,
        comment: comment !== undefined ? comment : undefined,
        isActive,
      },
    });

    res.json({
      success: true,
      data: {
        id: review.id,
        productId: review.productId,
        customerName: review.name, // Map name to customerName for frontend compatibility
        rating: review.rating,
        comment: review.comment,
        isActive: review.isActive,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        email: review.email || '',
        title: review.title || ''
      },
      message: 'Review updated successfully',
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
    });
  }
};

// Delete review (Admin)
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.review.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
    });
  }
};

// Toggle review status (Admin)
export const toggleReviewStatus = async (req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        isActive: !review.isActive,
      },
    });

    res.json({
      success: true,
      data: {
        id: updatedReview.id,
        productId: updatedReview.productId,
        customerName: updatedReview.name, // Map name to customerName for frontend compatibility
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        isActive: updatedReview.isActive,
        createdAt: updatedReview.createdAt,
        updatedAt: updatedReview.updatedAt,
        email: updatedReview.email || '',
        title: updatedReview.title || ''
      },
      message: 'Review status updated successfully',
    });
  } catch (error) {
    console.error('Error toggling review status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review status',
    });
  }
};