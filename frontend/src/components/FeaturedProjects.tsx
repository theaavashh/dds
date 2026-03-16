import { cache } from 'react';
import AnimatedCollectionImage from './AnimatedCollectionImage';

interface CatalogItem {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

interface CatalogApiResponse {
  success: boolean;
  data?: CatalogItem[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const FALLBACK_COLLECTION = {
  id: '1',
  title: 'Premium Diamond Collection',
  description: 'A curated selection of exquisite diamond pieces, crafted with precision and perfected through years of collaboration with discerning clients and master artisans.',
  images: [
    { url: '/ladies-ring-collection.jpg', title: 'Diamond Ring Collection', alt: 'Elegant diamond rings collection featuring premium handcrafted designs' },
    { url: '/necklace-collection.jpg', title: 'Diamond Necklace Collection', alt: 'Luxury diamond necklaces with intricate craftsmanship' },
    { url: '/earring-collection.jpg', title: 'Diamond Earring Collection', alt: 'Sparkling diamond earrings collection' },
    { url: '/pendant-collection.jpg', title: 'Diamond Pendant Collection', alt: 'Exquisite diamond pendants and jewelry pieces' }
  ]
};

const resolveImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('/') || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

// Server-side data fetching with caching
export const getFeaturedCollections = cache(async (): Promise<CatalogItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/catalog`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`Catalog API error: ${response.status}`);
      return [];
    }

    const data: CatalogApiResponse = await response.json();

    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      return data.data.filter(item => item.isActive).sort((a, b) => a.position - b.position);
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch catalog items:', error);
    return [];
  }
});

interface FeaturedProjectsProps {
  collections?: CatalogItem[];
}

export default async function FeaturedProjects({ collections }: FeaturedProjectsProps = {}) {
  // Fetch on server if not provided
  const catalogItems = collections ?? await getFeaturedCollections();

  // Use first active item or fallback
  const firstItem = catalogItems[0];

  // Prepare collection data
  const collection = firstItem ? {
    title: firstItem.title || FALLBACK_COLLECTION.title,
    description: firstItem.description || FALLBACK_COLLECTION.description,
    images: [
      {
        url: resolveImageUrl(firstItem.image1Url) || FALLBACK_COLLECTION.images[0].url,
        title: firstItem.image1Title || FALLBACK_COLLECTION.images[0].title,
        alt: `${firstItem.image1Title || 'Diamond'} collection - Premium handcrafted jewelry by Celebration Diamonds Studio`
      },
      {
        url: resolveImageUrl(firstItem.image2Url) || FALLBACK_COLLECTION.images[1].url,
        title: firstItem.image2Title || FALLBACK_COLLECTION.images[1].title,
        alt: `${firstItem.image2Title || 'Diamond'} collection - Luxury diamond jewelry`
      },
      {
        url: resolveImageUrl(firstItem.image3Url) || FALLBACK_COLLECTION.images[2].url,
        title: firstItem.image3Title || FALLBACK_COLLECTION.images[2].title,
        alt: `${firstItem.image3Title || 'Diamond'} collection - Exquisite designs`
      },
      {
        url: resolveImageUrl(firstItem.image4Url) || FALLBACK_COLLECTION.images[3].url,
        title: firstItem.image4Title || FALLBACK_COLLECTION.images[3].title,
        alt: `${firstItem.image4Title || 'Diamond'} collection - Master craftsmanship`
      }
    ]
  } : FALLBACK_COLLECTION;

  // Structured data for collections
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.description,
    url: `${API_BASE_URL}/collections`,
    image: collection.images.map(img => ({
      '@type': 'ImageObject',
      url: img.url.startsWith('http') ? img.url : `${API_BASE_URL}${img.url}`,
      name: img.title,
      description: img.alt
    })),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: collection.images.map((img, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: img.title,
          image: img.url.startsWith('http') ? img.url : `${API_BASE_URL}${img.url}`,
          description: img.alt
        }
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <section
        className="py-10 md:py-12 overflow-hidden bg-white"
        aria-labelledby="collection-heading"
      >
        <div className="w-full mx-auto px-1 sm:px-6 lg:px-6 max-w-7xl">
          {/* SEO-optimized heading - visually available */}
          <header className="sr-only">
            <h2 id="collection-heading">{collection.title}</h2>
            <p>{collection.description}</p>
          </header>

          {/* Main 2-column grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-12 items-stretch">
            {/* LEFT COLUMN */}
            <div className="flex flex-col h-full">
              {/* Left Image 1 */}
              <AnimatedCollectionImage
                src={collection.images[0].url}
                alt={collection.images[0].alt}
                title={collection.images[0].title}
                priority
                delay={0}
                sizes="(max-width: 768px) 100vw, 50vw"
                minHeight="clamp(350px, 45vw, 650px)"
              />

              {/* Mobile-only text section */}
              <div className="md:hidden flex flex-col justify-center pt-12 pb-8 px-2 md:px-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg md:text-xl text-[#DFC97E]" aria-hidden="true">✦</span>
                  <h3 className="text-3xl sm:text-3xl md:text-5xl font-semibold text-[#DFC97E] tracking-tight tan-agean">
                    Our Collection
                  </h3>
                </div>
                <p className="text-lg md:text-lg text-justify text-gray-800 leading-relaxed max-w-5xl">
                  {collection.description}
                </p>
              </div>

              {/* Left Image 2 */}
              <AnimatedCollectionImage
                src={collection.images[1].url}
                alt={collection.images[1].alt}
                title={collection.images[1].title}
                delay={0.2}
                sizes="(max-width: 768px) 100vw, 50vw"
                minHeight="clamp(150px, 85vw, 350px)"
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-3 md:gap-2 h-full">
              {/* Text Section - Desktop only */}
              <div className="hidden md:flex flex-col justify-center py-6 md:py-8 lg:py-12 px-2 md:px-4">
                <div className="flex items-center gap-4 mb-3 md:mb-6">
                  <span className="text-lg md:text-xl text-amber-600" aria-hidden="true">✦</span>
                  <h3 className="text-2xl sm:text-3xl md:text-3xl text-gray-900 tracking-tight font-semibold tan-agean">
                    Our Collection
                  </h3>
                </div>
                <p className="text-sm sm:text-base md:text-xl text-gray-600 leading-relaxed max-w-5xl">
                  {collection.description}
                </p>
              </div>

              {/* Right Image 1 */}
              <AnimatedCollectionImage
                src={collection.images[2].url}
                alt={collection.images[2].alt}
                title={collection.images[2].title}
                delay={0.1}
                sizes="(max-width: 768px) 100vw, 50vw"
                minHeight="clamp(350px, 45vw, 750px)"
              />

              {/* Right Image 2 */}
              <AnimatedCollectionImage
                src={collection.images[3].url}
                alt={collection.images[3].alt}
                title={collection.images[3].title}
                delay={0.3}
                sizes="(max-width: 768px) 100vw, 50vw"
                minHeight="clamp(350px, 45vw, 1200px)"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
