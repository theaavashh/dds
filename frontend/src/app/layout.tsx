import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // Changed from Urbanist
import "./globals.css";
import { ReduxProvider } from "../providers/ReduxProvider";

const poppins = Poppins({ // Changed variable name
  weight: ["300", "400", "500", "600", "700"], // Added 300 for light text
  subsets: ["latin"],
  display: "swap",
});

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
    <html lang="en" className={`${poppins.className}`}> {/* Changed variable usage */}
      <body className="font-sans antialiased">
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}