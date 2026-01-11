'use client';

import { motion } from 'framer-motion';

export default function WhoWeAre() {
  return (
    <section className="py-32 md:py-48 bg-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Main Title - Minimalist & Bold */}
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-black mb-12 tracking-tight tan-agean">
            Celebration Diamonds.
          </h2>

          {/* Description - Clean & Centered */}
          <div className="max-w-3xl mx-auto">
            <p className="text-xl md:text-3xl text-gray-900 font-normal leading-relaxed tan-agean">
              I create value through design and illustration to elevate your company to a new level.
            </p>
          
          </div>
        </motion.div>

        {/* Re-rendering with actual content to be safe, maybe slightly larger font to match the graphic impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto mt-8 md:mt-12"
        >
          <p className="text-2xl md:text-4xl text-gray-900 font-normal leading-tight md:leading-snug">
            We do not just craft jewelry; we curate moments of eternal brilliance.
            Rooted in a legacy of precision and passion, our creations define the art of luxury.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
