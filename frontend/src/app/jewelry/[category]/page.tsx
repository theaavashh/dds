import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGridClient from '@/components/ProductGridClient';
import { Product, ProductsResponse, CategoryHero } from '@/types/product';

// Valid categories
const VALID_CATEGORIES = [
  'earring', 'earrings',
  'necklace', 'necklaces', 
  'ring', 'rings',
  'bracelet', 'bracelets',
  'men-bracelet', 'mens-bracelet',
  'ladies-bracelet', 'ladies-bracelets',
  'pendant', 'pendents'
];

// Generate metadata for SEO
export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params;
  const normalizedCategory = decodeURIComponent(category).toLowerCase().replace(/-/g, ' ');
  const capitalizedCategory = normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1);
  
  const categoryData = getCategoryHero(category);
  
  return {
    title: `${capitalizedCategory} Collection | Premium Diamond Jewelry | Celebration Diamonds`,
    description: `Explore our exclusive ${capitalizedCategory} collection featuring handcrafted diamond jewelry. Premium quality, unique designs, and master craftsmanship. Shop now!`,
    keywords: `${capitalizedCategory}, diamond jewelry, luxury ${capitalizedCategory}, handcrafted jewelry, premium diamonds, Celebration Diamonds`,
    openGraph: {
      title: `${capitalizedCategory} Collection | Celebration Diamonds`,
      description: `Discover exquisite ${capitalizedCategory} crafted with precision and care.`,
      type: 'website',
      images: [
        {
          url: categoryData.image,
          width: 1200,
          height: 630,
          alt: `${capitalizedCategory} Collection`,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${capitalizedCategory} Collection | Celebration Diamonds`,
      description: `Discover exquisite ${capitalizedCategory} crafted with precision and care.`,
      images: [categoryData.image],
    },
    alternates: {
      canonical: `/jewelry/${category}`,
    },
  };
}

// Server-side data fetching with caching
const getCategoryProducts = cache(async (
  category: string, 
  page: number = 1, 
  limit: number = 24
): Promise<ProductsResponse> => {
  const normalizedCategory = category.toLowerCase();
  
  // Handle special cases
  let apiCategory = normalizedCategory;
  if (normalizedCategory === 'pendant') {
    apiCategory = 'pendent';
  }
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const apiKey = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || 'frontend_secure_key_2024_change_me';
    
    const queryParams = new URLSearchParams({
      category: encodeURIComponent(apiCategory),
      page: page.toString(),
      limit: limit.toString(),
      auth: 'false', // Will be updated client-side for authenticated features
    });

    const response = await fetch(`${apiUrl}/api/products?${queryParams.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': apiKey,
      },
      next: { revalidate: 60 } // Revalidate every minute for fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      data: [],
      total: 0,
      pagination: { page: 1, limit, total: 0, pages: 0 }
    };
  }
});

// Get hero content based on category
function getCategoryHero(category: string): CategoryHero {
  const normalized = category.toLowerCase();
  
  switch (normalized) {
    case 'earring':
    case 'earrings':
      return {
        title: 'Diamond Earrings Collection',
        subtitle: 'Graceful accessories for every occasion',
        image: '/earring-large.jpeg',
        mobileImage: '/earring-small.jpeg'
      };
    case 'necklace':
    case 'necklaces':
      return {
        title: 'Diamond Necklace Collection',
        subtitle: 'Elegant pieces that capture the light',
        image: '/necklace-large.jpeg',
        mobileImage: '/necklace-small.jpeg'
      };
    case 'ring':
    case 'rings':
      return {
        title: 'Exquisite Diamond Rings',
        subtitle: 'Symbolize your eternal love',
        image: '/ladies-ring-collection.jpg',
        mobileImage: '/ladies-ring-collection.jpg'
      };
    case 'bracelet':
    case 'bracelets':
      return {
        title: 'Elegant Diamond Bracelets',
        subtitle: 'Wrap your wrist in luxury',
        image: '/ladies-bracelet-main.jpeg',
        mobileImage: '/ladies-bracelet-small.jpeg'
      };
    case 'men-bracelet':
    case 'mens-bracelet':
      return {
        title: 'Mens Diamond Bracelets',
        subtitle: 'Sophisticated wristwear for the modern man',
        image: '/menbracelet.jpg',
        mobileImage: '/menbracelet.jpg'
      };
    case 'ladies-bracelet':
    case 'ladies-bracelets':
      return {
        title: 'Ladies Diamond Bracelets',
        subtitle: 'Graceful accessories for every occasion',
        image: '/ladiesbracelet.jpg',
        mobileImage: '/ladiesbracelet.jpg'
      };
    case 'pendant':
    case 'pendents':
      return {
        title: 'Diamond Pendant Collection',
        subtitle: 'Timeless elegance around your neck',
        image: '/pendant-main-large.jpeg',
        mobileImage: '/pendant-category.jpeg'
      };
    default:
      return {
        title: 'Premium Diamond Jewelry',
        subtitle: 'Discover our exclusive collection',
        image: '/main-header-banner.jpeg',
        mobileImage: '/new-banner.png'
      };
  }
}

// Generate structured data for SEO
function generateStructuredData(category: string, products: Product[], hero: CategoryHero) {
  const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${normalizedCategory} Collection`,
    description: hero.subtitle,
    url: `${process.env.NEXT_PUBLIC_API_URL}/jewelry/${category}`,
    image: hero.image,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          image: product.images[0]?.url || product.imageUrl,
          description: product.description,
          sku: product.productCode,
          category: product.category,
          offers: product.price > 0 ? {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
          } : undefined
        }
      }))
    }
  };
}

// Validate category
function isValidCategory(category: string): boolean {
  return VALID_CATEGORIES.includes(category.toLowerCase());
}

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const searchParamsResolved = await searchParams;
  
  // Validate category
  if (!isValidCategory(category)) {
    notFound();
  }
  
  // Get page from search params (default to 1)
  const page = typeof searchParamsResolved.page === 'string' 
    ? parseInt(searchParamsResolved.page, 10) 
    : 1;
  
  // Fetch data on server
  const productsData = await getCategoryProducts(category, page, 24);
  const heroContent = getCategoryHero(category);
  const normalizedCategory = decodeURIComponent(category).toUpperCase();
  
  // Generate structured data
  const structuredData = generateStructuredData(category, productsData.data || [], heroContent);
  
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Section */}
        <section 
          className="relative h-[60vh] w-full bg-gray-200"
          aria-labelledby="category-title"
        >
          <h1 id="category-title" className="sr-only">
            {heroContent.title} - {heroContent.subtitle}
          </h1>
          
          {/* Mobile Image */}
          <Image
            src={heroContent.mobileImage || heroContent.image}
            alt={`${heroContent.title} - Mobile View`}
            fill
            className="object-cover object-top lg:hidden"
            priority
            sizes="100vw"
            quality={90}
          />
          
          {/* Desktop Image */}
          <Image
            src={heroContent.image}
            alt={heroContent.title}
            fill
            className="object-cover object-top hidden lg:block"
            priority
            sizes="100vw"
            quality={90}
          />
        </section>
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="pt-8 text-left px-4 sm:px-6 lg:px-8 ml-12">
          <ol className="flex items-center text-xl font-semibold text-gray-600 uppercase">
            <li>
              <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
            </li>
            <li className="mx-2">/</li>
            <li className="text-gray-900" aria-current="page">
              {normalizedCategory} ({productsData.total || 0})
            </li>
          </ol>
        </nav>
        
        {/* Main Content */}
        <section className="px-4 sm:px-6 py-8 mr-12" aria-label="Product collection">
          <ProductGridClient
            products={productsData.data || []}
            category={category}
            totalProducts={productsData.total || 0}
            currentPage={productsData.pagination?.page || 1}
            totalPages={productsData.pagination?.pages || 1}
            isAuthenticated={false} // Will be determined client-side
          />
        </section>
        
        <Footer />
      </main>
    </>
  );
}
