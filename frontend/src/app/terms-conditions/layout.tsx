import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Celebration Diamonds Studio",
  description: "Read the terms and conditions governing your use of Celebration Diamonds website and services. Please review these terms before using our services.",
};

export default function TermsConditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>{children}</>
  );
}