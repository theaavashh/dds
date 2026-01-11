import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Generate JWT token for distributors
const generateToken = (distributorId: string): string => {
  const secret = process.env['JWT_SECRET'] || 'fallback_secret_for_development';
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    { id: distributorId, type: 'distributor' },
    secret,
    { expiresIn: '7d' }
  );
};

// Get all distributors with pagination
export const getAllDistributors = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Get total count
    // @ts-ignore - Prisma client types not updated
    const totalCount = await prisma.distributor.count({ where });

    // Get paginated distributors
    // @ts-ignore - Prisma client types not updated
    const distributors = await prisma.distributor.findMany({
      where,
      select: {
        id: true,
        companyName: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
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
    const formattedDistributors = distributors.map((distributor: any) => ({
      id: distributor.id,
      companyName: distributor.companyName,
      firstName: distributor.firstName,
      lastName: distributor.lastName,
      email: distributor.email,
      phone: distributor.phone,
      city: distributor.city,
      country: distributor.country,
      status: distributor.status as 'pending' | 'approved' | 'rejected' | 'blocked',
      registrationDate: distributor.createdAt.toISOString().split('T')[0],
      totalOrders: distributor.totalOrders,
      totalRevenue: distributor.totalRevenue,
      lastLogin: distributor.lastLogin || 'Never'
    }));

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: formattedDistributors,
      count: totalCount,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching distributors'
    });
  }
};

// Get distributor by ID
export const getDistributorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // @ts-ignore - Prisma client types not updated
    const distributor = await prisma.distributor.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
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
};

// Get distributor profile
export const getDistributorProfile = async (req: any, res: Response) => {
  try {
    // The distributor is attached to the request by the auth middleware
    const distributorId = req.distributor.id;

    // @ts-ignore - Prisma client types not updated
    const distributor = await prisma.distributor.findUnique({
      where: { id: distributorId },
      select: {
        id: true,
        companyName: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
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
      data: {
        distributor
      }
    });
  } catch (error) {
    console.error('Error fetching distributor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching distributor profile'
    });
  }
};

// Create new distributor (registration)
export const createDistributor = async (req: Request, res: Response) => {
  try {
    const { 
      companyName,
      firstName,
      lastName,
      email,
      password,
      phone,
      city,
      country
    } = req.body;

    // Check if distributor already exists
    // @ts-ignore - Prisma client types not updated
    const existingDistributor = await prisma.distributor.findUnique({
      where: { email }
    });

    if (existingDistributor) {
      return res.status(409).json({
        success: false,
        message: 'Distributor with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create distributor
    // @ts-ignore - Prisma client types not updated
    const distributor = await prisma.distributor.create({
      data: {
        companyName,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        city,
        country,
        status: 'pending' // Default status for new registrations
      },
      select: {
        id: true,
        companyName: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
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

    res.status(201).json({
      success: true,
      message: 'Distributor registered successfully',
      data: distributor
    });
  } catch (error) {
    console.error('Error creating distributor:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering distributor'
    });
  }
};

// Update distributor
export const updateDistributor = async (req: Request, res: Response) => {
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

    // @ts-ignore - Prisma client types not updated
    const distributor = await prisma.distributor.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        companyName: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
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
};

// Delete distributor
export const deleteDistributor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // @ts-ignore - Prisma client types not updated
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
};

// Update distributor status
export const updateDistributorStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, approved, rejected, blocked'
      });
    }

    // @ts-ignore - Prisma client types not updated
    const distributor = await prisma.distributor.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        companyName: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
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
      message: `Distributor status updated to ${status}`,
      data: distributor
    });
  } catch (error) {
    console.error('Error updating distributor status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating distributor status'
    });
  }
};

// Distributor login
export const loginDistributor = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find distributor by email
    // @ts-ignore - Prisma client types not updated
    const distributor = await prisma.distributor.findUnique({
      where: { email }
    });

    if (!distributor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if distributor is approved
    if (distributor.status !== 'approved') {
      return res.status(401).json({
        success: false,
        message: 'Account not approved. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, distributor.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(distributor.id);

    // Update last login
    // @ts-ignore - Prisma client types not updated
    await prisma.distributor.update({
      where: { id: distributor.id },
      data: { lastLogin: new Date() }
    });

    // Return distributor data (without password)
    const { password: _, ...distributorData } = distributor;

    // Set httpOnly cookie for secure token storage
    const isProduction = process.env['NODE_ENV'] === 'production';
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        distributor: distributorData
      }
    });
  } catch (error) {
    console.error('Distributor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};