import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Helper function to ensure directory exists
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Determine destination based on the field name or route
    const fieldName = file.fieldname;
    let destination = 'uploads/';
    
    if (fieldName === 'icon' && (req.path.includes('/categories') || req.originalUrl.includes('/categories'))) {
      destination = 'uploads/categories/icons/';
    } else if (fieldName === 'image' && (req.path.includes('/categories') || req.originalUrl.includes('/categories'))) {
      destination = 'uploads/categories/images/';

    } else if (fieldName === 'image' && (req.path.includes('/hero') || req.originalUrl.includes('/hero'))) {
      destination = 'uploads/hero/';
    } else if ((fieldName === 'leftImage' || fieldName === 'rightImage' || fieldName === 'leftBgImage' || fieldName === 'rightBgImage') && (req.path.includes('/hero-section') || req.originalUrl.includes('/hero-section'))) {
      destination = 'uploads/hero-section/';
    } else if (fieldName === 'images' && (req.path.includes('/products') || req.originalUrl.includes('/products'))) {
      destination = 'uploads/products/';
    } else if (fieldName === 'image' && (req.path.includes('/mid-banners') || req.originalUrl.includes('/mid-banners'))) {
      destination = 'uploads/mid-banners/';
    } else if (fieldName === 'image' && (req.path.includes('/banners') || req.originalUrl.includes('/banners'))) {
      destination = 'uploads/banners/';
    } else if (fieldName === 'image' && (req.path.includes('/services') || req.originalUrl.includes('/services'))) {
      destination = 'uploads/services/';
    } else if (fieldName === 'image' && (req.path.includes('/testimonials') || req.originalUrl.includes('/testimonials'))) {
      destination = 'uploads/testimonials/';
    } else if (fieldName === 'image' && (req.path.includes('/about-us') || req.originalUrl.includes('/about-us'))) {
      destination = 'uploads/about-us/';
    } else if (fieldName === 'image' && (req.path.includes('/stores') || req.originalUrl.includes('/stores'))) {
      destination = 'uploads/stores/';
  } else if (fieldName === 'video' && (req.path.includes('/videos') || req.originalUrl.includes('/videos'))) {
      destination = 'uploads/videos/';
  } else if (fieldName === 'images') {
      // Default for product images
      destination = 'uploads/products/';
    } else {
      destination = 'uploads/';
    }
    
    // Ensure directory exists before saving
    ensureDirectoryExists(destination);
    
    cb(null, destination);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  }
});

export default upload;
export const uploadHeroImage = upload.single('image');
export const uploadProductImages = upload.array('images', 10); // Allow up to 10 images
export const uploadMixedFiles = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]);
