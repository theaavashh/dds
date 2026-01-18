'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeroSection {
  id: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Hero() {
  const [heroData, setHeroData] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/hero-section`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Get the first active hero section
          const activeHero = data.data.find((hero: HeroSection) => hero.isActive);
          setHeroData(activeHero || data.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch hero data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  // Show loading state or fallback to default images
  if (loading) {
    return (
      <section className="relative w-full bg-black overflow-hidden h-[100svh]">
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      </section>
    );
  }

  // Construct full image URLs using API base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  const getFullImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Otherwise prepend the API base URL
    return `${apiBaseUrl}${imageUrl}`;
  };

  // Fallback to default images if no API data
  const desktopImage = heroData?.desktopImageUrl 
    ? getFullImageUrl(heroData.desktopImageUrl)
    : '/main-header-banner.jpeg';
  const mobileImage = heroData?.mobileImageUrl 
    ? getFullImageUrl(heroData.mobileImageUrl)
    : '/image copy.png';

  return (
    <section className="relative w-full  overflow-hidden h-[100svh]">
      
      {/* Desktop / Large screens */}
      <Image
        src={desktopImage}
        alt="Crafting the future of fine diamonds"
        fill
        priority
        sizes="100vw"
        className="hidden lg:block object-cover object-top"
      />

      {/* Mobile / Tablet */}
      <Image
        src={mobileImage}
        alt="Crafting the future of fine diamonds"
        fill
        priority
        sizes="100vw"
        className="block lg:hidden object-cover"
      />

    </section>
  );
}
