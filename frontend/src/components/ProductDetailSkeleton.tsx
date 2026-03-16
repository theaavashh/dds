import { motion } from 'framer-motion';

export default function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-32">
      {/* Breadcrumb Skeleton */}
      <div className="mb-8 text-sm">
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
          <div className="text-gray-400">/</div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="text-gray-400">/</div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
          
          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="aspect-square bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          {/* Title and Code */}
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>

          {/* Price */}
          <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse" />

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
            <div className="flex space-x-3">
              <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-10 animate-pulse" />
            </div>
          </div>

          {/* Product Details Sections */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <div className="h-6 bg-gray-200 rounded w-24 mb-3 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-36 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="h-6 bg-gray-200 rounded w-20 mb-3 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-44 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-38 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t pt-4">
            <div className="h-6 bg-gray-200 rounded w-28 mb-3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}