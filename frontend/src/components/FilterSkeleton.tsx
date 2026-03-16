export default function FilterSkeleton() {
  return (
    <div className="w-full bg-white p-4 space-y-6">
      {/* Filter Sections Skeleton */}
      {['SUB CATEGORY', 'COLLECTION', 'METAL WT.', 'DIAMOND WT.'].map((filter) => (
        <div key={filter} className="border-b border-gray-200 pb-4">
          <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse" />
          
          {/* Filter Options Skeleton */}
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
            ))}
          </div>
        </div>
      ))}

      {/* Action Buttons Skeleton */}
      <div className="space-y-3 pt-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
    </div>
  );
}