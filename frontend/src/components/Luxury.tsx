'use client';

import Image from 'next/image';

interface LuxuryProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export default function Luxury({
  title = 'Luxury Redefined',
  description = 'Discover our exquisite collection of diamond rings, crafted with precision and elegance to symbolize your most precious moments.',
  imageUrl = '/ring-feat.jpg',
  imageAlt = 'Luxury Diamond Ring',
}: LuxuryProps) {
  return (
    <section className="overflow-hidden">
      <div className="w-full px-4 md:px-12 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight tan-agean">
              {title}
            </h2>

          </div>
          <div className="w-full md:w-1/2">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
