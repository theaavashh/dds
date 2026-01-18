"use client";

import DashboardLayout from "@/components/DashboardLayout";
import CatalogManagement from "@/components/CatalogManagement";

export default function CatalogPage() {
  return (
    <DashboardLayout title="Catalog Management">
      <CatalogManagement />
    </DashboardLayout>
  );
}