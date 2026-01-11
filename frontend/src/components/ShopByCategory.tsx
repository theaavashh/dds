'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const categories = [
  {
    id: 1,
    name: 'NECKLACE',
    href: '/jewelry/necklace',
    image: '/necklaces.jpg', // Greenish Necklace placeholder
  },
  {
    id: 2,
    name: 'EARRING',
    href: '/jewelry/earring',
    image: '/earring.jpg', // Earring placeholder
  },
  {
    id: 3,
    name: 'LADIES RING',
    href: '/jewelry/ladiesring',
    image: '/ladiesring.jpg', // Ring placeholder
  },
  {
    id: 4,
    name: 'BANGLE',
    href: '/jewelry/bangle',
    image: '/ovalbangle.jpg', // Bangle placeholder
  },
  {
    id: 5,
    name: 'Pendent',
    href: '/jewelry/pendent',
    image: '/pendent.jpg', // Bangle placeholder
  },
  {
    id: 6,
    name: 'MEN BRACELET',
    href: '/jewelry/menbracelet',
    image: '/menbracelet.jpg', // Bangle placeholder
  },
  {
    id: 7,
    name: 'MANGALSUTRA',
    href: '/jewelry/mangalsutra',
    image: '/mangalsutra.jpg', // Bangle placeholder
  },
  {
    id: 8,
    name: 'LADIES BRACELET',
    href: '/jewelry/ladiesbracelet',
    image: '/ladiesbracelet.jpg', // Bangle placeholder
  },
];

export default function ShopByCategory() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-black cabinet mb-4 uppercase ">
            SHOP BY CATEGORY
          </h2>
          <p className="text-lg md:text-xl text-gray-600 uppercase font-semibold">
            CHOOSE FROM OUR VAST JEWELLERY COLLECTION
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-16">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={category.href}
              className="group"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="relative w-full aspect-square bg-gray-50 mb-6 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Optional overlay effect */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>
                <h3 className="text-md font-semibold text-black cabinet uppercase">
                  {category.name}
                </h3>
              </motion.div>
            </Link>
          ))}
        </div>



      </div>
    </section>
  );
}
