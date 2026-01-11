import Header from '@/components/Header';
import Hero from '@/components/Hero';
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
import PreciousCraft from '@/components/PreciousCraft';

import FeaturedProjects from '@/components/FeaturedProjects';
import ProjectGallery from '@/components/ProjectGallery';
import ClientWork from '@/components/ClientWork';
import CollectionGrid from '@/components/CollectionGrid';
import SmoothScroll from '@/components/SmoothScroll';

export default function Home() {
  return (
    <SmoothScroll>
      <main className="min-h-screen bg-white">
        <Header />
        <Hero />
        <FeaturedProjects />
        <ProjectGallery />
        <WhoWeAre />
        <ShopByCategory />
        <LowerBanner />
        <ClientWork />
        <CollectionGrid />

        <StyleStatement />

      
        <DharmaAdvantages />
        <TopBanner />

        <VideoDisplayAutoPlay />
        <CustomerReviews />


        <Newsletter />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
