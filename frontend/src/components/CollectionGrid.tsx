'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

function ParallaxImageWrapper({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    return (
        <div ref={ref} className={`relative overflow-hidden group ${className}`}>
            <motion.div className="w-full h-[120%] -top-[10%] relative" style={{ y }}>
                {children}
            </motion.div>
        </div>
    );
}

export default function CollectionGrid() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Row 1, Col 1: Image */}
                    <ParallaxImageWrapper className="aspect-[4/5]">
                        <Image
                            src="/earring.jpg"
                            alt="Collection Item 1"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </ParallaxImageWrapper>

                    {/* Row 1, Col 2: Image */}
                    <ParallaxImageWrapper className="aspect-[4/5]">
                        <Image
                            src="/necklaces.jpg"
                            alt="Collection Item 2"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </ParallaxImageWrapper>

                    {/* Row 1, Col 3: Text Block */}
                    <div className="aspect-[4/5] flex flex-col justify-center items-start p-8 md:p-12">
                        <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-gray-500 mb-6">
                            Discover <br /> New Arrivals
                        </h3>
                        <Link href="#">
                            <button className="px-8 py-3 border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 text-xs uppercase tracking-widest">
                                Discover More
                            </button>
                        </Link>
                    </div>

                    {/* Row 2, Col 1: Text Block */}
                    <div className="aspect-[4/5] flex flex-col justify-center items-start p-8 md:p-12 md:order-none order-last">
                        <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-gray-500 mb-6">
                            Jewelry Tells <br /> A Great Story
                        </h3>
                        <Link href="#">
                            <button className="px-8 py-3 border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 text-xs uppercase tracking-widest">
                                Discover Story
                            </button>
                        </Link>
                    </div>

                    {/* Row 2, Col 2: Image */}
                    <ParallaxImageWrapper className="aspect-[4/5]">
                        <Image
                            src="/Hands Holding Two Rings.png"
                            alt="Collection Item 3"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105 bg-gray-50"
                        />
                    </ParallaxImageWrapper>

                    {/* Row 2, Col 3: Image */}
                    <ParallaxImageWrapper className="aspect-[4/5]">
                        <Image
                            src="/b1.jpg"
                            alt="Collection Item 4"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </ParallaxImageWrapper>

                </div>
            </div>
        </section>
    );
}
