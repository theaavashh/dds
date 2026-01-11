import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSeoReport = async (req: Request, res: Response) => {
  try {
    // Get content analysis data
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { isActive: true }
    });
    
    const totalGalleries = await prisma.gallery.count();
    const activeGalleries = await prisma.gallery.count({
      where: { isActive: true }
    });
    
    const totalTestimonials = await prisma.testimonial.count();
    const activeTestimonials = await prisma.testimonial.count({
      where: { isActive: true }
    });
    
    const totalFaqs = await prisma.fAQ.count();
    const activeFaqs = await prisma.fAQ.count({
      where: { isActive: true }
    });

    // Get products with missing SEO data
    const productsWithoutDescription = await prisma.product.count({
      where: {
        OR: [
          { description: null },
          { description: '' }
        ]
      }
    });

    // Since metaTitle and metaDescription don't exist, we'll check for other SEO-related fields
    const productsWithoutName = await prisma.product.count({
      where: {
        OR: [
          { name: null },
          { name: '' }
        ]
      }
    });

    const productsWithoutCategory = await prisma.product.count({
      where: {
        OR: [
          { category: null },
          { category: '' }
        ]
      }
    });

    // Get galleries with missing SEO data (checking for title instead of description)
    const galleriesWithoutTitle = await prisma.gallery.count({
      where: {
        OR: [
          { title: null },
          { title: '' }
        ]
      }
    });

    // Get recent content activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentProducts = await prisma.product.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    const recentGalleries = await prisma.gallery.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    const recentTestimonials = await prisma.testimonial.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Calculate SEO scores
    const totalContentItems = totalProducts + totalGalleries + totalTestimonials + totalFaqs;
    const missingSeoItems = productsWithoutDescription + productsWithoutName + 
                           productsWithoutCategory + galleriesWithoutTitle;
    
    const seoScore = totalContentItems > 0 
      ? Math.round(((totalContentItems - missingSeoItems) / totalContentItems) * 100)
      : 100;

    // Content freshness score
    const recentContent = recentProducts + recentGalleries + recentTestimonials;
    const freshnessScore = totalContentItems > 0 
      ? Math.round((recentContent / totalContentItems) * 100)
      : 0;

    // Get category distribution for keyword analysis
    const categoryStats = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });

    // Calculate recommendations
    const recommendations = [];
    
    if (productsWithoutDescription > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Missing Product Descriptions',
        description: `${productsWithoutDescription} products are missing descriptions`,
        action: 'Add descriptions to improve SEO and user experience'
      });
    }

    if (productsWithoutName > 0) {
      recommendations.push({
        type: 'error',
        title: 'Missing Product Names',
        description: `${productsWithoutName} products are missing names`,
        action: 'Add product names for better search engine visibility'
      });
    }

    if (productsWithoutCategory > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Missing Product Categories',
        description: `${productsWithoutCategory} products are missing categories`,
        action: 'Add categories to improve product organization and SEO'
      });
    }

    if (galleriesWithoutTitle > 0) {
      recommendations.push({
        type: 'info',
        title: 'Gallery Titles',
        description: `${galleriesWithoutTitle} galleries are missing titles`,
        action: 'Add titles to galleries for better SEO'
      });
    }

    if (freshnessScore < 30) {
      recommendations.push({
        type: 'info',
        title: 'Content Freshness',
        description: 'Consider adding more recent content',
        action: 'Regular content updates help maintain SEO rankings'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'Great SEO Foundation',
        description: 'Your content has good SEO coverage',
        action: 'Keep up the good work!'
      });
    }

    res.json({
      success: true,
      data: {
        overview: {
          seoScore,
          freshnessScore,
          totalContentItems,
          missingSeoItems
        },
        content: {
          products: {
            total: totalProducts,
            active: activeProducts,
            recent: recentProducts
          },
          galleries: {
            total: totalGalleries,
            active: activeGalleries,
            recent: recentGalleries
          },
          testimonials: {
            total: totalTestimonials,
            active: activeTestimonials,
            recent: recentTestimonials
          },
          faqs: {
            total: totalFaqs,
            active: activeFaqs
          }
        },
        seoIssues: {
          productsWithoutDescription,
          productsWithoutName,
          productsWithoutCategory,
          galleriesWithoutTitle
        },
        categories: categoryStats.map(cat => ({
          name: cat.category,
          count: cat._count.category
        })),
        recommendations
      },
      message: 'SEO report generated successfully'
    });
  } catch (error) {
    console.error('Error generating SEO report:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate SEO report'
    });
  }
};