'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Fragment } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { ChevronDown, RotateCcw, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import { addToCart } from '@/store/cartSlice';
import { toast } from 'react-toastify';

// Define Product type
interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
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
  diamondCaratWeight?: string; // This might be a string in the API
  diamondQuantity?: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 24;
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  // Fetch products based on search query
  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) {
        setProducts([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch products with pagination and authentication status
        const authParam = isAuthenticated ? '&auth=true' : '&auth=false';
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=${productsPerPage}&page=${currentPage}${authParam}`);
        const data = await response.json();

        if (data.success) {
          setProducts(data.data || []);
          setTotalProducts(data.total || 0);
          setTotalPages(data.pagination?.pages || 1);
        } else {
          setError(data.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, currentPage, isAuthenticated]);

  const toggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
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

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Kindly login to add items to cart');
      return;
    }
    dispatch(addToCart(product));
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center">Loading search results...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-red-500">Error: {error}</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header overlaying the hero image */}
      <Header />

      {/* Hero Section */}
      <div className="relative h-[60vh] w-full bg-gray-200">
        <div className="absolute inset-0 bg-black/30"></div>
        {/* Text Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-sans font-normal tracking-wide mb-4">
            Search Results
          </h1>
          <p className="text-lg md:text-xl font-light tracking-wider">
            {query ? `Results for "${query}"` : 'All Products'}
          </p>
        </div>
      </div>

      {/* Breadcrumb Bar */}
      <div className="bg-[#e6e6e6] py-3 text-center">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
          Home / <span className="text-gray-900">Search Results ({totalProducts})</span>
        </p>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-6">

          {/* Left Filters */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-normal text-gray-800 tracking-wide">Filters :</span>
              <button className="text-gray-800 hover:text-amber-600">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>

            {['SUB CATEGORY', 'COLLECTION', 'METAL WT.', 'DIAMOND WT.', 'ORDER TYPE'].map((filter) => (
              <div key={filter} className="relative group cursor-pointer">
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-amber-600 transition-colors">
                  {filter}
                  <ChevronDown className="h-3 w-3" />
                </div>
                {/* Underline effect */}
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gray-200 group-hover:bg-amber-600 transition-colors"></div>
              </div>
            ))}
          </div>

          {/* Right Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Sort by :</span>
            <button className="bg-[#e6e6e6] px-4 py-2 text-[10px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2 hover:bg-gray-300 transition-colors">
              StyleCode (Z-{'>'}A)
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="py-12">
          {/* Login Message */}
          {!isAuthenticated && (
            <div className="text-center mb-12">
              <p className="text-sm text-gray-600 tracking-wide">
                Please <Link href="/login" className="font-bold text-gray-900 hover:text-amber-600">login</Link> to see more products..
              </p>
            </div>
          )}

          {/* Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link key={product.id} href={`/jewelry/${product.category}/${product.id}`} className="group relative">
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden bg-gray-100 mb-2">
                    <Image
                      src={
                        product.images[0]?.url
                          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0].url}`
                          : product.imageUrl
                            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.imageUrl}`
                            : 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2070&auto=format&fit=crop'
                      }
                      alt={product.images[0]?.altText || product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-800 tracking-wide">{product.productCode}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="text-black hover:text-amber-600 transition-colors"
                        >
                          <ShoppingCart className="h-4 w-4" fill="black" />
                        </button>
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
                    </div>

                    <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-medium text-gray-600 tracking-wide">
                      <span>Gold: {product.goldWeight || 'N/A'}</span>
                      {product.diamondCaratWeight && <span>Dia. : {product.diamondCaratWeight} ct</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found for "{query}".</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-12">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, filteredPages) => (
                    <Fragment key={page}>
                      {index > 0 && filteredPages[index - 1] !== page - 1 && (
                        <span className="px-2 py-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === page
                          ? 'bg-amber-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    </Fragment>
                  ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}