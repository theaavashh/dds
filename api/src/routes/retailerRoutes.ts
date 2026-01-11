import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { Request, Response } from 'express';
import { ApiResponse } from '../types';

const router = express.Router();

// Get all distributors with pagination
router.get('/', async (req: Request, res: Response<ApiResponse<any[]>>) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 7;
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.distributor.count();

    // Get paginated distributors
    const distributors = await prisma.distributor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        companyName: true,
        city: true,
        country: true,
        status: true,
        totalOrders: true,
        totalRevenue: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Format distributors to match the frontend interface
    const formattedDistributors = distributors.map(distributor => ({
      id: distributor.id,
      name: `${distributor.firstName} ${distributor.lastName}`,
      email: distributor.email,
      phone: distributor.phone,
      address: `${distributor.city}, ${distributor.country}`,
      status: distributor.status as 'active' | 'inactive' | 'pending',
      registrationDate: distributor.createdAt.toISOString().split('T')[0],
      totalOrders: distributor.totalOrders,
      totalRevenue: distributor.totalRevenue,
      lastLogin: distributor.lastLogin ? distributor.lastLogin.toISOString().split('T')[0] : 'Never'
    }));

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: formattedDistributors,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages
      },
      message: 'Distributors retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching distributors'
    });
  }
});

// Get distributor by ID
router.get('/:id', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;

    const distributor = await prisma.distributor.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        companyName: true,
        city: true,
        country: true,
        status: true,
        totalOrders: true,
        totalRevenue: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: 'Distributor not found'
      });
    }

    res.json({
      success: true,
      data: distributor
    });
  } catch (error) {
    console.error('Error fetching distributor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching distributor'
    });
  }
});

// Update distributor
router.put('/:id', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle password update if provided
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    } else {
      // Don't update password if not provided
      delete updateData.password;
    }

    const distributor = await prisma.distributor.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        companyName: true,
        city: true,
        country: true,
        status: true,
        totalOrders: true,
        totalRevenue: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({
      success: true,
      message: 'Distributor updated successfully',
      data: distributor
    });
  } catch (error) {
    console.error('Error updating distributor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating distributor'
    });
  }
});

// Delete distributor
router.delete('/:id', async (req: Request, res: Response<ApiResponse<void>>) => {
  try {
    const { id } = req.params;

    await prisma.distributor.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Distributor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting distributor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting distributor'
    });
  }
});

export default router;