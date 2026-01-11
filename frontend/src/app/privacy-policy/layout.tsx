import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Celebration Diamonds Studio",
  description: "Learn how Celebration Diamonds collects, uses, and protects your personal information. Read our privacy policy for complete details.",
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>{children}</>
  );
}