'use client';

import { inter } from '@/app/fonts';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function WhoWeAre() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [50, 0, 0, -50]);

  return (
    <motion.section
      ref={sectionRef}
      className="mt-7 bg-[#C5BC9A] overflow-hidden relative pt-20 pb-10"
      style={{ opacity, y }}
    >
      {/* Luxury Diamond Facets Pattern */}

      <div className=" px-6 lg:px-12 text-center relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Main Title - Minimalist & Bold */}
          <div className="relative inline-block">
            {/* Realistic diamond decoration above title */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="diamondGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E8E8E8" />
                    <stop offset="50%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#D0D0D0" />
                  </linearGradient>
                  <linearGradient id="diamondGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F0F0F0" />
                    <stop offset="100%" stopColor="#C0C0C0" />
                  </linearGradient>
                </defs>
                {/* Main diamond shape with facets */}
                <polygon points="50,5 95,35 50,95 5,35" fill="url(#diamondGrad1)" stroke="#B8B8B8" strokeWidth="1" />
                {/* Table facet (top) */}
                <polygon points="50,5 72,20 50,35 28,20" fill="#FFFFFF" fillOpacity="0.9" />
                {/* Star facets */}
                <polygon points="50,5 61,12.5 50,20 39,12.5" fill="#F8F8F8" />
                {/* Upper girdle facets */}
                <polygon points="28,20 50,35 50,20 39,12.5" fill="url(#diamondGrad2)" />
                <polygon points="72,20 61,12.5 50,20 50,35" fill="#E0E0E0" />
                <polygon points="5,35 28,20 50,35 28,50" fill="#D8D8D8" />
                <polygon points="95,35 72,20 50,35 72,50" fill="#D0D0D0" />
                {/* Pavilion facets */}
                <polygon points="28,50 50,35 50,95" fill="#C8C8C8" />
                <polygon points="72,50 50,35 50,95" fill="#B8B8B8" />
                <polygon points="5,35 28,50 50,95 28,35" fill="#C0C0C0" />
                <polygon points="95,35 72,50 50,95 72,35" fill="#B0B0B0" />
                {/* Sparkle effects */}
                <path d="M50 0 L52 8 L50 10 L48 8 Z" fill="#FFFFFF" />
                <circle cx="50" cy="3" r="1.5" fill="#FFFFFF" />
                <path d="M85 25 L88 28 L85 31 L82 28 Z" fill="#FFFFFF" fillOpacity="0.8" />
                <path d="M15 25 L18 28 L15 31 L12 28 Z" fill="#FFFFFF" fillOpacity="0.8" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-6xl tan-agean font-extrabold text-black mb-6  pt-8">
              Celebration Diamonds
            </h2>
          </div>

          <h4 className={` tan-agean text-lg md:text-lg font-extrabold text-black  `}>
            Diamond For EveryOne
          </h4>

          {/* Description - Clean & Centered */}
          <div className="max-w-7xl mx-auto mt-6">
            <p className={`text-justify text-xl  md:text-2xl text-gray-900 font-normal`}>
              At Celebration Diamonds, a diamond is more than brilliance —
              it is trust, legacy, and the celebration of life’s most meaningful moments.
            </p>

          </div>
        </motion.div>




        {/* Explore More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          <button className="px-8 py-4 text-white bg-black rounded-full font-medium tracking-wider transition-all duration-300 relative group">
            Explore More
          </button>
        </motion.div>

      </div>
    </motion.section>
  );
}
