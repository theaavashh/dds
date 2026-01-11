export interface DiamondCertification {
  id: string;
  title: string;
  description: string;
  fullContent?: string | null;
  ctaText: string;
  ctaLink?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RingCustomization {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink?: string | null;
  processImageUrl?: string | null;
  example1Title?: string | null;
  example1Desc?: string | null;
  example1ImageUrl?: string | null;
  example2Title?: string | null;
  example2Desc?: string | null;
  example2ImageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CelebrationProcessStep {
  id: string;
  celebrationProcessId: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CelebrationProcess {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  steps?: CelebrationProcessStep[];
}

export interface Culture {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id?: string;
  imageUrl: string;
  title?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// For existing galleries (with required id)
export interface Gallery extends GalleryBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// For new galleries (without id)
export interface NewGallery extends GalleryBase {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GalleryBase {
  title: string;
  subtitle: string;
  isActive: boolean;
  sortOrder: number;
  galleryItems: GalleryItem[];
}

export interface Quote {
  id: string;
  text: string;
  author?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeddingPlanner {
  id: string;
  title: string;
  description: string;
  fullContent?: string | null;
  ctaText: string;
  ctaLink?: string | null;
  imageUrl?: string | null;
  badgeText?: string | null;
  badgeSubtext?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CelebrationProcessStepFormData {
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface HelpCenter {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
