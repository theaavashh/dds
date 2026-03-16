import { Metadata } from 'next';
import PrivacyPolicyClient from '@/components/PrivacyPolicyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy | Celebration Diamonds',
  description: 'Learn how Celebration Diamonds collects, uses, and protects your personal information. Your privacy and trust are our top priorities.',
  openGraph: {
    title: 'Privacy Policy | Celebration Diamonds',
    description: 'Learn how Celebration Diamonds collects, uses, and protects your personal information. Your privacy and trust are our top priorities.',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}