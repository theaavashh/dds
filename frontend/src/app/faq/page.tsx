import { Metadata } from 'next';
import FAQPageClient from '@/components/FAQPageClient';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Celebration Diamonds',
  description: 'Find answers to common questions about our natural diamonds, gemological testing, and bespoke jewelry services.',
  openGraph: {
    title: 'Frequently Asked Questions | Celebration Diamonds',
    description: 'Find answers to common questions about our natural diamonds, gemological testing, and bespoke jewelry services.',
  },
};

export default function FAQPage() {
  return <FAQPageClient />;
}