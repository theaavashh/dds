import { Metadata } from 'next';
import AboutPageClient from '@/components/AboutPageClient';

export const metadata: Metadata = {
  title: 'About Us | Celebration Diamonds',
  description: 'Nepal\'s first diamond studio with an in-house advanced gemological laboratory. Discover our heritage of trust, authenticity, and craftsmanship.',
  openGraph: {
    title: 'About Us | Celebration Diamonds',
    description: 'Nepal\'s first diamond studio with an in-house advanced gemological laboratory. Discover our heritage of trust, authenticity, and craftsmanship.',
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}