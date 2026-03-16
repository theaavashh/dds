'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

interface AnimatedImageProps {
  src: string;
  alt: string;
  title: string;
  priority?: boolean;
  delay?: number;
  sizes?: string;
  minHeight?: string;
}

export default function AnimatedCollectionImage({
  src,
  alt,
  title,
  priority = false,
  delay = 0,
  sizes = "(max-width: 768px) 100vw, 50vw",
  minHeight = "clamp(350px, 45vw, 650px)"
}: AnimatedImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to detect when component is in view
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Element is in view - trigger animation after delay
          const timer = setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay * 1000 + 50);

          return () => clearTimeout(timer);
        } else {
          // Element is out of view - reset animation
          if (hasAnimated) {
            setIsVisible(false);
          }
        }
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '0px'
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delay, hasAnimated]);

  return (
    <article
      ref={containerRef}
      className="relative overflow-hidden flex-1 w-full"
      style={{ minHeight }}
    >
      <div
        className="relative w-full h-full"
        style={{
          clipPath: isVisible ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
          transition: `clip-path 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)`,
          transitionDelay: `${delay}s`
        }}
      >
        <div className="relative w-full h-full group">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover md:object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            sizes={sizes}
            priority={priority}
            quality={90}
            unoptimized={src.startsWith('http')}
          />
          {/* Image caption */}
          <figcaption className="absolute top-4 z-10">
            <span className="px-3 py-1.5 text-lg font-medium text-white drop-shadow-lg tan-agean">
              {title}
            </span>
          </figcaption>
        </div>
      </div>
    </article>
  );
}
