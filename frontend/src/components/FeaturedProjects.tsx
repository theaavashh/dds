'use client';

import { useState, useEffect } from 'react';
import FeaturedProjectsClient from './FeaturedProjectsClient';

interface CatalogItem {
  id: string;
  title: string;
  description: string;
  image1Url: string;
  image2Url: string;
  image3Url: string;
  image4Url: string;
  image1Title: string;
  image1Link: string;
  image2Title: string;
  image2Link: string;
  image3Title: string;
  image3Link: string;
  image4Title: string;
  image4Link: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FeaturedProjects() {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API fetch functionality - commented out for now, keeping for future use
    /*
    const fetchCatalogItems = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/catalog`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setCatalogItems(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch catalog items:', error);
        // Set empty array when API fails - no hardcoded fallback
        setCatalogItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogItems();
    */
    
    // Hardcoded data for now - using actual images from public folder
    const hardcodedCatalogItems: CatalogItem[] = [
      {
        id: '1',
        title: 'Premium Collection',
        description: 'A curated selection of exquisite diamond pieces',
        image1Url: '/earring-feat.jpg',  // Using an actual image from public folder
        image2Url: '/bangles_feat.jpg',      // Using an actual image from public folder
        image3Url: '/ring-feat.jpg',  // Using an actual image from public folder
        image4Url: '/pendent.jpg',    // Using an actual image from public folder
        image1Title: 'Necklace Collection',
        image1Link: '',
        image2Title: 'Celebration Collection',
        image2Link: '',
        image3Title: 'Earring Collection',
        image3Link: '',
        image4Title: 'Pendant Collection',
        image4Link: '',
        position: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    setCatalogItems(hardcodedCatalogItems);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <section className="py-10 bg-white overflow-hidden">
        <div className="container mx-auto px-2 md:px-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </section>
    );
  }

  return <FeaturedProjectsClient catalogItems={catalogItems} />;
}