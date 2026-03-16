'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef, memo } from 'react';


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

interface FeaturedProjectsClientProps {
  catalogItems: CatalogItem[];
}

interface ProjectImageProps {
  src: string;
  alt: string;
  y?: MotionValue<string>;
  priority?: boolean;
  delay?: number;
  title?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const COLLECTION_DESCRIPTION = 'A curated selection of exquisite diamond pieces, crafted with precision and perfected through years of collaboration with discerning clients and master artisans.';

const resolveImageUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('/') || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.2 }
  }
};

/**
 * Reusable component for project images with clip-path reveal and parallax effect
 */
function ProjectImage({ src, alt, y, priority = false, delay = 0, title }: ProjectImageProps) {
  return (
    <div className="relative overflow-hidden w-full h-full group ">
      {/* Clip-path Reveal Animation */}
      <motion.div
        className="relative w-full h-full"
        initial={{ clipPath: 'inset(100% 0 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0 0 0)' }}
        transition={{
          duration: 2,
          ease: [0.34, 1.56, 0.64, 1] as const,
          delay: delay,
        }}
        viewport={{ once: false }}
      >
        {/* Parallax Image Wrapper */}
        <motion.div
          className="w-full h-[120%] -top-[10%] relative"
          style={{ y }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain md:object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
            unoptimized={src.includes('localhost')}
          />
        </motion.div>
      </motion.div>

      {/* Title Label - Top Left */}
      {title && (
        <div className="absolute top-4 z-10">
          <span className="px-3 py-1.5 text-lg font-medium text-white">
            {title}
          </span>
        </div>
      )}
    </div>
  );
}

export default function FeaturedProjectsClient({ catalogItems }: FeaturedProjectsClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const ySlow = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const yMedium = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const yFast = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  if (!catalogItems.length) return null;

  const firstItem = catalogItems[0];

  const images = {
    main: resolveImageUrl(firstItem.image1Url),
    secondary: resolveImageUrl(firstItem.image2Url),
    third: resolveImageUrl(firstItem.image3Url),
    fourth: resolveImageUrl(firstItem.image4Url),
  };

  return (
    <section
      ref={containerRef}
      className="py-10 md:py-12 overflow-hidden"
    >
      <div className="w-full mx-auto px-1 sm:px-6 lg:px-6 max-w-7xl ">
        {/* Main 2-column grid layout with equal height columns */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-12 items-stretch"
        >
          {/* LEFT COLUMN - Two images stacked, filling full height */}
          <div className="flex flex-col h-full">
            {/* Left Image 1 */}
            {images.main && (
              <div
                className="relative overflow-hidden flex-1   "
                style={{ minHeight: 'clamp(350px, 45vw, 650px)' }}
              >
                <ProjectImage
                  src={images.main}
                  alt={firstItem.image1Title || "Featured Collection"}
                  y={yFast}
                  priority
                  delay={0}
                  title={firstItem.image1Title || "Collection"}
                />
              </div>
            )}

            <motion.div
              className="md:hidden flex flex-col justify-center pt-12  pb-8 md:py-8 lg:py-12 px-2 md:px-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUpVariants}
            >
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <span className="text-lg md:text-xl text-[#DFC97E]">✦</span>
                <h2 className={` text-3xl sm:text-3xl md:text-5xl font-semibold tan-agean text-[#DFC97E] tracking-tight`}>
                  Our Collection
                </h2>
              </div>

              <p className={`text-lg md:text-lg text-justify text-gray-800 leading-relaxed max-w-5xl`}>
                {COLLECTION_DESCRIPTION}
              </p>
            </motion.div>


            {/* Left Image 2 */}
            {images.secondary && (
              <div
                className="relative overflow-hidden flex-1 "
                style={{ minHeight: 'clamp(150px, 85vw, 350px)' }}
              >
                <ProjectImage
                  src={images.secondary}
                  alt={firstItem.image2Title || "Collection Detil"}
                  y={yFast}
                  delay={0.2}
                  title={firstItem.image2Title || "Collection"}
                />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Text first, then two images */}
          <div className="flex flex-col gap-3 md:gap-2 h-full">
            {/* Text Section */}
            <motion.div
              className="hidden md:flex flex-col justify-center py-6 md:py-8 lg:py-12 px-2 md:px-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUpVariants}
            >
              <div className="flex items-center gap-4 mb-3 md:mb-6">
                <span className="text-lg md:text-xl text-amber-600">✦</span>
                <h2 className={`tan-agean text-2xl sm:text-3xl md:text-3xl text-gray-900 tracking-tight`}>
                  Our Collection
                </h2>
              </div>

              <p className={`text-sm sm:text-base md:text-xl text-gray-600 leading-relaxed max-w-5xl`}>
                {COLLECTION_DESCRIPTION}
              </p>
            </motion.div>

            {/* Right Image 1 */}
            {images.third && (
              <div
                className="relative overflow-hidden flex-1  "
                style={{ minHeight: 'clamp(350px, 45vw, 750px)' }}
              >
                <ProjectImage
                  src={images.third}
                  alt={firstItem.image3Title || "Collection Item 3"}
                  y={yFast}
                  delay={0}
                  title={firstItem.image3Title || "Collection"}
                />
              </div>
            )}

            {/* Right Image 2 */}
            {images.fourth && (
              <div
                className="relative overflow-hidden flex-1"
                style={{ minHeight: 'clamp(350px, 45vw, 1200px)' }}
              >
                <ProjectImage
                  src={images.fourth}
                  alt={firstItem.image4Title || "Collection Item 4"}
                  y={yFast}
                  delay={0}
                  title={firstItem.image4Title || "Collection"}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
