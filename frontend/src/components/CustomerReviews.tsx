'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type ApiTestimonial = {
  id: string;
  clientName?: string;
  customerName?: string;
  clientTitle?: string | null;
  company?: string | null;
  content?: string;
  description?: string;
  rating?: number | null;
  imageUrl?: string | null;
  isActive?: boolean;
};

type Review = { id: string; name: string; image: string | null; text: string };

function resolveImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  const uploadsIndex = imagePath.indexOf('/uploads/');
  const normalized = (uploadsIndex !== -1 ? imagePath.slice(uploadsIndex) : imagePath).replace(/\\/g, '/');
  const prefixed = normalized.startsWith('/') ? normalized : `/${normalized}`;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return `${apiUrl}${prefixed}`;
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
        const res = await fetch(`${base}/testimonials/public`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped: Review[] = json.data
              .filter((t: ApiTestimonial) => t.isActive !== false)
              .map((t: ApiTestimonial) => ({
                id: String(t.id),
                name: (t.clientName || t.customerName || '').trim(),
                text: (t.content || t.description || '').trim(),
                image: resolveImageUrl(t.imageUrl || null),
              }));
            setReviews(mapped);
          }
        }
      } catch { }
      setLoading(false);
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;

    // Auto shift every 4 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  // Create a triple-duplicated list for seamless circular shifting
  // We need enough items to cover the 4 visible ones plus the shifting action
  const displayReviews = [...reviews, ...reviews, ...reviews];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">

        {/* Reviews Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold cabinet text-black mb-4">
            Customer Reviews
          </h2>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto rounded-full"></div>
        </div>

        {/* Animated Reviews Container */}
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{
              x: `-${(currentIndex % reviews.length) * (100 / displayReviews.length)}%`
            }}
            transition={{
              duration: 0.9,
              ease: [0.34, 1.56, 0.64, 1] // Custom bouncy elastic effect
            }}
          // We reset the index to 0 instantly if we reach the end of the first set
          // to keep the animation infinite and seamless.
          // Framer Motion handles the 'jump' back gracefully if done correctly,
          // but here we just rely on the modulus and duplicated array.
          >
            {displayReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="inline-block w-full md:w-1/2 lg:w-1/3 xl:w-1/4 px-4 whitespace-normal align-top"
              >
                <motion.div
                  whileHover={{ y: -10 }}
                  className="relative bg-white border border-gray-200 shadow-lg p-8 pt-24 rounded-lg h-full transition-all duration-500 hover:shadow-2xl"
                >
                  {/* Floating Profile Image */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                    {review.image ? (
                      <Image src={review.image} alt={review.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 text-xl font-bold">{review.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-center mb-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-4 h-4 bg-[#d4af37] rounded-full" />
                        ))}
                      </div>
                    </div>
                    <p className="text-base leading-relaxed text-gray-700 mb-6 italic text-center">
                      "{review.text}"
                    </p>
                    <div className="border-t border-gray-100 pt-6">
                      <h4 className="text-black font-bold cabinet text-base tracking-[0.1em] uppercase text-center">
                        {review.name}
                      </h4>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center space-x-3 mt-16">
          {reviews.slice(0, 4).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${(currentIndex % reviews.length) === i ? 'bg-[#d4af37]' : 'bg-gray-300'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}