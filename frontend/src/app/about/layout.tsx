import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Celebration Diamonds Studio",
  description: "Learn about Celebration Diamonds, our story, values, and commitment to crafting exquisite jewelry pieces.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>{children}</>
  );
}