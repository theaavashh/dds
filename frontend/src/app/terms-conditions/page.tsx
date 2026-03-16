import { Metadata } from 'next';
import TermsConditionsClient from '@/components/TermsConditionsClient';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Celebration Diamonds',
  description: 'Read the terms and conditions for using Celebration Diamonds website and services. Understanding our policies ensures a transparent and trusted shopping experience.',
  openGraph: {
    title: 'Terms & Conditions | Celebration Diamonds',
    description: 'Read the terms and conditions for using Celebration Diamonds website and services. Understanding our policies ensures a transparent and trusted shopping experience.',
  },
};

export default function TermsConditionsPage() {
  return <TermsConditionsClient />;
}