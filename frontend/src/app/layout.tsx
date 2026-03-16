import type { Metadata } from "next";
import { inter } from "./fonts";
import "./globals.css";
import { ReduxProvider } from "../providers/ReduxProvider";
import AppLayout from '../components/AppLayout';

export const metadata: Metadata = {
  metadataBase: new URL('https://celebrationdiamonds.com'),
  title: 'Celebration Diamonds Studio',
  description: 'Premium handcrafted diamond jewelry and custom designs',
  keywords: 'diamond jewelry, custom designs, engagement rings, luxury jewelry',
  verification: {
    google: 'your-verification-code-here',
  },
  alternates: {
    canonical: 'https://celebrationdiamonds.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <ReduxProvider>
          <AppLayout>{children}</AppLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}