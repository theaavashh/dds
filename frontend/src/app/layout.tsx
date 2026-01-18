import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "../providers/ReduxProvider";
import VideoLoader from '../components/VideoLoader';



export const metadata: Metadata = {
  title: "Celebration Diamonds Studio| Moments of Precious Craft",
  description: "Exquisite jewelry exhibiting a diversification of cultures. Loyalty and faith are our core values.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" > 
      <body className="antialiased cabinet">
        <ReduxProvider>
          <VideoLoader />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}