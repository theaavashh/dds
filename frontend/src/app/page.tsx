import Header from '@/components/Header';
import Hero, { getHeroData } from '@/components/Hero';
import WhoWeAre from '@/components/WhoWeAre';
import StyleStatement from '@/components/StyleStatement';
import ShopByCategory from '@/components/ShopByCategory';
import BangleShowcase from '@/components/BangleShowcase';
import DharmaAdvantages from '@/components/DharmaAdvantages';
import CustomerReviews from '@/components/CustomerReviews';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import LowerBanner from '@/components/LowerBanner';
import VideoDisplayAutoPlay from '@/components/VideoDisplayAutoPlay';
import TopBanner from '@/components/TopBanner';
import NewsletterModal from '@/components/NewsletterModal';
import CookieConsent from '@/components/CookieConsent';
import PreciousCraft from '@/components/PreciousCraft';
import HandmadeStory from '@/components/HandmadeStory';

import FeaturedProjects from '@/components/FeaturedProjects';
import ProjectGallery from '@/components/ProjectGallery';
import ClientWork from '@/components/ClientWork';
import CollectionGrid from '@/components/CollectionGrid';
import SmoothScroll from '@/components/SmoothScroll';

import Head from 'next/head';
import { jewelryStoreSchema, websiteSchema } from '@/schema';
import Luxury from '@/components/Luxury';

// Server-side data fetching for SEO
export default async function Home() {
  // Fetch hero data on the server for better SEO
  const heroData = await getHeroData();

  return (
    <>
      <Head>
        {/* Primary: JewelryStore schema (covers both physical + online) */}
        <script
          key="jewelrystore-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jewelryStoreSchema) }}
        />

        {/* Secondary: Website schema for search functionality */}
        <script
          key="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </Head>
      <SmoothScroll>
        <main className="min-h-screen">
          <Header />
          <Hero heroData={heroData} />
          <FeaturedProjects />
          <WhoWeAre />
          <ShopByCategory />
          <LowerBanner />
          <Luxury />
          <HandmadeStory />
          {/* <ClientWork /> */}
          {/* <CollectionGrid /> */}

          {/* <StyleStatement /> */}
          <VideoDisplayAutoPlay />


          <DharmaAdvantages />
          <TopBanner />

          {/* <CustomerReviews /> */}
          <Newsletter />
          <Footer />
          <NewsletterModal />
          <CookieConsent />
        </main>
      </SmoothScroll>

    </>

  );
}
