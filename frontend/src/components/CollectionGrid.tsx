'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    motion,
    useScroll,
    useTransform,
    useInView
} from 'framer-motion';
import { useRef } from 'react';

/* ---------------- Parallax Wrapper ---------------- */

interface ParallaxImageWrapperProps {
    children: React.ReactNode;
    className?: string;
    parallaxIntensity?: number;
}

function ParallaxImageWrapper({
    children,
    className = '',
    parallaxIntensity = 0.05
}: ParallaxImageWrapperProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    });

    const y = useTransform(
        scrollYProgress,
        [0, 1],
        [`-${parallaxIntensity * 100}%`, `${parallaxIntensity * 100}%`]
    );

    return (
        <div
            ref={ref}
            className={`relative overflow-hidden w-full h-full ${className}`}
        >
            <motion.div
                className="relative w-full h-full"
                style={{ y }}
            >
                {children}
            </motion.div>
        </div>
    );
}

/* ---------------- Animated Text Block ---------------- */

interface AnimatedTextBlockProps {
    title: string;
    description?: string;
    buttonText: string;
    href?: string;
    className?: string;
    delay?: number;
}

function AnimatedTextBlock({
    title,
    description,
    buttonText,
    href = '#',
    className = '',
    delay = 0
}: AnimatedTextBlockProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            className={`flex flex-col justify-center items-center sm:items-start w-full h-full ${className}`}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        >
            <h3 className="text-lg font-normal text-black mb-6 text-center sm:text-left">
                {description || title}
            </h3>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Link href={href}>
                    <button className="px-8 py-3 border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 text-xs uppercase tracking-widest">
                        {buttonText}
                    </button>
                </Link>
            </motion.div>
        </motion.div>
    );
}

/* ---------------- Animated Image Card ---------------- */

interface AnimatedImageCardProps {
    src: string;
    alt: string;
    className?: string;
    delay?: number;
    parallaxIntensity?: number;
}

function AnimatedImageCard({
    src,
    alt,
    className = '',
    delay = 0,
    parallaxIntensity = 0.05
}: AnimatedImageCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            className={`relative w-full h-full overflow-hidden group ${className}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        >
            <ParallaxImageWrapper parallaxIntensity={parallaxIntensity}>
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
            </ParallaxImageWrapper>
        </motion.div>
    );
}

/* ---------------- Data ---------------- */

interface CollectionItem {
    id: string;
    type: 'image' | 'text';
    src?: string;
    alt?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    href?: string;
    className?: string;
    parallaxIntensity?: number;
}

const COLLECTION_ITEMS: CollectionItem[] = [
    {
        id: '1',
        type: 'image',
        src: '/earring.jpg',
        alt: 'Elegant Earrings',
        className: 'aspect-[4/5]',
        parallaxIntensity: 0.03
    },
    {
        id: '2',
        type: 'image',
        src: '/necklaces.jpg',
        alt: 'Premium Necklaces',
        className: 'aspect-[4/5]',
        parallaxIntensity: 0.04
    },
    {
        id: '3',
        type: 'text',
        description:
            'An exclusive showcase of diamond masterpieces, where precision craftsmanship meets years of collaboration with master artisans.',
        buttonText: 'Discover More',
        href: '#',
        className: 'aspect-[4/5] -mt-28 md:mt-10 text-semibold font-normal text-justify'
    },
    {
        id: '4',
        type: 'text',
        description: 'Jewelry Tells A Great Story',
        buttonText: 'Discover Story',
        href: '#',
        className: 'aspect-[4/5] hidden md:block'
    },
    {
        id: '5',
        type: 'image',
        src: '/ring-feat.jpg',
        alt: 'Wedding Rings',
        className: 'aspect-[4/5] hidden md:block',
        parallaxIntensity: 0.06
    },
    {
        id: '6',
        type: 'image',
        src: '/b1.jpg',
        alt: 'Bracelets',
        className: 'aspect-[4/5] hidden md:block',
        parallaxIntensity: 0.05
    }
];

/* ---------------- Main Component ---------------- */

export default function CollectionGrid() {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

    return (
        <motion.section
            ref={ref}
            className="py-24 bg-white overflow-hidden"
            style={{ opacity, scale }}
        >
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {COLLECTION_ITEMS.map((item, i) => (
                        <div key={item.id} className={item.className}>
                            {item.type === 'image' ? (
                                <AnimatedImageCard
                                    src={item.src!}
                                    alt={item.alt!}
                                    delay={i * 0.1}
                                    parallaxIntensity={item.parallaxIntensity}
                                />
                            ) : (
                                <AnimatedTextBlock
                                    title={item.title ?? ''}
                                    description={item.description}
                                    buttonText={item.buttonText!}
                                    href={item.href}
                                    delay={i * 0.1}
                                    className='text-justify whitespace-pre-line'
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}
