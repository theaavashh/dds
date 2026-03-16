import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ProductDetailClient from '@/components/ProductDetailClient';
import { Product, ProductResponse } from '@/types/product';

interface PageProps {
  params: Promise<{ category: string; productId: string }>;
}

// Server-side data fetching with caching
const getProduct = cache(async (productId: string): Promise<Product | null> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const apiKey = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || 'frontend_secure_key_2024_change_me';
    
    const response = await fetch(`${apiUrl}/api/products/${productId}`, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': apiKey,
      },
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    const data: ProductResponse = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
});

// Generate metadata for SEO
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { productId, category } = await params;
  const product = await getProduct(productId);
  
  if (!product) {
    return {
      title: 'Product Not Found | Celebration Diamonds',
      description: 'The requested product could not be found.',
      robots: 'noindex, nofollow'
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://celebration-diamonds.com';
  const productUrl = `${baseUrl}/jewelry/${category}/${productId}`;
  
  // Use SEO fields from product or fallbacks
  const title = product.seoTitle || `${product.name} | ${product.category} | Celebration Diamonds`;
  const description = product.seoDescription || 
    product.metaDescription || 
    product.description?.substring(0, 160) || 
    `Shop ${product.name} - Premium diamond jewelry from Celebration Diamonds. ${product.goldPurity} ${product.goldType || ''} with ${product.diamondCaratWeight || ''}ct diamonds.`;
  
  const imageUrl = product.ogImage || 
    product.images?.[0]?.url || 
    product.imageUrl || 
    '/placeholder-product.jpg';
  
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
  
  return {
    title,
    description,
    keywords: product.seoKeywords || `${product.name}, ${product.category}, diamond jewelry, ${product.subCategory || ''}, luxury jewelry`,
    robots: product.robotsMeta || 'index, follow',
    alternates: {
      canonical: product.canonicalUrl || productUrl,
    },
    openGraph: {
      title: product.ogTitle || title,
      description: product.ogDescription || description,
      images: [{
        url: fullImageUrl,
        width: 1200,
        height: 630,
        alt: product.imageAltText || product.name
      }],
      url: product.canonicalUrl || productUrl,
      type: 'website',
      siteName: 'Celebration Diamonds',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.twitterTitle || title,
      description: product.twitterDescription || description,
      images: [product.twitterImage || fullImageUrl],
      site: '@celebrationdiamonds',
    },
  };
}

// Generate structured data for the product
function generateProductSchema(product: Product, category: string) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://celebration-diamonds.com';
  const imageUrl = product.images?.[0]?.url || product.imageUrl || '/placeholder-product.jpg';
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map(img => 
      img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`
    ) || [fullImageUrl],
    description: product.fullDescription || product.description,
    sku: product.productCode,
    brand: {
      '@type': 'Brand',
      name: 'Celebration Diamonds'
    },
    category: `${category} > ${product.subCategory || 'General'}`,
    material: product.metalType || `${product.goldPurity} ${product.goldType || 'Gold'}`,
    weight: {
      '@type': 'QuantitativeValue',
      value: product.grossWeight || product.goldWeight,
      unitCode: 'GRM'
    },
    offers: product.price > 0 ? {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/jewelry/${category}/${product.id}`,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    } : undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '124'
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Gold Purity',
        value: product.goldPurity
      },
      {
        '@type': 'PropertyValue',
        name: 'Gold Weight',
        value: product.goldWeight
      },
      {
        '@type': 'PropertyValue',
        name: 'Diamond Carat Weight',
        value: product.diamondCaratWeight
      },
      {
        '@type': 'PropertyValue',
        name: 'Diamond Quantity',
        value: product.diamondQuantity?.toString()
      }
    ].filter(prop => prop.value)
  };
}

// Generate breadcrumb structured data
function generateBreadcrumbSchema(product: Product, category: string) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://celebration-diamonds.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Jewelry',
        item: `${baseUrl}/jewelry`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        item: `${baseUrl}/jewelry/${category}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `${baseUrl}/jewelry/${category}/${product.id}`
      }
    ]
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { productId, category } = await params;
  
  // Fetch product data on server
  const product = await getProduct(productId);
  
  // Handle 404
  if (!product) {
    notFound();
  }
  
  // Generate structured data
  const productSchema = generateProductSchema(product, category);
  const breadcrumbSchema = generateBreadcrumbSchema(product, category);
  
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Pass server-fetched data to client component */}
      <ProductDetailClient 
        initialProduct={product} 
        category={category}
      />
    </>
  );
}
