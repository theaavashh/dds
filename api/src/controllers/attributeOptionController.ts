import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

// Get all attribute options (admin)
export const getAllAttributeOptions = async (req: Request, res: Response<ApiResponse<any[]>>) => {
  try {
    const { attribute, isActive } = req.query;
    
    const where: any = {};
    
    if (attribute) {
      where.attribute = attribute as string;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    const options = await prisma.attributeOption.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Error fetching attribute options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attribute options',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get attribute options by attribute name
export const getAttributeOptionsByAttribute = async (req: Request, res: Response<ApiResponse<any[]>>) => {
  try {
    const { attribute } = req.params;
    
    const options = await prisma.attributeOption.findMany({
      where: {
        attribute,
        isActive: true
      },
      orderBy: { value: 'asc' }
    });
    
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Error fetching attribute options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attribute options',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create attribute option
export const createAttributeOption = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { attribute, value } = req.body;
    
    // Check if option already exists
    const existingOption = await prisma.attributeOption.findUnique({
      where: {
        attribute_value: {
          attribute,
          value
        }
      }
    });
    
    if (existingOption) {
      return res.status(400).json({
        success: false,
        message: 'This option already exists for the specified attribute'
      });
    }
    
    const option = await prisma.attributeOption.create({
      data: {
        attribute,
        value
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Attribute option created successfully',
      data: option
    });
  } catch (error) {
    console.error('Error creating attribute option:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create attribute option',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update attribute option
export const updateAttributeOption = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    const { attribute, value } = req.body;
    
    // Check if another option with the same attribute and value exists
    const existingOption = await prisma.attributeOption.findUnique({
      where: {
        attribute_value: {
          attribute,
          value
        }
      }
    });
    
    if (existingOption && existingOption.id !== id) {
      return res.status(400).json({
        success: false,
        message: 'This option already exists for the specified attribute'
      });
    }
    
    const option = await prisma.attributeOption.update({
      where: { id },
      data: {
        attribute,
        value
      }
    });
    
    res.json({
      success: true,
      message: 'Attribute option updated successfully',
      data: option
    });
  } catch (error) {
    console.error('Error updating attribute option:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attribute option',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete attribute option
export const deleteAttributeOption = async (req: Request, res: Response<ApiResponse<void>>) => {
  try {
    const { id } = req.params;
    
    await prisma.attributeOption.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Attribute option deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attribute option:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attribute option',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Toggle attribute option status
export const toggleAttributeOptionStatus = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    
    const option = await prisma.attributeOption.findUnique({
      where: { id }
    });
    
    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Attribute option not found'
      });
    }
    
    const updatedOption = await prisma.attributeOption.update({
      where: { id },
      data: {
        isActive: !option.isActive
      }
    });
    
    res.json({
      success: true,
      message: `Attribute option ${updatedOption.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedOption
    });
  } catch (error) {
    console.error('Error toggling attribute option status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle attribute option status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};