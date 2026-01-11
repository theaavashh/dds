'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function BangleShowcase() {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-white">
      {/* Right Image (Background Layer) */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=2070&auto=format&fit=crop" // Placeholder for double bangles/jewelry
          alt="Bangle Collection"
          fill
          className="object-cover object-center"
        />
        {/* Dark Overlay for better contrast if needed */}
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Left Image (Clipped Layer) */}
      <motion.div 
        initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' }}
        whileInView={{ clipPath: 'polygon(0 0, 45% 0, 65% 100%, 0% 100%)' }}
        transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
        viewport={{ once: true }}
        className="absolute inset-0 w-full h-full z-10"
      >
        <div className="relative w-full h-full">
            <Image
            src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop" // Placeholder for single bangle
            alt="Exclusive Bangle"
            fill
            className="object-cover object-center"
            />
        </div>
      </motion.div>

      {/* Optional: Add a text overlay or button if implied, though image didn't show text. 
          The diagonal split is the main feature. 
      */}
    </section>
  );
}
