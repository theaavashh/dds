import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Manual sitemap generation utility
export async function generateManualSitemap() {
  try {
    console.log('🚀 Generating manual sitemap...');
    
    // Get all active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        productCode: true,
        name: true,
        category: true,
        subCategory: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get all active categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const baseUrl = process.env.FRONTEND_URL || 'https://celebrationdiamonds.com';
    const currentDate = new Date().toISOString();
    
    // Create sitemap entries
    const sitemapEntries = [];
    
    // Add homepage
    sitemapEntries.push({
      loc: baseUrl,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '1.0',
    });

    // Add category pages
    categories.forEach((category) => {
      sitemapEntries.push({
        loc: `${baseUrl}/jewelry/${category.title.toLowerCase()}`,
        lastmod: category.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: '0.8',
      });
    });

    // Add product pages
    products.forEach((product) => {
      sitemapEntries.push({
        loc: `${baseUrl}/jewelry/${product.category.toLowerCase()}/${product.id}`,
        lastmod: product.updatedAt.toISOString(),
        changefreq: 'monthly',
        priority: '0.6',
      });
    });

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    console.log('✅ Manual sitemap generated successfully!');
    console.log(`📊 Generated ${sitemapEntries.length} sitemap entries`);
    
    return sitemap;
  } catch (error) {
    console.error('❌ Error generating manual sitemap:', error);
    throw error;
  }
}

// Manual robots.txt generation
export async function generateManualRobots() {
  const baseUrl = process.env.FRONTEND_URL || 'https://celebrationdiamonds.com';
  
  const robotsContent = `# Celebration Diamonds Studio - SEO Configuration
# Generated: ${new Date().toISOString()}

User-agent: *
Allow: /
Allow: /jewelry/
Allow: /products/
Allow: /categories/

# Disallow admin and private areas
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /node_modules/
Disallow: /.env
Disallow: /.git
Disallow: /sitemap.xml

# Allow static assets
Allow: /uploads/
Allow: /images/
Allow: /_next/static/
Allow: /css/
Allow: /js/

# Specific search engine instructions
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Disallow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1`;

  console.log('🤖 Manual robots.txt generated successfully!');
    
  return robotsContent;
}

// Generate both sitemap and robots
export async function generateSEOFiles() {
  try {
    const sitemap = await generateManualSitemap();
    const robots = await generateManualRobots();
    
    console.log('🚀 SEO files generation complete!');
    
    return {
      sitemap,
      robots,
    };
  } catch (error) {
    console.error('❌ Error generating SEO files:', error);
    throw error;
  }
}