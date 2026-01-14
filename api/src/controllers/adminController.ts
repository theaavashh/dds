import { Request, Response } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';

interface AdminCreateRequest {
  fullname: string;
  username: string;
  email: string;
  password: string;
  role: string;
  roleIds?: string[];
}

interface AdminUpdateRequest {
  fullname?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
  roleIds?: string[];
}

// Validation rules
export const adminValidation = [
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
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'editor', 'viewer'])
    .withMessage('Invalid role')
];

export const adminUpdateValidation = [
  body('fullname')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'editor', 'viewer'])
    .withMessage('Invalid role')
];

// Get all admins
export const getAllAdmins = async (_req: Request, res: Response) => {
  try {
    const admins = await prisma.admin.findMany({
      include: {
        adminRoles: {
          include: {
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Remove passwords from response
    const adminsWithoutPasswords = admins.map(admin => {
      const { password, ...adminData } = admin;
      return adminData;
    });

    res.json({
      success: true,
      data: adminsWithoutPasswords
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins'
    });
  }
};

// Get admin by ID
export const getAdminById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const admin = await prisma.admin.findUnique({
      where: { id },
      include: {
        adminRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const { password, ...adminData } = admin;

    res.json({
      success: true,
      data: adminData
    });
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin'
    });
  }
};

// Create admin
export const createAdmin = async (req: Request<{}, {}, AdminCreateRequest>, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fullname, username, email, password, role, roleIds } = req.body;

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

    // Create admin with roles
    const admin = await prisma.$transaction(async (tx) => {
      // Create admin
      const newAdmin = await tx.admin.create({
        data: {
          fullname,
          username,
          email,
          password: hashedPassword,
          role: role || 'admin'
        }
      });

      // Assign roles if provided
      if (roleIds && roleIds.length > 0) {
        await tx.adminRole.createMany({
          data: roleIds.map(roleId => ({
            adminId: newAdmin.id,
            roleId
          }))
        });
      }

      return newAdmin;
    });

    // Fetch admin with roles
    const adminWithRoles = await prisma.admin.findUnique({
      where: { id: admin.id },
      include: {
        adminRoles: {
          include: {
            role: true
          }
        }
      }
    });

    const { password: _, ...adminData } = adminWithRoles!;

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: adminData
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin'
    });
  }
};

// Update admin
export const updateAdmin = async (req: Request<{ id: string }, {}, AdminUpdateRequest>, res: Response) => {
  try {
    const { id } = req.params;
    const { fullname, username, email, password, role, isActive, roleIds } = req.body;

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id }
    });

    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Update admin
    const updateData: any = {};
    if (fullname !== undefined) updateData.fullname = fullname;
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Hash password if provided
    if (password) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    // Update admin and roles
    await prisma.$transaction(async (tx) => {
      const updatedAdmin = await tx.admin.update({
        where: { id },
        data: updateData
      });

      // Update roles if provided
      if (roleIds) {
        // Delete existing admin roles
        await tx.adminRole.deleteMany({
          where: { adminId: id }
        });

        // Create new admin roles
        if (roleIds.length > 0) {
          await tx.adminRole.createMany({
            data: roleIds.map(roleId => ({
              adminId: id,
              roleId
            }))
          });
        }
      }

      return updatedAdmin;
    });

    // Fetch admin with roles
    const adminWithRoles = await prisma.admin.findUnique({
      where: { id },
      include: {
        adminRoles: {
          include: {
            role: true
          }
        }
      }
    });

    const { password: _, ...adminData } = adminWithRoles!;

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: adminData
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating admin'
    });
  }
};

// Delete admin
export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id }
    });

    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Delete admin (adminRoles will be cascade deleted)
    await prisma.admin.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting admin'
    });
  }
};

// Toggle admin active status
export const toggleAdminStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const admin = await prisma.admin.findUnique({
      where: { id }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: {
        isActive: !admin.isActive
      },
      include: {
        adminRoles: {
          include: {
            role: true
          }
        }
      }
    });

    const { password, ...adminData } = updatedAdmin;

    res.json({
      success: true,
      message: `Admin ${updatedAdmin.isActive ? 'activated' : 'deactivated'} successfully`,
      data: adminData
    });
  } catch (error) {
    console.error('Error toggling admin status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling admin status'
    });
  }
};






