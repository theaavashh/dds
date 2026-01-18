'use client';

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
      className="my-20 bg-white overflow-hidden"
      style={{ opacity, y }}
    >
      <div className="container mx-auto px-6 lg:px-12 text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Main Title - Minimalist & Bold */}
          <h2 className="text-4xl font-bold text-black mb-5 tracking-tight tan-agean">
            Celebration Diamonds.
          </h2>

           <h4 className="text-md font-bold text-black mb-12 tracking-tight tan-agean">
            Diamond For EveryOne
          </h4>

          {/* Description - Clean & Centered */}
          <div className="max-w-5xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-900 font-semibold leading-relaxed tan-agean">
              At Celebration Diamonds, a diamond is more than brilliance —
it is trust, legacy, and the celebration of life’s most meaningful moments.
            </p>
          
          </div>
        </motion.div>

        {/* Re-rendering with actual content to be safe, maybe slightly larger font to match the graphic impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto mt-8 md:mt-12"
        >
          <p className="text-lg md:text-xl text-justify  text-black font-normal leading-tight md:leading-snug">
           Nepal’s first diamond studio with an in-house advanced gemological laboratory, Celebration Diamonds is guided by over three decades of professional gemology expertise. Each diamond is subjected to 28 rigorous internal analytical quality tests, performed by GIA-trained professionals and personally supervised by our senior gemologist — guaranteeing natural origin, precise grading, and uncompromised authenticity.
          </p>
        </motion.div>

        {/* Explore More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-18"
        >
          <button className="px-8 py-3 border-2 border-[#DFC97E] text-black font-semibold tracking-wider uppercase transition-all duration-500 rounded-sm relative overflow-hidden group">
            <span className="relative z-10 tan-agean">Explore More</span>
            <span className="absolute inset-0 bg-[#DFC97E] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-bottom"></span>
          </button>
        </motion.div>

      </div>
    </motion.section>
  );
}
