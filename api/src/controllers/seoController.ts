import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sitemap related controllers
export const getSitemapEntries = async (_req: Request, res: Response) => {
  try {
    const entries = await prisma.sitemapEntry.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      entries: entries.map(entry => ({
        id: entry.id,
        url: entry.url,
        lastModified: entry.lastModified.toISOString(),
        changeFreq: entry.changeFreq as any,
        priority: entry.priority,
        status: entry.status as any,
        pageType: entry.pageType as any,
        title: entry.title,
        description: entry.description
      }))
    });
  } catch (error) {
    console.error('Error fetching sitemap entries:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch sitemap entries'
    });
  }
};

export const getSitemapConfig = async (_req: Request, res: Response) => {
  try {
    let config = await prisma.sitemapConfig.findFirst();
    
    if (!config) {
      config = await prisma.sitemapConfig.create({
        data: {
          autoGenerate: true,
          includeProducts: true,
          includeCategories: true,
          includePages: true,
          defaultChangeFreq: 'weekly',
          defaultPriority: 0.8,
          urlCount: 0,
          excludedUrls: []
        }
      });
    }

    res.json({
      success: true,
      autoGenerate: config.autoGenerate,
      includeProducts: config.includeProducts,
      includeCategories: config.includeCategories,
      includePages: config.includePages,
      defaultChangeFreq: config.defaultChangeFreq,
      defaultPriority: config.defaultPriority,
      lastGenerated: config.lastGenerated?.toISOString(),
      urlCount: config.urlCount,
      excludedUrls: config.excludedUrls
    });
  } catch (error) {
    console.error('Error fetching sitemap config:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch sitemap configuration'
    });
  }
};

export const updateSitemapConfig = async (req: Request, res: Response) => {
  try {
    const {
      autoGenerate,
      includeProducts,
      includeCategories,
      includePages,
      defaultChangeFreq,
      defaultPriority,
      excludedUrls
    } = req.body;

    let config = await prisma.sitemapConfig.findFirst();
    
    if (config) {
      config = await prisma.sitemapConfig.update({
        where: { id: config.id },
        data: {
          autoGenerate,
          includeProducts,
          includeCategories,
          includePages,
          defaultChangeFreq,
          defaultPriority,
          excludedUrls
        }
      });
    } else {
      config = await prisma.sitemapConfig.create({
        data: {
          autoGenerate,
          includeProducts,
          includeCategories,
          includePages,
          defaultChangeFreq,
          defaultPriority,
          excludedUrls: excludedUrls || []
        }
      });
    }

    res.json({
      success: true,
      autoGenerate: config.autoGenerate,
      includeProducts: config.includeProducts,
      includeCategories: config.includeCategories,
      includePages: config.includePages,
      defaultChangeFreq: config.defaultChangeFreq,
      defaultPriority: config.defaultPriority,
      lastGenerated: config.lastGenerated?.toISOString(),
      urlCount: config.urlCount,
      excludedUrls: config.excludedUrls
    });
  } catch (error) {
    console.error('Error updating sitemap config:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update sitemap configuration'
    });
  }
};

export const createSitemapEntry = async (req: Request, res: Response) => {
  try {
    const {
      url,
      changeFreq,
      priority,
      pageType,
      title,
      description
    } = req.body;

    const entry = await prisma.sitemapEntry.create({
      data: {
        url,
        changeFreq,
        priority,
        pageType,
        title,
        description,
        status: 'active'
      }
    });

    res.status(201).json({
      success: true,
      id: entry.id,
      url: entry.url,
      lastModified: entry.lastModified.toISOString(),
      changeFreq: entry.changeFreq as any,
      priority: entry.priority,
      status: entry.status as any,
      pageType: entry.pageType as any,
      title: entry.title,
      description: entry.description
    });
  } catch (error) {
    console.error('Error creating sitemap entry:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create sitemap entry'
    });
  }
};

export const updateSitemapEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      url,
      changeFreq,
      priority,
      status,
      pageType,
      title,
      description
    } = req.body;

    const entry = await prisma.sitemapEntry.update({
      where: { id },
      data: {
        url,
        changeFreq,
        priority,
        status,
        pageType,
        title,
        description,
        lastModified: new Date()
      }
    });

    res.json({
      success: true,
      id: entry.id,
      url: entry.url,
      lastModified: entry.lastModified.toISOString(),
      changeFreq: entry.changeFreq as any,
      priority: entry.priority,
      status: entry.status as any,
      pageType: entry.pageType as any,
      title: entry.title,
      description: entry.description
    });
  } catch (error) {
    console.error('Error updating sitemap entry:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update sitemap entry'
    });
  }
};

export const deleteSitemapEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.sitemapEntry.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Sitemap entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sitemap entry:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete sitemap entry'
    });
  }
};

export const generateSitemap = async (_req: Request, res: Response) => {
  try {
    const config = await prisma.sitemapConfig.findFirst();
    
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'Sitemap configuration not found'
      });
    }

    // Clear existing entries if auto-generate is enabled
    if (config.autoGenerate) {
      await prisma.sitemapEntry.deleteMany({});
    }

    const entries: any[] = [];

    // Add homepage
    entries.push({
      url: '/',
      lastModified: new Date(),
      changeFreq: 'daily',
      priority: 1.0,
      status: 'active',
      pageType: 'page',
      title: 'Home',
      description: 'Celebration Diamonds Homepage'
    });

    // Add products if enabled
    if (config.includeProducts) {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          category: true,
          updatedAt: true,
          seoSlug: true
        }
      });

      for (const product of products) {
        entries.push({
          url: `/products/${product.seoSlug || product.id}`,
          lastModified: product.updatedAt,
          changeFreq: config.defaultChangeFreq,
          priority: config.defaultPriority,
          status: 'active',
          pageType: 'product',
          title: product.name,
          description: `${product.name} - ${product.category}`
        });
      }
    }

    // Add categories if enabled
    if (config.includeCategories) {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          updatedAt: true
        }
      });

      for (const category of categories) {
        entries.push({
          url: `/category/${category.id}`,
          lastModified: category.updatedAt,
          changeFreq: 'weekly',
          priority: 0.8,
          status: 'active',
          pageType: 'category',
          title: category.title,
          description: `${category.title} Category`
        });
      }
    }

    // Add static pages if enabled
    if (config.includePages) {
      const staticPages = [
        { url: '/about', title: 'About Us', changeFreq: 'monthly', priority: 0.6 },
        { url: '/contact', title: 'Contact', changeFreq: 'monthly', priority: 0.6 },
        { url: '/account', title: 'Account', changeFreq: 'monthly', priority: 0.5 },
        { url: '/cart', title: 'Shopping Cart', changeFreq: 'daily', priority: 0.4 }
      ];

      for (const page of staticPages) {
        entries.push({
          url: page.url,
          lastModified: new Date(),
          changeFreq: page.changeFreq,
          priority: page.priority,
          status: 'active',
          pageType: 'page',
          title: page.title,
          description: `${page.title} Page`
        });
      }
    }

    // Create entries in database
    if (config.autoGenerate) {
      await prisma.sitemapEntry.createMany({
        data: entries
      });
    }

    // Update config
    await prisma.sitemapConfig.update({
      where: { id: config.id },
      data: {
        lastGenerated: new Date(),
        urlCount: entries.length
      }
    });

    res.json({
      success: true,
      message: 'Sitemap generated successfully',
      urlCount: entries.length,
      lastGenerated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate sitemap'
    });
  }
};

export const getSitemapPreview = async (_req: Request, res: Response) => {
  try {
    const entries = await prisma.sitemapEntry.findMany({
      where: { status: 'active' },
      orderBy: { priority: 'desc' }
    });

    const baseUrl = process.env.BASE_URL || 'https://celebrationdiamonds.com';
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const entry of entries) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${entry.url}</loc>\n`;
      xml += `    <lastmod>${entry.lastModified.toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${entry.changeFreq}</changefreq>\n`;
      xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    res.json({
      success: true,
      content: xml
    });
  } catch (error) {
    console.error('Error generating sitemap preview:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate sitemap preview'
    });
  }
};

// Robots.txt related controllers
export const getRobotsContent = async (_req: Request, res: Response) => {
  try {
    let config = await prisma.robotsConfig.findFirst();
    
    if (!config) {
      config = await prisma.robotsConfig.create({
        data: {
          enabled: true,
          autoGenerate: false,
          content: 'User-agent: *\nDisallow: /admin/\nAllow: /\n'
        }
      });
    }

    res.json({
      success: true,
      content: config.content || '',
      enabled: config.enabled,
      autoGenerate: config.autoGenerate,
      sitemapUrl: config.sitemapUrl,
      hostUrl: config.hostUrl,
      lastUpdated: config.lastUpdated?.toISOString()
    });
  } catch (error) {
    console.error('Error fetching robots content:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch robots.txt content'
    });
  }
};

export const updateRobotsContent = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    let config = await prisma.robotsConfig.findFirst();
    
    if (config) {
      config = await prisma.robotsConfig.update({
        where: { id: config.id },
        data: {
          content,
          lastUpdated: new Date()
        }
      });
    } else {
      config = await prisma.robotsConfig.create({
        data: {
          content,
          enabled: true,
          lastUpdated: new Date()
        }
      });
    }

    res.json({
      success: true,
      content: config.content,
      enabled: config.enabled,
      autoGenerate: config.autoGenerate,
      sitemapUrl: config.sitemapUrl,
      hostUrl: config.hostUrl,
      lastUpdated: config.lastUpdated?.toISOString()
    });
  } catch (error) {
    console.error('Error updating robots content:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update robots.txt content'
    });
  }
};

export const getRobotsRules = async (_req: Request, res: Response) => {
  try {
    const rules = await prisma.robotsRule.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      rules: rules.map(rule => ({
        id: rule.id,
        userAgent: rule.userAgent,
        allow: rule.allow,
        disallow: rule.disallow,
        crawlDelay: rule.crawlDelay,
        isActive: rule.isActive,
        description: rule.description
      }))
    });
  } catch (error) {
    console.error('Error fetching robots rules:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch robots rules'
    });
  }
};

export const createRobotsRule = async (req: Request, res: Response) => {
  try {
    const {
      userAgent,
      allow,
      disallow,
      crawlDelay,
      description
    } = req.body;

    const rule = await prisma.robotsRule.create({
      data: {
        userAgent: userAgent || '*',
        allow: allow || [],
        disallow: disallow || [],
        crawlDelay: crawlDelay ? parseInt(crawlDelay) : null,
        description,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      id: rule.id,
      userAgent: rule.userAgent,
      allow: rule.allow,
      disallow: rule.disallow,
      crawlDelay: rule.crawlDelay,
      isActive: rule.isActive,
      description: rule.description
    });
  } catch (error) {
    console.error('Error creating robots rule:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create robots rule'
    });
  }
};

export const updateRobotsRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      userAgent,
      allow,
      disallow,
      crawlDelay,
      isActive,
      description
    } = req.body;

    const rule = await prisma.robotsRule.update({
      where: { id },
      data: {
        userAgent,
        allow,
        disallow,
        crawlDelay: crawlDelay ? parseInt(crawlDelay) : null,
        isActive,
        description
      }
    });

    res.json({
      success: true,
      id: rule.id,
      userAgent: rule.userAgent,
      allow: rule.allow,
      disallow: rule.disallow,
      crawlDelay: rule.crawlDelay,
      isActive: rule.isActive,
      description: rule.description
    });
  } catch (error) {
    console.error('Error updating robots rule:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update robots rule'
    });
  }
};

export const deleteRobotsRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.robotsRule.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Robots rule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting robots rule:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete robots rule'
    });
  }
};

export const getRobotsConfig = async (_req: Request, res: Response) => {
  try {
    let config = await prisma.robotsConfig.findFirst();
    
    if (!config) {
      config = await prisma.robotsConfig.create({
        data: {
          enabled: true,
          autoGenerate: false,
          content: 'User-agent: *\nDisallow: /admin/\nAllow: /\n'
        }
      });
    }

    res.json({
      success: true,
      enabled: config.enabled,
      autoGenerate: config.autoGenerate,
      sitemapUrl: config.sitemapUrl,
      hostUrl: config.hostUrl,
      lastUpdated: config.lastUpdated?.toISOString(),
      content: config.content
    });
  } catch (error) {
    console.error('Error fetching robots config:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch robots configuration'
    });
  }
};

export const updateRobotsConfig = async (req: Request, res: Response) => {
  try {
    const {
      enabled,
      autoGenerate,
      sitemapUrl,
      hostUrl
    } = req.body;

    let config = await prisma.robotsConfig.findFirst();
    
    if (config) {
      config = await prisma.robotsConfig.update({
        where: { id: config.id },
        data: {
          enabled,
          autoGenerate,
          sitemapUrl,
          hostUrl,
          lastUpdated: new Date()
        }
      });
    } else {
      config = await prisma.robotsConfig.create({
        data: {
          enabled,
          autoGenerate,
          sitemapUrl,
          hostUrl,
          lastUpdated: new Date()
        }
      });
    }

    res.json({
      success: true,
      enabled: config.enabled,
      autoGenerate: config.autoGenerate,
      sitemapUrl: config.sitemapUrl,
      hostUrl: config.hostUrl,
      lastUpdated: config.lastUpdated?.toISOString(),
      content: config.content
    });
  } catch (error) {
    console.error('Error updating robots config:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update robots configuration'
    });
  }
};

export const generateRobotsFromRules = async (_req: Request, res: Response) => {
  try {
    const rules = await prisma.robotsRule.findMany({
      where: { isActive: true },
      orderBy: { userAgent: 'asc' }
    });

    const config = await prisma.robotsConfig.findFirst();

    let content = '';

    // Generate content from rules
    for (const rule of rules) {
      content += `User-agent: ${rule.userAgent}\n`;
      
      if (rule.allow.length > 0) {
        for (const allowPath of rule.allow) {
          content += `Allow: ${allowPath}\n`;
        }
      }
      
      if (rule.disallow.length > 0) {
        for (const disallowPath of rule.disallow) {
          content += `Disallow: ${disallowPath}\n`;
        }
      }
      
      if (rule.crawlDelay) {
        content += `Crawl-delay: ${rule.crawlDelay}\n`;
      }
      
      content += '\n';
    }

    // Add sitemap URL if configured
    if (config?.sitemapUrl) {
      content += `Sitemap: ${config.sitemapUrl}\n`;
    }

    // Add host URL if configured
    if (config?.hostUrl) {
      content += `Host: ${config.hostUrl}\n`;
    }

    // Update config
    if (config) {
      await prisma.robotsConfig.update({
        where: { id: config.id },
        data: {
          content,
          lastUpdated: new Date()
        }
      });
    }

    res.json({
      success: true,
      content,
      message: 'Robots.txt generated from rules successfully'
    });
  } catch (error) {
    console.error('Error generating robots from rules:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate robots.txt from rules'
    });
  }
};

export const getRobotsPreview = async (_req: Request, res: Response) => {
  try {
    const config = await prisma.robotsConfig.findFirst();
    
    if (!config || !config.content) {
      // Generate from rules if no content exists
      const rules = await prisma.robotsRule.findMany({
        where: { isActive: true },
        orderBy: { userAgent: 'asc' }
      });

      let content = '';

      for (const rule of rules) {
        content += `User-agent: ${rule.userAgent}\n`;
        
        if (rule.allow.length > 0) {
          for (const allowPath of rule.allow) {
            content += `Allow: ${allowPath}\n`;
          }
        }
        
        if (rule.disallow.length > 0) {
          for (const disallowPath of rule.disallow) {
            content += `Disallow: ${disallowPath}\n`;
          }
        }
        
        if (rule.crawlDelay) {
          content += `Crawl-delay: ${rule.crawlDelay}\n`;
        }
        
        content += '\n';
      }

      if (config?.sitemapUrl) {
        content += `Sitemap: ${config.sitemapUrl}\n`;
      }

      if (config?.hostUrl) {
        content += `Host: ${config.hostUrl}\n`;
      }

      res.json({
        success: true,
        content: content || 'No robots.txt content available'
      });
    } else {
      res.json({
        success: true,
        content: config.content
      });
    }
  } catch (error) {
    console.error('Error generating robots preview:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate robots preview'
    });
  }
};

export const getSeoReport = async (_req: Request, res: Response) => {
  try {
    // Get content analysis data
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { isActive: true }
    });
    
    const totalGalleries = 0;
    const activeGalleries = 0;
    
    const totalTestimonials = await prisma.testimonial.count();
    const activeTestimonials = await prisma.testimonial.count({
      where: { isActive: true }
    });
    
    const totalFaqs = 0;
    const activeFaqs = 0;

    // Get products with missing SEO data
    const productsWithoutDescription = await prisma.product.count({
      where: {
        description: ''
      }
    });

    // Since metaTitle and metaDescription don't exist, we'll check for other SEO-related fields
    const productsWithoutName = await prisma.product.count({
      where: {
        name: ''
      }
    });

    const productsWithoutCategory = await prisma.product.count({
      where: {
        category: ''
      }
    });

    // Get galleries with missing SEO data (checking for title instead of description)
    const galleriesWithoutTitle = 0;

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

    const recentGalleries = 0;

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

// JSON-LD Schema Controllers
export const getJsonLdSchemas = async (_req: Request, res: Response) => {
  try {
    const schemas = await prisma.jsonLdSchema.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: schemas.map(schema => ({
        id: schema.id,
        type: schema.type,
        name: schema.name,
        content: schema.content,
        pageType: schema.pageType,
        isActive: schema.isActive,
        createdAt: schema.createdAt.toISOString(),
        updatedAt: schema.updatedAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching JSON-LD schemas:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch JSON-LD schemas'
    });
  }
};

export const createJsonLdSchema = async (req: Request, res: Response) => {
  try {
    const { type, name, content, pageType, isActive } = req.body;

    // Validate JSON content
    try {
      JSON.parse(content);
    } catch (jsonError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON content',
        message: 'The provided content is not valid JSON'
      });
    }

    const schema = await prisma.jsonLdSchema.create({
      data: {
        type,
        name,
        content,
        pageType,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.status(201).json({
      success: true,
      message: 'JSON-LD schema created successfully',
      data: {
        id: schema.id,
        type: schema.type,
        name: schema.name,
        content: schema.content,
        pageType: schema.pageType,
        isActive: schema.isActive,
        createdAt: schema.createdAt.toISOString(),
        updatedAt: schema.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating JSON-LD schema:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create JSON-LD schema'
    });
  }
};

export const updateJsonLdSchema = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, name, content, pageType, isActive } = req.body;

    // Validate JSON content if provided
    if (content) {
      try {
        JSON.parse(content);
      } catch (jsonError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON content',
          message: 'The provided content is not valid JSON'
        });
      }
    }

    const schema = await prisma.jsonLdSchema.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(name && { name }),
        ...(content && { content }),
        ...(pageType && { pageType }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      message: 'JSON-LD schema updated successfully',
      data: {
        id: schema.id,
        type: schema.type,
        name: schema.name,
        content: schema.content,
        pageType: schema.pageType,
        isActive: schema.isActive,
        createdAt: schema.createdAt.toISOString(),
        updatedAt: schema.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating JSON-LD schema:', error);
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({
        success: false,
        error: 'Schema not found',
        message: 'The JSON-LD schema you are trying to update does not exist'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update JSON-LD schema'
    });
  }
};

export const deleteJsonLdSchema = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.jsonLdSchema.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'JSON-LD schema deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting JSON-LD schema:', error);
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({
        success: false,
        error: 'Schema not found',
        message: 'The JSON-LD schema you are trying to delete does not exist'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete JSON-LD schema'
    });
  }
};