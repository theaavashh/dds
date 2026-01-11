import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Celebration Diamonds Studio",
  description: "Find answers to frequently asked questions about our jewelry, services, policies, and more at Celebration Diamonds.",
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>{children}</>
  );
}