'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

// Simple div component for server-side rendering
const StaticDiv = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: any }) => (
  <div className={className} style={style}>{children}</div>
);

interface ProjectImageProps {
  src: string;
  alt: string;
  y: any;
  className?: string;
}

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

/**
 * Reusable component for project images with parallax effect
 */
function ProjectImage({ src, alt, y, className = "" }: ProjectImageProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const MotionDiv = isClient ? motion.div : StaticDiv;
  
  // Clip-path reveal animation - only on client side
  const motionProps = isClient ? {
    initial: { clipPath: 'inset(100% 0 0 0)' },
    whileInView: { clipPath: 'inset(0 0 0 0)' },
    transition: {
      duration: 2,
      ease: [0.34, 1.56, 0.64, 1] as const,
    },
    viewport: { once: false }
  } : {};
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Clip-path Reveal Animation */}
      <MotionDiv
        {...(isClient ? motionProps : {})}
        className="relative w-full h-full"
      >
        {/* Parallax Image Wrapper */}
        <MotionDiv
          className="w-full h-[120%] -top-[10%] relative"
          style={{ y }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </MotionDiv>
      </MotionDiv>
    </div>
  );
}

interface FeaturedProjectsClientProps {
  catalogItems: CatalogItem[];
}

export default function FeaturedProjectsClient({ catalogItems }: FeaturedProjectsClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize scroll animations - hooks must be called unconditionally
  const scrollInfo = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const y1Base = useTransform(scrollInfo.scrollYProgress, [0, 1], ["-10%", "10%"]);
  const y2Base = useTransform(scrollInfo.scrollYProgress, [0, 1], ["-20%", "20%"]); 
  const y3Base = useTransform(scrollInfo.scrollYProgress, [0, 1], ["-15%", "15%"]);

  if (catalogItems.length === 0) {
    return null;
  }

  // Get images for display - handle both local and API-based image URLs
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const firstItem = catalogItems[0];
  
  // For local images (starting with /), use them as-is
  // For remote images (starting with http), use as-is
  // For relative paths from API, prepend base URL
  const mainImage = firstItem?.image1Url ? 
    (firstItem.image1Url.startsWith('/') || firstItem.image1Url.startsWith('http')) ? firstItem.image1Url : `${baseUrl}${firstItem.image1Url}` 
    : null;
  const secondaryImage = firstItem?.image2Url ? 
    (firstItem.image2Url.startsWith('/') || firstItem.image2Url.startsWith('http')) ? firstItem.image2Url : `${baseUrl}${firstItem.image2Url}` 
    : null;
  const thirdImage = firstItem?.image3Url ? 
    (firstItem.image3Url.startsWith('/') || firstItem.image3Url.startsWith('http')) ? firstItem.image3Url : `${baseUrl}${firstItem.image3Url}` 
    : null;
  const fourthImage = firstItem?.image4Url ? 
    (firstItem.image4Url.startsWith('/') || firstItem.image4Url.startsWith('http')) ? firstItem.image4Url : `${baseUrl}${firstItem.image4Url}` 
    : null;

  const collectionDescription = catalogItems.length > 0 
    ? 'A curated selection of exquisite diamond pieces, crafted with precision and perfected through years of collaboration with discerning clients and master artisans.'
    : '';

  return (
    <section ref={containerRef} className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-2 md:px-12">
        {/* Main Featured Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-stretch">
          {/* Left Side - Large Image */}
          {mainImage && (
            <ProjectImage
              src={mainImage}
              alt="Featured Project Model"
              y={y1Base}
              className="min-h-[500px] md:min-h-[200px] max-h-[800px]"
            />
          )}

          {/* Right Side - Content & Secondary Image */}
          <div className="flex flex-col justify-between md:py-8">
            {/* Header Content */}
            <motion.div
              className='mx-6 md:mx-0'
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl text-black">✦</span>
                <h2 className="text-2xl font-semibold tracking-widest text-gray-900 tan-agean uppercase">Our Collection</h2>
              </div>

              <div className="max-w-2xl">
                <p className="text-xl text-justify font-light leading-tight text-gray-900">
                  {collectionDescription}
                </p>
              </div>
            </motion.div>

            {/* Secondary Image */}
            {secondaryImage && (
              <div className="mt-12 md:mt-16 self-end max-w-2xl ml-auto w-full">
                <ProjectImage
                  src={secondaryImage}
                  alt="Featured Project Detail"
                  y={y2Base}
                  className="h-96 md:h-96 w-96 w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {thirdImage && (
            <div className="col-span-2 mt-10 md:-mt-32">
              <ProjectImage
                src={thirdImage}
                alt="Featured Bracelet Collection"
                y={y3Base}
                className="h-[800px] w-full object-contain"
              />
            </div>
          )}
         
          {fourthImage && (
            <div className="col-span-2">
              <ProjectImage
                src={fourthImage}
                alt="Featured Earring Collection"
                y={y1Base}
                className="h-[700px] w-full object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}