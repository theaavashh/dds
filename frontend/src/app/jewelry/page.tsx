'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShopByCategory from '@/components/ShopByCategory';

export default function JewelryPage() {
    return (
        <main className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <div className="relative h-[40vh] w-full bg-[#f2f2f2] flex items-center justify-center pt-20">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-sans font-normal tracking-wide mb-4 text-black cabinet uppercase">
                        Our Jewelry Collection
                    </h1>
                    <div className="w-16 h-0.5 bg-amber-600 mx-auto mb-4"></div>
                    <p className="text-lg md:text-xl font-light tracking-wider text-gray-600 uppercase">
                        Moments of Precious Craft
                    </p>
                </div>
            </div>

            <ShopByCategory />

            <Footer />
        </main>
    );
}
