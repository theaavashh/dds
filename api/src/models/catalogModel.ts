import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  image1Url: string | null;
  image2Url: string | null;
  image3Url: string | null;
  image4Url: string | null;
  image1Title: string | null;
  image1Link: string | null;
  image2Title: string | null;
  image2Link: string | null;
  image3Title: string | null;
  image3Link: string | null;
  image4Title: string | null;
  image4Link: string | null;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const catalogModel = {
  // Get all active catalog items ordered by position
  getAllActive: async (): Promise<CatalogItem[]> => {
    return await prisma.catalogItem.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' }
    });
  },

  // Get all catalog items (admin)
  getAll: async (): Promise<CatalogItem[]> => {
    return await prisma.catalogItem.findMany({
      orderBy: { position: 'asc' }
    });
  },

  // Get catalog item by ID
  getById: async (id: string): Promise<CatalogItem | null> => {
    return await prisma.catalogItem.findUnique({
      where: { id }
    });
  },

  // Create new catalog item
  create: async (data: {
    title: string;
    description: string;
    image1Url: string;
    image2Url: string;
    image3Url: string;
    image4Url: string;
    image1Title: string;
    image1Link: string;
    image2Title: string;
    image2Link: string;
    image3Title: string;
    image3Link: string;
    image4Title: string;
    image4Link: string;
    position: number;
    isActive: boolean;
  }): Promise<CatalogItem> => {
    return await prisma.catalogItem.create({
      data
    });
  },

  // Update catalog item
  update: async (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      image1Url: string;
      image2Url: string;
      image3Url: string;
      image4Url: string;
      image1Title: string;
      image1Link: string;
      image2Title: string;
      image2Link: string;
      image3Title: string;
      image3Link: string;
      image4Title: string;
      image4Link: string;
      position: number;
      isActive: boolean;
    }>
  ): Promise<CatalogItem> => {
    return await prisma.catalogItem.update({
      where: { id },
      data
    });
  },

  // Delete catalog item
  delete: async (id: string): Promise<void> => {
    await prisma.catalogItem.delete({
      where: { id }
    });
  },

  // Toggle active status
  toggleStatus: async (id: string): Promise<CatalogItem> => {
    const item = await prisma.catalogItem.findUnique({
      where: { id }
    });
    
    if (!item) {
      throw new Error('Catalog item not found');
    }

    return await prisma.catalogItem.update({
      where: { id },
      data: { isActive: !item.isActive }
    });
  }
};