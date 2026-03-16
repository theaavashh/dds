import ContactPageClient from '@/components/ContactPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with Celebration Diamonds Studio. Visit our studio in Kathmandu or reach out to us for inquiries about our exquisite diamond jewelry collections.',
    keywords: ['contact', 'celebration diamonds', 'jewelry store kathmandu', 'diamond studio nepal', 'visit us'],
    openGraph: {
        title: 'Contact Us | Celebration Diamonds Studio',
        description: 'Get in touch with Celebration Diamonds Studio. Visit our studio in Kathmandu or reach out to us for inquiries.',
        type: 'website',
    },
};

export default function ContactPage() {
    return <ContactPageClient />;
}
