export interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  fullDescription?: string;
  category: string;
  subCategory?: string;
  price: number;
  stock: number;
  isActive: boolean;
  status: string;
  imageUrl: string | null;
  images: {
    id: string;
    url: string;
    altText?: string;
  }[];
  goldWeight?: string;
  goldPurity?: string;
  goldType?: string;
  diamondCaratWeight?: string;
  diamondQuantity?: number;
  diamondShapeCut?: string;
  diamondColorGrade?: string;
  diamondClarityGrade?: string;
  metalType?: string;
  color?: string;
  size?: string;
  grossWeight?: string;
  stoneType?: string;
  createdAt?: string;
  // SEO Fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoSlug?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  robotsMeta?: string;
  imageAltText?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CategoryHero {
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string;
}
