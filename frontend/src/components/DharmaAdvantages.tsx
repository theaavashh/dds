'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const advantages = [
  {
    id: 1,
    title: 'Amazing Value',
    image: '/diamond.png',
  },
  {
    id: 2,
    title: 'Peace of Mind',
    image: '/lotus.png',
  },
  {
    id: 3,
    title: 'Expert Guidance',
    image: '/graduation.png',
  },
  {
    id: 4,
    title: 'Inspiring Assortment',
    image: '/lightbulb.png',
  },
];

export default function DharmaAdvantages() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-4 uppercase cabinet">
            Celebration Diamonds Advantage
          </h2>
          <p className="text-lg md:text-xl  text-gray-500 uppercase font-medium">
            Reason to shop with us!
          </p>
        </div>

        {/* Icons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {advantages.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center group"
            >
              <div className="mb-6 p-4 rounded-full bg-blue-50/50 group-hover:bg-blue-50 transition-colors duration-300">
                <div className="relative w-12 h-12">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <h3 className="text-lg cabinet font-medium text-black">
                {item.title}
              </h3>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
