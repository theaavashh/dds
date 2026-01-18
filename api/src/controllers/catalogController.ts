import { Request, Response } from 'express';
import { catalogModel, CatalogItem } from '../models/catalogModel';
import { ApiResponse } from '../types';

// Get all active catalog items for frontend
export const getActiveCatalogItems = async (_req: Request, res: Response<ApiResponse<CatalogItem[]>>) => {
  try {
    const items = await catalogModel.getAllActive();
    
    res.json({
      success: true,
      data: items,
      message: 'Catalog items retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching catalog items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch catalog items'
    });
  }
};

// Get all catalog items for admin
export const getAllCatalogItems = async (_req: Request, res: Response<ApiResponse<CatalogItem[]>>) => {
  try {
    const items = await catalogModel.getAll();
    
    res.json({
      success: true,
      data: items,
      message: 'Catalog items retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching catalog items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch catalog items'
    });
  }
};

// Get catalog item by ID
export const getCatalogItemById = async (req: Request, res: Response<ApiResponse<CatalogItem>>) => {
  try {
    const { id } = req.params;
    const item = await catalogModel.getById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Catalog item not found'
      });
    }
    
    res.json({
      success: true,
      data: item,
      message: 'Catalog item retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch catalog item'
    });
  }
};

// Create new catalog item
export const createCatalogItem = async (req: Request, res: Response<ApiResponse<CatalogItem>>) => {
  try {
    const { title, description, position, isActive = true } = req.body;
    
    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const { image1Title, image1Link, image2Title, image2Link, image3Title, image3Link, image4Title, image4Link } = req.body;
    
    let image1Url = '';
    let image2Url = '';
    let image3Url = '';
    let image4Url = '';
    
    if (files?.['image1']?.[0]) {
      image1Url = `/uploads/${files['image1'][0].filename}`;
    }
    
    if (files?.['image2']?.[0]) {
      image2Url = `/uploads/${files['image2'][0].filename}`;
    }
    
    if (files?.['image3']?.[0]) {
      image3Url = `/uploads/${files['image3'][0].filename}`;
    }
    
    if (files?.['image4']?.[0]) {
      image4Url = `/uploads/${files['image4'][0].filename}`;
    }
    
    const newItem = await catalogModel.create({
      title,
      description,
      image1Url,
      image2Url,
      image3Url,
      image4Url,
      image1Title: image1Title || '',
      image1Link: image1Link || '',
      image2Title: image2Title || '',
      image2Link: image2Link || '',
      image3Title: image3Title || '',
      image3Link: image3Link || '',
      image4Title: image4Title || '',
      image4Link: image4Link || '',
      position: parseInt(position) || 0,
      isActive: String(isActive) === 'true'
    });
    
    res.status(201).json({
      success: true,
      data: newItem,
      message: 'Catalog item created successfully'
    });
  } catch (error) {
    console.error('Error creating catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create catalog item'
    });
  }
};

// Update catalog item
export const updateCatalogItem = async (req: Request, res: Response<ApiResponse<CatalogItem>>) => {
  try {
    const { id } = req.params;
    const { title, description, position, isActive } = req.body;
    
    // Check if item exists
    const existingItem = await catalogModel.getById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Catalog item not found'
      });
    }
    
    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const { image1Title, image1Link, image2Title, image2Link, image3Title, image3Link, image4Title, image4Link } = req.body;
    
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (position !== undefined) updateData.position = parseInt(position);
    if (isActive !== undefined) updateData.isActive = String(isActive) === 'true';
    
    if (files?.['image1']?.[0]) {
      updateData.image1Url = `/uploads/${files['image1'][0].filename}`;
    }
    
    if (files?.['image2']?.[0]) {
      updateData.image2Url = `/uploads/${files['image2'][0].filename}`;
    }
    
    if (files?.['image3']?.[0]) {
      updateData.image3Url = `/uploads/${files['image3'][0].filename}`;
    }
    
    if (files?.['image4']?.[0]) {
      updateData.image4Url = `/uploads/${files['image4'][0].filename}`;
    }
    
    // Add title and link updates
    if (image1Title !== undefined) updateData.image1Title = image1Title;
    if (image1Link !== undefined) updateData.image1Link = image1Link;
    if (image2Title !== undefined) updateData.image2Title = image2Title;
    if (image2Link !== undefined) updateData.image2Link = image2Link;
    if (image3Title !== undefined) updateData.image3Title = image3Title;
    if (image3Link !== undefined) updateData.image3Link = image3Link;
    if (image4Title !== undefined) updateData.image4Title = image4Title;
    if (image4Link !== undefined) updateData.image4Link = image4Link;
    
    const updatedItem = await catalogModel.update(id, updateData);
    
    res.json({
      success: true,
      data: updatedItem,
      message: 'Catalog item updated successfully'
    });
  } catch (error) {
    console.error('Error updating catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update catalog item'
    });
  }
};

// Delete catalog item
export const deleteCatalogItem = async (req: Request, res: Response<ApiResponse<null>>) => {
  try {
    const { id } = req.params;
    
    // Check if item exists
    const existingItem = await catalogModel.getById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Catalog item not found'
      });
    }
    
    await catalogModel.delete(id);
    
    res.json({
      success: true,
      message: 'Catalog item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete catalog item'
    });
  }
};

// Toggle catalog item status
export const toggleCatalogItemStatus = async (req: Request, res: Response<ApiResponse<CatalogItem>>) => {
  try {
    const { id } = req.params;
    
    const updatedItem = await catalogModel.toggleStatus(id);
    
    res.json({
      success: true,
      data: updatedItem,
      message: `Catalog item ${updatedItem.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error: any) {
    if (error.message === 'Catalog item not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Error toggling catalog item status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle catalog item status'
    });
  }
};