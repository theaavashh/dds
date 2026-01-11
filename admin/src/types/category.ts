export interface Category {
  id: string;
  title: string;
  iconUrl: string | null;
  imageUrl: string | null;
  desktopBreadcrumbUrl: string | null;
  mobileBreadcrumbUrl: string | null;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  // Subcategories
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}