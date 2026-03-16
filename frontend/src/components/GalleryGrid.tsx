'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

// Placeholder data - replace with real data or API call later
const galleryItems = [
    { id: 1, src: '/necklaces.jpg', alt: 'Abstract Table 1', category: 'Necklace' },
    { id: 2, src: '/earring.jpg', alt: 'Chair Design', category: 'Earring' },
    { id: 3, src: '/ladiesring.jpg', alt: 'Cabinet Detail', category: 'Ring' },
    { id: 4, src: '/ovalbangle.jpg', alt: 'Lounge Chair', category: 'Bangle' },
    { id: 5, src: '/pendent.jpg', alt: 'Minimalist Object', category: 'Pendent' },
    { id: 6, src: '/menbracelet.jpg', alt: 'Wooden Furniture', category: 'Bracelet' },
    { id: 7, src: '/mangalsutra.jpg', alt: 'Modern Table', category: 'Mangalsutra' },
    { id: 8, src: '/ladiesbracelet.jpg', alt: 'Low Coffee Table', category: 'Bracelet' },
    { id: 9, src: '/necklaces.jpg', alt: 'Interior Shot', category: 'Necklace' }, // Recycling images for full grid
];

export default function GalleryGrid() {
    return (
        <div className="w-full bg-[#fcfcfc] min-h-screen">
            <div className="container mx-auto px-4 py-8">

                {/* Gallery Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-black tracking-tight mb-4 md:mb-0">
                        celebration diamonds
                    </h1>

                    <div className="flex items-center space-x-6 text-sm font-medium text-gray-500 uppercase tracking-widest">
                        <div className="flex items-center">
                            <span className="mr-2">category:</span>
                            <span className="text-black cursor-pointer">all</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2">view:</span>
                            {/* Simple Square Icon representing grid view */}
                            <div className="w-4 h-4 bg-black"></div>
                        </div>
                    </div>
                </div>

                {/* CSS Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                    {galleryItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            viewport={{ once: true }}
                            className="relative aspect-square bg-gray-100 group overflow-hidden"
                        >
                            <Image
                                src={item.src}
                                alt={item.alt}
                                fill
                                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                            />
                            {/* Horizontal text overlay on hover matching the reference style roughly */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10">
                                <span className="text-white font-medium uppercase tracking-widest text-sm drop-shadow-md">
                                    {item.category}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
}
