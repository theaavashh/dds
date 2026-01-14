import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthenticatedRequest, JWTPayload, ApiResponse } from '../types';

export const distributorAuthMiddleware = async (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>, next: NextFunction) => {
  try {
    // Try to get token from cookie first (preferred method)
    let token = req.cookies?.authToken;
    
    // Fallback to Authorization header for backward compatibility
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }
    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    // Check if distributor still exists and is active
    const distributor = await prisma.distributor.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        email: true, 
        status: true,
        firstName: true,
        lastName: true
      }
    });

    if (!distributor || distributor.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or distributor account deactivated.'
      });
    }

    // Add distributor info to request
    req.distributor = distributor;
    // Create a minimal admin-like object for compatibility
    req.user = {
      id: distributor.id,
      email: distributor.email,
      fullname: `${distributor.firstName} ${distributor.lastName}`,
      username: distributor.email,
      password: '', // Not applicable
      role: 'distributor',
      isActive: distributor.status === 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    next();
  } catch (error) {
    console.error('Distributor auth middleware error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};