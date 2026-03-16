'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import { addToCart } from '@/store/cartSlice';
import { toast } from 'react-toastify';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  category: string;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  isAuthenticated: boolean;
}

export default function ProductGridClient({
  products,
  category,
  totalProducts,
  currentPage: initialPage,
  totalPages: initialTotalPages,
  isAuthenticated
}: ProductGridProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [subCategoryFilter, setSubCategoryFilter] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);
  const [diamondWeightFilter, setDiamondWeightFilter] = useState<string | null>(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState<string | null>(null);
  const [metalWeightRange, setMetalWeightRange] = useState<[number, number]>([0, 100]);
  const [sortBy, setSortBy] = useState('StyleCode (Z->A)');

  const toggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Kindly login to add items to wishlist');
      return;
    }

    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.info('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist');
    }
  };

  const handlePageChange = (page: number) => {
    setLoading(true);
    setCurrentPage(page);
    // Update URL with new page
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
    setLoading(false);
  };

  return (
    <>
      {/* Filter Button */}
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 pb-6">
        <div className="flex-1">
          <p className="text-gray-600">
            Showing {products.length} of {totalProducts} products
          </p>
        </div>
        <button
          className="flex items-center gap-2 text-lg text-black font-medium"
          onClick={() => setShowMobileFilters(true)}
        >
          <span>Filter & Sort</span>
        </button>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Filter Options */}
              <div className="space-y-6">
                {/* Sub Category */}
                <FilterSection
                  title="SUB CATEGORY"
                  isActive={activeFilter === 'SUB CATEGORY'}
                  onToggle={() => setActiveFilter(activeFilter === 'SUB CATEGORY' ? null : 'SUB CATEGORY')}
                >
                  {['Earrings', 'Necklaces', 'Rings', 'Bracelets'].map((subcat) => (
                    <button
                      key={subcat}
                      onClick={() => setSubCategoryFilter(subcat === subCategoryFilter ? null : subcat)}
                      className={`block w-full text-left px-2 py-1 text-sm ${
                        subCategoryFilter === subcat ? 'text-amber-600 font-bold' : 'text-gray-700'
                      } hover:bg-gray-50 transition-colors`}
                    >
                      {subcat}
                    </button>
                  ))}
                </FilterSection>

                {/* Collection */}
                <FilterSection
                  title="COLLECTION"
                  isActive={activeFilter === 'COLLECTION'}
                  onToggle={() => setActiveFilter(activeFilter === 'COLLECTION' ? null : 'COLLECTION')}
                >
                  {['Classic', 'Modern', 'Vintage', 'Designer'].map((collection) => (
                    <button
                      key={collection}
                      onClick={() => setCollectionFilter(collection === collectionFilter ? null : collection)}
                      className={`block w-full text-left px-2 py-1 text-sm ${
                        collectionFilter === collection ? 'text-amber-600 font-bold' : 'text-gray-700'
                      } hover:bg-gray-50 transition-colors`}
                    >
                      {collection}
                    </button>
                  ))}
                </FilterSection>

                {/* Sort By */}
                <FilterSection
                  title="SORT BY"
                  isActive={activeFilter === 'SORT'}
                  onToggle={() => setActiveFilter(activeFilter === 'SORT' ? null : 'SORT')}
                >
                  {[
                    'StyleCode (Z->A)',
                    'StyleCode (A->Z)',
                    'Metal Wt : Low to High',
                    'Metal Wt : High to Low',
                    'New Arrivals'
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={`block w-full text-left px-2 py-1 text-sm ${
                        sortBy === option ? 'text-amber-600 font-bold' : 'text-gray-700'
                      } hover:bg-gray-50 transition-colors`}
                    >
                      {option}
                    </button>
                  ))}
                </FilterSection>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-[#DFC9FE] text-black py-3 rounded uppercase font-bold tracking-widest hover:bg-[#c9b4e8] transition-colors mt-8"
              >
                Apply Filters
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 mt-8">
          {products.map((product) => (
            <article
              key={product.id}
              onClick={() => router.push(`/jewelry/${category}/${product.id}`)}
              className="group relative cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                <Image
                  src={product.images[0]?.url || product.imageUrl || '/placeholder.jpg'}
                  alt={product.images[0]?.altText || product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Info */}
              <div className="space-y-2 pt-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-bold text-gray-800 tracking-wide truncate flex-1">
                    {product.name}
                  </h3>
                  <button
                    onClick={(e) => toggleWishlist(e, product)}
                    className="text-black hover:text-amber-600 transition-colors"
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={wishlistItems.some(item => item.id === product.id) ? "red" : "none"}
                      color={wishlistItems.some(item => item.id === product.id) ? "red" : "black"}
                    />
                  </button>
                </div>
                {product.price > 0 && (
                  <p className="text-amber-600 font-semibold">
                    ${product.price.toLocaleString()}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters or browse other categories.</p>
        </div>
      )}

      {/* Pagination */}
      {initialTotalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-16">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full disabled:opacity-30"
          >
            ←
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: initialTotalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === initialTotalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium ${
                    currentPage === page
                      ? 'bg-[#DFC97E] text-black'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
          </div>

          <button
            onClick={() => handlePageChange(Math.min(initialTotalPages, currentPage + 1))}
            disabled={currentPage === initialTotalPages}
            className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full disabled:opacity-30"
          >
            →
          </button>
        </div>
      )}
    </>
  );
}

// Filter Section Component
function FilterSection({ 
  title, 
  isActive, 
  onToggle, 
  children 
}: { 
  title: string; 
  isActive: boolean; 
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        className="flex justify-between items-center w-full text-left font-semibold text-black uppercase"
        onClick={onToggle}
      >
        <span>{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isActive ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isActive ? 'auto' : 0,
          opacity: isActive ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pt-2 space-y-2">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
