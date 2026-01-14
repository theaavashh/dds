import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { Request, Response } from 'express';
import { LoginRequest, RegisterRequest, ApiResponse, Admin, JWTPayload } from '../types';

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const registerValidation = [
  body('fullname')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Generate JWT token
const generateToken = (adminId: string): string => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    { id: adminId },
    secret,
    { expiresIn: '7d' }
  );
};

// Import CSRF token generator
import { generateCsrfToken } from '../middleware/csrfMiddleware';

// Define interface for login response data (without token for security)
interface LoginResponseData {
  admin: Partial<Admin>;
}

// Login
router.post('/login', loginValidation, async (req: Request<{}, ApiResponse<LoginResponseData>, LoginRequest>, res: Response<ApiResponse<LoginResponseData>>) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;

    // Find admin by email (case-insensitive search)
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(admin.id);

    // Return admin data (without password)
    const { password: _, ...adminData } = admin;

    // Set httpOnly cookie for secure token storage with enhanced security
    const isProduction = process.env['NODE_ENV'] === 'production';
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: isProduction, // Only send over HTTPS in production
      sameSite: isProduction ? 'strict' : 'lax', // Use 'strict' in production for better CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      domain: isProduction ? process.env['COOKIE_DOMAIN'] || '' : '', // Allow specifying domain for production
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: adminData
        // Token is securely stored in httpOnly cookie, not sent in response body
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Register (for creating new admin accounts)
router.post('/register', registerValidation, async (req: Request<{}, ApiResponse<{ admin: Partial<Admin>; token: string }>, RegisterRequest>, res: Response<ApiResponse<{ admin: Partial<Admin>; token: string }>>) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array()[0].msg
      });
    }

    const { fullname, username, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email or username already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        fullname,
        username,
        email,
        password: hashedPassword
      }
    });

    // Generate token
    const token = generateToken(admin.id);

    // Return admin data (without password)
    const { password: _, ...adminData } = admin;

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        admin: adminData,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Change Password
router.post('/change-password', async (req: Request<{}, ApiResponse<{ message: string }>, { userId: string; currentPassword: string; newPassword: string }>, res: Response<ApiResponse<{ message: string }>>) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: userId }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.admin.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: { message: 'Password changed successfully' }
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

// Retailer Admin Registration with Full Details
const retailerAdminValidation = [
  body('fullname')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('shopName')
    .trim()
    .notEmpty()
    .withMessage('Shop name is required'),
  body('panVatNo')
    .trim()
    .notEmpty()
    .withMessage('PAN/VAT number is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
];

// Create Retailer (for retailer portal users/agents)
router.post('/retailer/create', retailerAdminValidation, async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array()[0].msg
      });
    }

    // Since the Retailer model has been removed, we'll return an error
    return res.status(400).json({
      success: false,
      message: 'Retailer registration is temporarily unavailable'
    });
  } catch (error) {
    console.error('Retailer creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during retailer creation'
    });
  }
});

// Get CSRF token
router.get('/csrf-token', (req, res) => {
  try {
    console.log('Generating CSRF token for request');
    console.log('Request IP:', req.ip);
    console.log('Node environment:', process.env.NODE_ENV);
    
    // Determine session identifier for token generation
    let sessionIdentifier;
    if (process.env.NODE_ENV === 'development') {
      sessionIdentifier = 'development-session';
    } else {
      sessionIdentifier = req.ip || 'anonymous';
    }
    console.log('Generation session identifier:', sessionIdentifier);
    
    const token = generateCsrfToken(req, res);
    console.log('Generated CSRF token:', token);
    
    res.json({
      success: true,
      data: { csrfToken: token },
      message: 'CSRF token generated successfully'
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate CSRF token'
    });
  }
});

// Get current admin profile (from cookie)
router.get('/me', async (req: Request, res: Response<ApiResponse<Partial<Admin>>>) => {
  try {
    // Try to get token from cookie first (preferred method)
    let token = req.cookies?.authToken;
    
    // Fallback to Authorization header for backward compatibility
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        fullname: true, 
        username: true, 
        email: true, 
        role: true, 
        isActive: true, 
        createdAt: true,
        updatedAt: true
      }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// Logout endpoint
router.post('/logout', async (_req: Request, res: Response<ApiResponse<{ message: string }>>) => {
  try {
    // Clear the auth cookie with enhanced security settings
    const isProduction = process.env['NODE_ENV'] === 'production';
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      domain: isProduction ? process.env['COOKIE_DOMAIN'] || '' : '',
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
      data: { message: 'Logged out successfully' }
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

export default router;
