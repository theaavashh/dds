'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FC } from 'react';

// Define types for better type safety
interface AnimatedImageProps {
  src: string;
  alt: string;
  widthClass: string;
  height: string;
  delay?: number;
  marginTop?: string;
  marginLeft?: string;
  className?: string; // Add className prop for flexibility
}

// Reusable component for animated images
const AnimatedImage: FC<AnimatedImageProps> = ({
  src,
  alt,
  widthClass,
  height,
  delay = 0,
  marginTop = '',
  marginLeft = '',
  className = ''
}) => {
  return (
    <motion.div
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      whileInView={{ clipPath: 'inset(0 0 0 0)' }}
      transition={{
        duration: 2,
        ease: [0.34, 1.56, 0.64, 1],
        delay
      }}
      viewport={{ once: false }}
      className={`relative ${widthClass} ${height} shadow-lg ${marginTop} ${marginLeft} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        quality={85}
      />
    </motion.div>
  );
};

const TextCard: FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.5
      }}
      viewport={{ once: false }}
      className="relative md:absolute md:top-[20%] md:-right-[90%] sm:-right-[80%] lg:-right-[70%] md:transform md:-translate-y-1/2 bg-[#e8e8e8] p-4 w-full md:w-[400px] shadow-xl  md:rounded-tr-[20px] md:rounded-br-[20px] md:rounded-bl-[20px] md:rounded-tl-none z-20 mt-5 md:mt-0"
    >
      <div className="flex flex-col items-center text-center gap-6">
        <p className="text-[20px] md:text-[25px] font-medium text-black uppercase leading-relaxed">
          The style statement every Woman craves for.
        </p>

        <button className="group flex flex-col items-center gap-1">
          <span className="text-[18px] md:text-[18px] font-bold cabinet text-black uppercase">
            View
          </span>
          <span className="w-6 h-[2px] bg-[#d4af37] group-hover:w-full transition-all duration-300"></span>
        </button>
      </div>
    </motion.div>
  );
};

// Constants for consistent styling
const CONTAINER_CLASSES = "container mx-auto px-4 sm:px-6 lg:px-8";
const FLEX_CONTAINER_CLASSES = "flex flex-col md:flex-row relative items-center justify-between gap-8 md:gap-0 max-w-[1400px] mx-auto";

const StyleStatement: FC = () => {
  return (
    <section className="relative w-full bg-white md:py-10 overflow-hidden" aria-labelledby="style-statement-heading">
      <div className={CONTAINER_CLASSES}>
        <div className={FLEX_CONTAINER_CLASSES}>

          {/* Left Side Container - Earrings + Text Card */}
          <div className="relative w-full md:w-[55%] flex justify-start">
            {/* Wrapper for image to anchor text card */}
            <div className="relative w-full md:w-[80%]">
              <AnimatedImage
                src="/EARRING_5.jpg"
                alt="Ruby Earrings"
                widthClass="w-full"
                height="h-[700px] sm:h-[500px]"
              />

              {/* Overlapping Text Card */}
              <TextCard />
            </div>
          </div>

          {/* Right Side - Necklace Image */}
          <div className="w-full md:w-[65%] flex justify-end md:ml-12">
            <AnimatedImage
              src="/EARRING_4.jpg"
              alt="Diamond Necklace"
              widthClass="w-full"
              height="h-[500px] md:h-[1000px]"
              delay={0.2}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default StyleStatement;