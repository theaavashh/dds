import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GalleryGrid from '@/components/GalleryGrid';
import Newsletter from '@/components/Newsletter';
import NewsletterModal from '@/components/NewsletterModal';
import CookieConsent from '@/components/CookieConsent';


import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Visual Gallery',
    description: 'Explore our visual gallery of exquisite jewelry designs and craftsmanship.',
    openGraph: {
        title: 'Visual Gallery | Celebration Diamonds',
        description: 'Explore our visual gallery of exquisite jewelry designs and craftsmanship.',
        images: ['/gallery-og-image.jpg'], // Placeholder
    },
};

export default function GalleryPage() {
    return (
        <main className="min-h-screen bg-white">
            <Header />
            <GalleryGrid />
            <Newsletter />
            <Footer />
            {/* Global Modals */}
            <NewsletterModal />
            <CookieConsent />
        </main>
    );
}
