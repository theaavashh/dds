import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { Request, Response } from 'express';
import { LoginRequest, ApiResponse, Admin } from '../types';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { generateCsrfToken } from '../middleware/csrfMiddleware';
import logger from '../utils/logger';

const router = express.Router();

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore: { [email: string]: { otp: string; expiresAt: Date } } = {};

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
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

// Define interface for login response data (without token for security)
interface LoginResponseData {
  admin: Partial<Admin>;
}

// Verify credentials endpoint
router.post('/verify-credentials', loginValidation, async (req: Request<{}, ApiResponse<{ message: string }>, LoginRequest>, res: Response<ApiResponse<{ message: string }>>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      message: 'Credentials verified successfully'
    });
  } catch (error) {
    logger.error(`Verify credentials error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error during credential verification'
    });
  }
});

// Send OTP endpoint
router.post('/send-otp', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
], async (req: Request<{}, ApiResponse<{ message: string }>, { email: string }>, res: Response<ApiResponse<{ message: string }>>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array()[0].msg
      });
    }

    const { email } = req.body;
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore[email.toLowerCase()] = {
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    };

    logger.info(`OTP for ${email}: ${otp}`);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Login Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Login Verification</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #f0f0f0; margin: 20px 0;">${otp}</div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`OTP sent to ${email}`);
    } catch (emailError) {
      logger.error(`Failed to send OTP email: ${emailError}`);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    logger.error(`Send OTP error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP sending'
    });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
], async (req: Request<{}, ApiResponse<{ message: string }>, { email: string; otp: string }>, res: Response<ApiResponse<{ message: string }>>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array()[0].msg
      });
    }

    const { email, otp } = req.body;
    const storedOtp = otpStore[email.toLowerCase()];

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    if (new Date() > storedOtp.expiresAt) {
      delete otpStore[email.toLowerCase()];
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    delete otpStore[email.toLowerCase()];

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const token = generateToken(admin.id);
    const isProduction = process.env['NODE_ENV'] === 'production';
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      domain: isProduction ? process.env['COOKIE_DOMAIN'] || '' : '',
    });

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    logger.error(`Verify OTP error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
});

// Login
router.post('/login', loginValidation, async (req: Request<{}, ApiResponse<LoginResponseData>, LoginRequest>, res: Response<ApiResponse<LoginResponseData>>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(admin.id);
    const { password: _, ...adminData } = admin;
    const isProduction = process.env['NODE_ENV'] === 'production';

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      domain: isProduction ? process.env['COOKIE_DOMAIN'] || '' : '',
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: adminData
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user (me)
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    try {
      const decoded = jwt.verify(token, secret) as { id: string };
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
        include: {
          adminRoles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      const { password, ...adminData } = admin;
      res.json({
        success: true,
        data: adminData
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    logger.error(`Get current user error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
});

// Logout
router.post('/logout', async (_req: Request, res: Response) => {
  try {
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
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error(`Logout error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// CSRF token endpoint
router.get('/csrf-token', (req: Request, res: Response) => {
  const token = generateCsrfToken(req, res);
  res.json({
    success: true,
    data: {
      csrfToken: token
    }
  });
});

export default router;