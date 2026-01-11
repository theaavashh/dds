'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, Fragment } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { ChevronDown, RotateCcw, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import { addToCart } from '@/store/cartSlice';

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

export default function ProductCategory() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const category = (params.category as string).toUpperCase();
  const [metalWeightRange, setMetalWeightRange] = useState<[number, number]>([0, 100]);
  const [sortBy, setSortBy] = useState('StyleCode (Z->A)');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 24;

  // Debug log to check if env variable is available
  useEffect(() => {
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  }, []);

  // Fetch products based on category
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let normalizedCategory = params.category as string;

      if (normalizedCategory.toLowerCase() === 'pendant') {
        normalizedCategory = 'Pendent';
      }

      const authParam = isAuthenticated ? '&auth=true' : '&auth=false';
      const response = await fetch(`/api/products?category=${encodeURIComponent(normalizedCategory)}&page=${currentPage}&limit=${productsPerPage}${authParam}`);
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

  useEffect(() => {
    fetchProducts();
  }, [params.category, currentPage, isAuthenticated]);

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

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Kindly login to add items to cart');
      return;
    }
    dispatch(addToCart(product));
    toast.success('Added to cart');
  };

  // Determine hero content based on category
  const getHeroContent = () => {
    switch (category) {
      case 'EARRINGS':
        return {
          title: 'Dazzling Earrings',
          subtitle: 'Earring to your loved ones',
          image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2070&auto=format&fit=crop'
        };
      case 'NECKLACE':
        return {
          title: 'Stunning Necklaces',
          subtitle: 'Adorn your neck with elegance',
          image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=2070&auto=format&fit=crop'
        };
      case 'RING':
      case 'RINGS':
        return {
          title: 'Exquisite Rings',
          subtitle: 'Symbolize your eternal love',
          image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070&auto=format&fit=crop'
        };
      case 'BRACELET':
      case 'BRACELETS':
        return {
          title: 'Elegant Bracelets',
          subtitle: 'Wrap your wrist in luxury',
          image: 'https://images.unsplash.com/photo-1611926328876-40fc2c8e7d75?q=80&w=2070&auto=format&fit=crop'
        };
      default:
        return {
          title: `Dazzling ${category}`,
          subtitle: `${category} to your loved ones`,
          image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2070&auto=format&fit=crop'
        };
    }
  };

  const heroContent = getHeroContent();

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center">Loading products...</p>
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
        <Image
          src={heroContent.image}
          alt={heroContent.title}
          fill
          className="object-cover object-top"
          priority
        />
        {/* Text Overlay */}
        <div className="absolute top-1/2 right-10 transform -translate-y-1/2 text-right text-white pr-10">
          <h1 className="text-4xl md:text-5xl font-sans font-normal tracking-wide mb-4">
            {heroContent.title}
          </h1>
          <div className="w-16 h-0.5 bg-white ml-auto mb-4"></div>
          <p className="text-lg md:text-xl font-light tracking-wider">
            {heroContent.subtitle}
          </p>
        </div>
      </div>

      {/* Breadcrumb Bar */}
      <div className="bg-[#e6e6e6] py-3 text-center">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
          Home / <span className="text-gray-900">{category}({totalProducts})</span>
        </p>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-6">


          {/* Left Filters */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg text-black font-bold cabinet ">Filters :</span>
              <button className="text-gray-800 hover:text-amber-600">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>

            {['SUB CATEGORY', 'COLLECTION', 'METAL WT.', 'DIAMOND WT.', 'ORDER TYPE'].map((filter) => (
              <div key={filter} className="relative group z-20">
                <div className="flex items-center gap-1 text-md font-semibold text-black cabinet uppercase hover:text-amber-600 transition-colors cursor-pointer py-2">
                  {filter}
                  <ChevronDown className="h-3 w-3" />
                </div>
                {/* Underline effect */}
                <div className="absolute bottom-1 left-0 w-8 h-0.5 bg-gray-200 group-hover:bg-amber-600 transition-colors"></div>

                {/* Dropdown for Metal Weight */}
                {filter === 'METAL WT.' && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-xl border border-gray-100 p-6 rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="flex justify-between text-xs font-bold text-gray-600 mb-4">
                      <span>{metalWeightRange[0]}</span>
                      <span>{metalWeightRange[1]}</span>
                    </div>
                    <Slider
                      range
                      min={0}
                      max={100}
                      defaultValue={[10, 60]}
                      value={metalWeightRange}
                      onChange={(value) => setMetalWeightRange(value as [number, number])}
                      trackStyle={[{ backgroundColor: '#d97706', height: 4 }]}
                      handleStyle={[
                        { borderColor: '#d97706', backgroundColor: '#d97706', opacity: 1 },
                        { borderColor: '#d97706', backgroundColor: '#d97706', opacity: 1 },
                      ]}
                      railStyle={{ backgroundColor: '#e5e7eb', height: 4 }}
                    />
                    <div className="mt-4 flex justify-between items-center text-[10px] text-gray-400">
                      <span>Min: 0g</span>
                      <span>Max: 100g</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Sort */}
          <div className="flex items-center gap-2 relative z-30">
            <span className="text-lg font-bold cabinet uppercase text-black">Sort by :</span>
            <div className="relative group">
              <button className="bg-[#e6e6e6] px-4 py-2 text-[15px] font-bold text-black uppercase  flex items-center gap-2 hover:bg-gray-300 transition-colors w-48 justify-between">
                <span>{sortBy}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full text-black text-xs mt-1 w-full bg-white shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {[
                  'StyleCode (Z->A)',
                  'Metal Wt : Low to High',
                  'Metal Wt : High to Low',
                  'Dia. Wt : Low to High',
                  'Dia. Wt : High to Low',
                  'StyleCode (A->Z)',
                  'New Arrivals'
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`nav-item w-full text-left px-4 text-xs font-bold uppercase text-black hover:bg-gray-50 transition-colors ${sortBy === option ? 'text-amber-600 bg-gray-50' : 'text-gray-600'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
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
                <div
                  key={product.id}
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Kindly login to proceed further');
                      return;
                    }
                    router.push(`/jewelry/${params.category}/${product.id}`);
                  }}
                  className="group relative cursor-pointer"
                >
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
                      onLoad={() => console.log('Image loaded successfully')}
                      onError={(e) => {
                        console.log('Image failed to load:', e);
                        console.log('Generated URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0]?.url}`);
                      }}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found in this category.</p>
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