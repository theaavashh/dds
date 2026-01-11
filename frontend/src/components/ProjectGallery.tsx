'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function ProjectGallery() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
    const y2 = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

    return (
        <section ref={containerRef} className="bg-white overflow-hidden">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-end">

                    {/* Left Side - Smaller Image (Architecture/Landscape) */}
                    <div className="md:col-span-5 relative overflow-hidden">
                        <motion.div
                            initial={{ clipPath: 'inset(100% 0 0 0)' }}
                            whileInView={{ clipPath: 'inset(0 0 0 0)' }}
                            transition={{
                                duration: 2,
                                ease: [0.34, 1.56, 0.64, 1],
                            }}
                            viewport={{ once: false }}
                            className="relative w-full aspect-[4/5] overflow-hidden"
                        >
                            <motion.div className="w-full h-[120%] -top-[10%] relative" style={{ y: y1 }}>
                                <Image
                                    src="/necklaces.jpg" // Placeholder for architecture/landscape
                                    alt="Architectural Detail"
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right Side - Large Image (Statue/Portrait) with View Button */}
                    <div className="md:col-span-7 relative overflow-hidden">
                        <div className="relative w-full aspect-[3/4] md:aspect-[3.5/5] overflow-hidden group">
                            <motion.div
                                initial={{ clipPath: 'inset(100% 0 0 0)' }}
                                whileInView={{ clipPath: 'inset(0 0 0 0)' }}
                                transition={{
                                    duration: 2,
                                    ease: [0.34, 1.56, 0.64, 1],
                                }}
                                viewport={{ once: false }}
                                className="relative w-full aspect-[4/5] overflow-hidden"
                            >
                                <motion.div className="w-full h-[120%] -top-[10%] relative" style={{ y: y1 }}>
                                    <Image
                                        src="/necklaces.jpg" // Placeholder for architecture/landscape
                                        alt="Architectural Detail"
                                        fill
                                        className="object-cover transition-transform duration-700 hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 40vw"
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Overlay Gradient */}


                            {/* View Button Overlay */}

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}