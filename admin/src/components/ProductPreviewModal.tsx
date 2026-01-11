'use client';

import React, { useEffect, useState } from 'react';
import { Lato } from 'next/font/google';

const lato = Lato({ subsets: ['latin'], display: 'swap', weight: ['400','700'] });
import { X } from 'lucide-react';

interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  title: string;
  imageUrl: string | null;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  category: Category;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
  imageUrl?: string;
  images?: ProductImage[];
  stock: number;
  isActive: boolean;
  status: string;
  // Gold Fields
  goldWeight?: string;
  goldPurity?: string;
  goldType?: string;
  goldCraftsmanship?: string;
  goldDesignDescription?: string;
  goldFinishedType?: string;
  goldStones?: string;
  goldStoneQuality?: string;
  // Diamond Fields
  diamondType?: string;
  diamondShapeCut?: string;
  diamondColorGrade?: string;
  diamondClarityGrade?: string;
  diamondCutGrade?: string;
  diamondMetalDetails?: string;
  diamondCertification?: string;
  diamondOrigin?: string;
  diamondCaratWeight?: string;
  // Platinum Fields
  platinumWeight?: string;
  platinumType?: string;
  // Silver Fields
  silverWeight?: string;
  silverType?: string;
  // Other Fields
  stoneWeight?: string;
  caret?: string;
  otherGemstones?: string;
  orderDuration?: string;
  metalType?: string;
  stoneType?: string;
  settingType?: string;
  size?: string;
  color?: string;
  finish?: string;
  digitalBrowser?: boolean;
  website?: boolean;
  distributor?: boolean;
  normalUser?: boolean;
  resellerUser?: boolean;
  culture?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoSlug?: string;
  briefDescription?: string;
  fullDescription?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  categories: Category[];
  subcategories: Subcategory[];
}

const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  product,
  categories,
  subcategories
}) => {
  if (!isOpen || !product) return null;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageHovering, setIsImageHovering] = useState(false);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!product?.images || product.images.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : product!.images!.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex(prev => (prev < product!.images!.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product]);

  useEffect(() => {
    let interval: number | undefined;
    if (isImageHovering && product?.images && product.images.length > 1) {
      interval = window.setInterval(() => {
        setCurrentImageIndex(prev => {
          const len = product.images!.length;
          return prev < len - 1 ? prev + 1 : 0;
        });
      }, 1500);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isImageHovering, product]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <div 
        className={`bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200 ${lato.className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-3xl font-bold text-black">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-black hover:text-black transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left side - Product Image */}
            <div
              className="group relative aspect-square bg-gray-100 rounded-xl"
              onMouseEnter={() => setIsImageHovering(true)}
              onMouseLeave={() => setIsImageHovering(false)}
              onTouchStart={() => setIsImageHovering(true)}
              onTouchEnd={() => setIsImageHovering(false)}
            >
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImageIndex].url.startsWith('http') ? product.images[currentImageIndex].url : `http://localhost:5000${product.images[currentImageIndex].url}`}
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    className="object-cover w-full h-full rounded-xl shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                    }}
                  />

                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : product.images!.length - 1));
                        }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(prev => (prev < product.images!.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {product.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(index);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75'}`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : product.imageUrl ? (
                <img
                  src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`}
                  alt={product.name}
                  className="object-cover w-full h-full rounded-xl shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {(product.isActive) && (
                <div className="absolute top-4 left-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
              )}
            </div>
            
            {/* Right side - Product Details */}
            <div className="space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Description</h3>
                <p className="text-black leading-relaxed text-lg">{product.description}</p>
              </div>

              {/* Full Description */}
              {product.fullDescription && (
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">Full Description</h3>
                  <div className="text-black leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
                </div>
              )}

              {/* Product Information */}
              <div className="border border-gray-200 rounded-lg">
                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">Product Code:</span>
                    <span className="font-medium text-black">{product.productCode}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">Category:</span>
                    <span className="font-medium text-black">
                      {categories.find((c: Category) => c.id === product.category)?.title || product.category}
                    </span>
                  </div>
                  {product.subCategory && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-black">Sub Category:</span>
                      <span className="font-medium text-black">
                        {subcategories.find((s: Subcategory) => s.id === product.subCategory)?.name || product.subCategory}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">Price:</span>
                    <span className="font-medium text-black">NPR {product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">Stock:</span>
                    <span className="font-medium text-black">{product.stock}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">Status:</span>
                    <span className="font-medium text-black">
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                  </div>
                  {product.metalType && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-black">Metal Type:</span>
                      <span className="font-medium text-black">{product.metalType}</span>
                    </div>
                  )}
                  {product.goldWeight && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-black">Gold Weight:</span>
                      <span className="font-medium text-black">{product.goldWeight}</span>
                    </div>
                  )}
                  {product.otherGemstones && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-black">Other Gemstones:</span>
                      <span className="font-medium text-black">{product.otherGemstones}</span>
                    </div>
                  )}
                  {product.orderDuration && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-black">Order Duration:</span>
                      <span className="font-medium text-black">{product.orderDuration}</span>
                    </div>
                  )}
                  {product.culture && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-black">Culture:</span>
                      <span className="font-medium text-black">{product.culture}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gold Details */}
              {(product.goldWeight || 
                product.goldPurity || 
                product.goldType ||
                product.goldCraftsmanship ||
                product.goldDesignDescription ||
                product.goldFinishedType ||
                product.goldStones ||
                product.goldStoneQuality) && (
                <div className="border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 space-y-3">
                    <h3 className="text-xl font-semibold text-black mb-4">Gold Details</h3>
                    {product.goldWeight && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Gold Weight:</span>
                        <span className="font-medium text-black">{product.goldWeight}</span>
                      </div>
                    )}
                    {product.goldPurity && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Gold Purity:</span>
                        <span className="font-medium text-black">{product.goldPurity}</span>
                      </div>
                    )}
                    {product.goldType && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Gold Type:</span>
                        <span className="font-medium text-black">{product.goldType}</span>
                      </div>
                    )}
                    {product.goldCraftsmanship && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Craftsmanship:</span>
                        <span className="font-medium text-black">{product.goldCraftsmanship}</span>
                      </div>
                    )}
                    {product.goldDesignDescription && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Design Description:</span>
                        <span className="font-medium text-black">{product.goldDesignDescription}</span>
                      </div>
                    )}
                    {product.goldFinishedType && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Finished Type:</span>
                        <span className="font-medium text-black">{product.goldFinishedType}</span>
                      </div>
                    )}
                    {product.goldStones && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Stones:</span>
                        <span className="font-medium text-black">{product.goldStones}</span>
                      </div>
                    )}
                    {product.goldStoneQuality && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Stone Quality:</span>
                        <span className="font-medium text-black">{product.goldStoneQuality}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Diamond Details */}
              {(product.diamondType || 
                product.diamondShapeCut || 
                product.diamondColorGrade || 
                product.diamondClarityGrade ||
                product.diamondCutGrade ||
                product.diamondCaratWeight ||
                product.diamondMetalDetails ||
                product.diamondCertification ||
                product.diamondOrigin) && (
                <div className="border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 space-y-3">
                    <h3 className="text-xl font-semibold text-black mb-4">Diamond Details</h3>
                    {product.diamondType && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Diamond Type:</span>
                        <span className="font-medium text-black">{product.diamondType}</span>
                      </div>
                    )}
                    {product.diamondShapeCut && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Diamond Shape/Cut:</span>
                        <span className="font-medium text-black">{product.diamondShapeCut}</span>
                      </div>
                    )}
                    {product.diamondColorGrade && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Color Grade:</span>
                        <span className="font-medium text-black">{product.diamondColorGrade}</span>
                      </div>
                    )}
                    {product.diamondClarityGrade && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Clarity:</span>
                        <span className="font-medium text-black">{product.diamondClarityGrade}</span>
                      </div>
                    )}
                    {product.diamondCutGrade && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Cut Grade:</span>
                        <span className="font-medium text-black">{product.diamondCutGrade}</span>
                      </div>
                    )}
                    {product.diamondCaratWeight && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Carat Weight:</span>
                        <span className="font-medium text-black">{product.diamondCaratWeight}</span>
                      </div>
                    )}
                    {product.diamondMetalDetails && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Metal Details:</span>
                        <span className="font-medium text-black">{product.diamondMetalDetails}</span>
                      </div>
                    )}
                    {product.diamondCertification && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Certification:</span>
                        <span className="font-medium text-black">{product.diamondCertification}</span>
                      </div>
                    )}
                    {product.diamondOrigin && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Origin:</span>
                        <span className="font-medium text-black">{product.diamondOrigin}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Platinum Details */}
              {(product.platinumWeight || 
                product.platinumType) && (
                <div className="border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 space-y-3">
                    <h3 className="text-xl font-semibold text-black mb-4">Platinum Details</h3>
                    {product.platinumWeight && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Platinum Weight:</span>
                        <span className="font-medium text-black">{product.platinumWeight}</span>
                      </div>
                    )}
                    {product.platinumType && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Platinum Type:</span>
                        <span className="font-medium text-black">{product.platinumType}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Silver Details */}
              {(product.silverWeight || 
                product.silverType) && (
                <div className="border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 space-y-3">
                    <h3 className="text-xl font-semibold text-black mb-4">Silver Details</h3>
                    {product.silverWeight && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Silver Weight:</span>
                        <span className="font-medium text-black">{product.silverWeight}</span>
                      </div>
                    )}
                    {product.silverType && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-black">Silver Type:</span>
                        <span className="font-medium text-black">{product.silverType}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Distribution Channels */}
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Distribution Channels</h3>
                <div className="flex flex-wrap gap-2">
                  {product.digitalBrowser && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black">
                      Digital Browser
                    </span>
                  )}
                  {product.website && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black">
                      Website
                    </span>
                  )}
                  {product.distributor && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black">
                      Distributor
                    </span>
                  )}
                  {product.normalUser && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black">
                      Normal User
                    </span>
                  )}
                  {product.resellerUser && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black">
                      Reseller User
                    </span>
                  )}
                  {!product.digitalBrowser && !product.website && !product.distributor && !product.normalUser && !product.resellerUser && (
                    <span className="text-sm text-black">No distribution channels selected</span>
                  )}
                </div>
              </div>

              {/* SEO Information */}
              {(product.seoTitle || product.seoDescription || product.seoKeywords || product.seoSlug) && (
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">SEO Information</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="space-y-3">
                      {product.seoTitle && (
                        <div>
                          <span className="font-medium text-black">SEO Title:</span>
                          <p className="text-black mt-1">{product.seoTitle}</p>
                        </div>
                      )}
                      {product.seoSlug && (
                        <div>
                          <span className="font-medium text-black">SEO Slug:</span>
                          <p className="text-black mt-1">{product.seoSlug}</p>
                        </div>
                      )}
                      {product.seoDescription && (
                        <div>
                          <span className="font-medium text-black">SEO Description:</span>
                          <p className="text-black mt-1">{product.seoDescription}</p>
                        </div>
                      )}
                      {product.seoKeywords && (
                        <div>
                          <span className="font-medium text-black">SEO Keywords:</span>
                          <p className="text-black mt-1">{product.seoKeywords}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewModal;
