import Image from 'next/image';
import { cache } from 'react';

interface HeroSection {
  id: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  alt?: string;
  title?: string;
  subtitle?: string;
}

interface HeroApiResponse {
  success: boolean;
  data?: HeroSection[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const FALLBACK_IMAGES = {
  desktop: '/main-header-banner.jpeg',
  mobile: '/new-banner.png'
} as const;

const getFullImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

// Cached fetch for server-side data fetching
export const getHeroData = cache(async (): Promise<HeroSection | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hero-section`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      return null;
    }

    const data: HeroApiResponse = await response.json();

    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      return data.data.find(h => h.isActive) ?? data.data[0];
    }

    return null;
  } catch (error) {
    return null;
  }
});

interface HeroProps {
  heroData: HeroSection | null;
}

export default function Hero({ heroData }: HeroProps) {
  const desktopImage = heroData?.desktopImageUrl
    ? getFullImageUrl(heroData.desktopImageUrl)
    : FALLBACK_IMAGES.desktop;

  const mobileImage = heroData?.mobileImageUrl
    ? getFullImageUrl(heroData.mobileImageUrl)
    : FALLBACK_IMAGES.mobile;

  const altText = heroData?.alt ?? 'Premium diamond jewelry showcasing craftsmanship and elegance';
  const title = heroData?.title ?? 'Celebration Diamonds Studio';
  const subtitle = heroData?.subtitle ?? 'Crafting the Future of Fine Diamonds';

  // Generate structured data for SEO
  const imageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: desktopImage.startsWith('http') ? desktopImage : `${API_BASE_URL}${desktopImage}`,
    name: title,
    description: altText,
    width: 2400,
    height: 1350
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchema) }}
      />
      <section
        className="relative w-full bg-black overflow-hidden h-[100svh]"
        aria-label="Hero banner - Premium diamond jewelry"
        role="banner"
      >
        {/* SEO-optimized H1 - visually hidden but accessible */}
        <h1 className="sr-only">
          {title} - {subtitle}. Premium handcrafted diamond jewelry, custom designs, and luxury engagement rings.
        </h1>

        {/* Desktop Image */}
        <div className="hidden lg:block absolute inset-0">
          <Image
            src={desktopImage}
            alt={altText}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
            quality={90}
            unoptimized={desktopImage.startsWith('http')}
          />
        </div>

        {/* Mobile Image */}
        <div className="block lg:hidden absolute inset-0">
          <Image
            src={mobileImage}
            alt={altText}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={90}
            unoptimized={mobileImage.startsWith('http')}
          />
        </div>

        {/* Optional overlay content for SEO and UX */}
        {(heroData?.title || heroData?.subtitle) && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="text-center text-white px-4">
              {heroData.title && (
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-lg">
                  {heroData.title}
                </h2>
              )}
              {heroData.subtitle && (
                <p className="text-xl md:text-2xl lg:text-3xl drop-shadow-md">
                  {heroData.subtitle}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
