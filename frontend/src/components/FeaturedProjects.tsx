'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

/**
 * Helper component for images with custom cursor and parallax
 */
function ProjectImage({
    src,
    alt,
    y,
    className = ""
}: {
    src: string;
    alt: string;
    y: any;
    className?: string;
}) {
    const [isHovered, setIsHovered] = useState(false);
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);

    // Smooth spring animation for the cursor
    const springConfig = { damping: 25, stiffness: 400 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        cursorX.set(e.clientX - rect.left);
        cursorY.set(e.clientY - rect.top);
    };

    return (
        <div
            className={`relative overflow-hidden group cursor-none ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Clip-path Reveal Animation Wrapper - "Curtain Opening" Effect (Top-Down Reveal) */}
            <motion.div
                initial={{ clipPath: 'inset(100% 0 0 0)' }}
                whileInView={{ clipPath: 'inset(0 0 0 0)' }}
                transition={{
                    duration: 2,
                    ease: [0.34, 1.56, 0.64, 1],
                }}
                viewport={{ once: false }}

                className="relative w-full h-full"
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
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105" // Smoother scale
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority // Ensure left image loads
                    />
                </motion.div>

                {/* Overlay for better text visibility if needed, keeps it subtle */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </motion.div>

            {/* Custom Cursor */}
            <motion.div
                className="absolute top-0 left-0 w-32 h-32 bg-white/20 backdrop-blur-md rounded-full pointer-events-none flex items-center justify-center z-20 mix-blend-difference"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%"
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: isHovered ? 1 : 0,
                    opacity: isHovered ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
            >
                <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase text-center leading-tight">
                    View <br /> Collection
                </span>
            </motion.div>
        </div>
    );
}

export default function FeaturedProjects() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
    const y2 = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

    return (
        <section ref={containerRef} className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-stretch">

                    {/* Left Side - Large Image */}
                    <ProjectImage
                        src="/earring.jpg"
                        alt="Featured Project Model"
                        y={y1}
                        className="min-h-[500px] md:min-h-[700px]"
                    />

                    {/* Right Side - Content & Secondary Image */}
                    <div className="flex flex-col justify-between py-8">

                        {/* Header Content */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <span className="text-2xl text-black">✦</span>
                                <h2 className="text-lg font-semibold tracking-widest uppercase text-gray-900 tan-agean">Featured Products</h2>
                            </div>

                            <div className="max-w-2xxl">
                                <p className="text-2xl text-justify font-light leading-tight text-gray-900">
                                    A curated selection of exquisite diamond pieces, crafted with precision and perfected through years of collaboration with discerning clients and master artisans.
                                </p>
                            </div>
                        </motion.div>

                        {/* Secondary Image */}
                        <div className="mt-12 md:mt-16 self-end max-w-2xl ml-auto w-full">
                            <ProjectImage
                                src="/necklaces.jpg"
                                alt="Featured Project Detail"
                                y={y2}
                                className="h-96 w-96 w-full"
                            />
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
