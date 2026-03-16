import { motion } from 'framer-motion';

export default function ProductSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group relative"
    >
      {/* Image Skeleton */}
      <div className="aspect-square relative overflow-hidden bg-gray-200 mb-2 rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      </div>

      {/* Info Skeleton */}
      <div className="space-y-2">
        {/* Product Name */}
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        
        {/* Product Code */}
        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
        
        {/* Price */}
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        
        {/* Weight Info */}
        <div className="flex justify-between items-center">
          <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
        </div>
      </div>

      {/* Hover Overlay Skeleton */}
      <div className="absolute inset-0 bg-white/10 rounded-lg" />
    </motion.div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}