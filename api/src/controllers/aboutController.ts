import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAbout = async (_req: Request, res: Response) => {
  try {
    const aboutPage = await (prisma as any).aboutPage.findFirst({
      include: {
        heroSection: true,
        heritageSection: true,
        beyondSparkle: true,
        celebrations: true,
        gemologist: true,
        knowledge: true,
        promise: true,
        brandPromise: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!aboutPage) {
      return res.status(200).json({ success: true, data: null });
    }

    const data = {
      id: aboutPage.id,
      isActive: aboutPage.isActive,
      createdAt: aboutPage.createdAt,
      updatedAt: aboutPage.updatedAt,
      heroSection: aboutPage.heroSection ? {
        id: aboutPage.heroSection.id,
        title: aboutPage.heroSection.title,
        subtitle: aboutPage.heroSection.subtitle,
        isActive: aboutPage.heroSection.isActive
      } : null,
      heritageSection: aboutPage.heritageSection ? {
        id: aboutPage.heritageSection.id,
        title: aboutPage.heritageSection.title,
        content: JSON.parse(aboutPage.heritageSection.content),
        isActive: aboutPage.heritageSection.isActive
      } : null,
      beyondSparkle: aboutPage.beyondSparkle ? {
        id: aboutPage.beyondSparkle.id,
        title: aboutPage.beyondSparkle.title,
        subtitle: aboutPage.beyondSparkle.subtitle,
        items: JSON.parse(aboutPage.beyondSparkle.items),
        footerText: aboutPage.beyondSparkle.footerText,
        isActive: aboutPage.beyondSparkle.isActive
      } : null,
      celebrations: aboutPage.celebrations ? {
        id: aboutPage.celebrations.id,
        title: aboutPage.celebrations.title,
        content: JSON.parse(aboutPage.celebrations.content),
        collections: JSON.parse(aboutPage.celebrations.collections),
        isActive: aboutPage.celebrations.isActive
      } : null,
      gemologist: aboutPage.gemologist ? {
        id: aboutPage.gemologist.id,
        name: aboutPage.gemologist.name,
        title: aboutPage.gemologist.title,
        company: aboutPage.gemologist.company,
        expertise: JSON.parse(aboutPage.gemologist.expertise),
        messageTitle: aboutPage.gemologist.messageTitle,
        message: JSON.parse(aboutPage.gemologist.message),
        signature: aboutPage.gemologist.signature,
        isActive: aboutPage.gemologist.isActive
      } : null,
      knowledge: aboutPage.knowledge ? {
        id: aboutPage.knowledge.id,
        title: aboutPage.knowledge.title,
        subtitle: aboutPage.knowledge.subtitle,
        content: JSON.parse(aboutPage.knowledge.content),
        isActive: aboutPage.knowledge.isActive
      } : null,
      promise: aboutPage.promise ? {
        id: aboutPage.promise.id,
        title: aboutPage.promise.title,
        promises: JSON.parse(aboutPage.promise.promises),
        isActive: aboutPage.promise.isActive
      } : null,
      brandPromise: aboutPage.brandPromise ? {
        id: aboutPage.brandPromise.id,
        brandName: aboutPage.brandPromise.brandName,
        tagline: aboutPage.brandPromise.tagline,
        buttonText: aboutPage.brandPromise.buttonText,
        buttonLink: aboutPage.brandPromise.buttonLink,
        isActive: aboutPage.brandPromise.isActive
      } : null
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getAbout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const upsertAbout = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Find or create AboutPage
    let aboutPage = await (prisma as any).aboutPage.findFirst();
    
    if (!aboutPage) {
      aboutPage = await (prisma as any).aboutPage.create({
        data: { isActive: true }
      });
    }

    // Update each section if provided
    if (data.heroSection) {
      await upsertSection('heroSection', aboutPage.id, data.heroSection);
    }
    if (data.heritageSection) {
      await upsertSection('heritageSection', aboutPage.id, data.heritageSection);
    }
    if (data.beyondSparkle) {
      await upsertSection('beyondSparkle', aboutPage.id, data.beyondSparkle);
    }
    if (data.celebrations) {
      await upsertSection('celebrations', aboutPage.id, data.celebrations);
    }
    if (data.gemologist) {
      await upsertSection('gemologist', aboutPage.id, data.gemologist);
    }
    if (data.knowledge) {
      await upsertSection('knowledge', aboutPage.id, data.knowledge);
    }
    if (data.promise) {
      await upsertSection('promise', aboutPage.id, data.promise);
    }
    if (data.brandPromise) {
      await upsertSection('brandPromise', aboutPage.id, data.brandPromise);
    }

    // Fetch updated data
    const updatedAbout = await (prisma as any).aboutPage.findFirst({
      where: { id: aboutPage.id },
      include: {
        heroSection: true,
        heritageSection: true,
        beyondSparkle: true,
        celebrations: true,
        gemologist: true,
        knowledge: true,
        promise: true,
        brandPromise: true
      }
    });

    res.status(201).json({ success: true, data: updatedAbout, message: 'About page saved' });
  } catch (error) {
    console.error('upsertAbout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

async function upsertSection(sectionType: string, aboutPageId: string, sectionData: any) {
  const modelName = getSectionModel(sectionType);
  const existing = await (prisma as any)[modelName].findUnique({ where: { aboutPageId } });
  
  const processedData = processSectionData(sectionType, sectionData);
  
  if (existing) {
    await (prisma as any)[modelName].update({
      where: { aboutPageId },
      data: { ...processedData, aboutPageId }
    });
  } else {
    await (prisma as any)[modelName].create({
      data: { ...processedData, aboutPageId }
    });
  }
}

function getSectionModel(sectionType: string): string {
  const models: { [key: string]: string } = {
    heroSection: 'aboutHeroSection',
    heritageSection: 'aboutHeritageSection',
    beyondSparkle: 'aboutBeyondSparkle',
    celebrations: 'aboutCelebrations',
    gemologist: 'aboutGemologist',
    knowledge: 'aboutKnowledge',
    promise: 'aboutPromise',
    brandPromise: 'aboutBrandPromise'
  };
  return models[sectionType] || 'aboutHeroSection';
}

function processSectionData(sectionType: string, data: any): any {
  const processed: any = { ...data };
  
  // Convert arrays to JSON strings
  const arrayFields: { [key: string]: string[] } = {
    heritageSection: ['content'],
    beyondSparkle: ['items'],
    celebrations: ['content', 'collections'],
    gemologist: ['expertise', 'message'],
    knowledge: ['content'],
    promise: ['promises']
  };
  
  if (arrayFields[sectionType]) {
    arrayFields[sectionType].forEach(field => {
      if (data[field] && Array.isArray(data[field])) {
        processed[field] = JSON.stringify(data[field]);
      }
    });
  }
  
  return processed;
}

export const updateAbout = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const existing = await (prisma as any).aboutPage.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'About page not found' });

    // Update specific section if provided
    if (data.sectionType && data.sectionData) {
      await upsertSection(data.sectionType, id, data.sectionData);
    }

    // Fetch updated data
    const updatedAbout = await (prisma as any).aboutPage.findFirst({
      where: { id },
      include: {
        heroSection: true,
        heritageSection: true,
        beyondSparkle: true,
        celebrations: true,
        gemologist: true,
        knowledge: true,
        promise: true,
        brandPromise: true
      }
    });

    res.status(200).json({ success: true, data: updatedAbout, message: 'Updated' });
  } catch (error) {
    console.error('updateAbout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
