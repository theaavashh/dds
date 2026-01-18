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
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showFilters, setShowFilters] = useState(false); // Track if filters should be shown
  const [activeFilter, setActiveFilter] = useState<string | null>(null); // Track active filter dropdown
  const [showMobileFilters, setShowMobileFilters] = useState(false); // Track mobile filter modal
  
  // State for filter values
  const [subCategoryFilter, setSubCategoryFilter] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);
  const [diamondWeightFilter, setDiamondWeightFilter] = useState<string | null>(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState<string | null>(null);
  const [durationFilter, setDurationFilter] = useState<string | null>(null); // Duration filter
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

      // Build query parameters
      const queryParams = new URLSearchParams({
        category: encodeURIComponent(normalizedCategory),
        page: currentPage.toString(),
        limit: productsPerPage.toString(),
        auth: isAuthenticated ? 'true' : 'false'
      });
      
      // Add filter parameters if they exist
      if (subCategoryFilter) queryParams.append('subCategory', subCategoryFilter);
      if (collectionFilter) queryParams.append('collection', collectionFilter);
      if (diamondWeightFilter) queryParams.append('diamondWeight', diamondWeightFilter);
      if (orderTypeFilter) queryParams.append('orderType', orderTypeFilter);
      if (durationFilter) queryParams.append('duration', durationFilter); // Add duration filter
      if (metalWeightRange[0] !== 0 || metalWeightRange[1] !== 100) {
        queryParams.append('minMetalWeight', metalWeightRange[0].toString());
        queryParams.append('maxMetalWeight', metalWeightRange[1].toString());
      }
      
      const response = await fetch(`/api/products?${queryParams.toString()}`);
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

  // Effect to fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [
    params.category, 
    currentPage, 
    isAuthenticated, 
    subCategoryFilter ?? null, 
    collectionFilter ?? null, 
    diamondWeightFilter ?? null, 
    orderTypeFilter ?? null, 
    durationFilter ?? null, // Add duration filter to dependency array
    metalWeightRange?.[0] ?? 0, 
    metalWeightRange?.[1] ?? 100
  ]);

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
      case 'EARRING':
        return {
           title: 'Earrings',
          subtitle: 'Graceful accessories for every occasion',
          image: '/earring-large.jpeg',
          mobileImage: '/earring-small.jpeg'
        
        };
      case 'NECKLACE':
        return {
          title: 'Ladies Bracelets',
          subtitle: 'Graceful accessories for every occasion',
          image: '/necklace-small.jpeg',
          mobileImage: '/necklace-large.jpeg'
          
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
      case 'MEN BRACELET':
        return {
          title: 'Mens Bracelets',
          subtitle: 'Sophisticated wristwear for the modern man',
          image: '/menbracelet.jpg',
          mobileImage: '/menbracelet.jpg'
        };
      case 'LADIES BRACELET':
        return {
          title: 'Ladies Bracelets',
          subtitle: 'Graceful accessories for every occasion',
          image: '/ladiesbracelet.jpg',
          mobileImage: '/ladiesbracelet.jpg'
        };
      default:
        return {
          image: '/pendant-main-large.jpeg',
          mobileImage: '/pendant-category.jpeg'
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
        {/* Mobile/Tablet Image */}
        <Image
          src={heroContent.mobileImage || heroContent.image || '/default-hero-image.jpg'}
          alt={heroContent.title || 'Jewelry Category'}
          fill
          className="object-cover object-top lg:hidden"
          priority
        />
        {/* Desktop Image */}
        <Image
          src={heroContent.image || '/default-hero-image.jpg'}
          alt={heroContent.title || 'Jewelry Category'}
          fill
          className="object-cover object-top hidden lg:block"
          priority
        />
        
        
      </div>

      {/* Breadcrumb Bar */}
      <div className="bg-[#e6e6e6] py-3 text-center">
        <p className="text-xs font-semibold tan-agean text-gray-600 uppercase tracking-widest">
          Home / <span className="text-gray-900">{category}({totalProducts})</span>
        </p>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 pb-6">

          {/* Mobile Filter Button - Also shown on desktop */}
          <button 
            className="flex items-center gap-2 text-lg text-black font-medium"
            onClick={() => {
              setShowMobileFilters(true);
              setActiveFilter(null);
            }}
          >
            <span>Filters</span>
            <RotateCcw className="h-5 w-5" />
          </button>

          {/* Right Sort */}
          <div className="flex items-center gap-2 relative z-30 ml-auto">
            <span className="text-lg font-medium uppercase text-black">Sort by :</span>
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

        {/* Filter Modal - Available for all screen sizes */}
        <AnimatePresence>
          {showMobileFilters && (
            <div className="fixed inset-0 z-50">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
              />
              
              {/* Filter Panel - slides from left */}
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 2 }}
                className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl p-6 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button 
                    onClick={() => {
                      // Reset all filters
                      setSubCategoryFilter(null);
                      setCollectionFilter(null);
                      setDiamondWeightFilter(null);
                      setOrderTypeFilter(null);
                      setMetalWeightRange([0, 100]);
                      setShowMobileFilters(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Reset
                  </button>
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
                  <div className="border-b border-gray-200 pb-4">
                    <button 
                      className="flex justify-between items-center w-full text-left font-semibold text-black uppercase"
                      onClick={() => setActiveFilter(activeFilter === 'SUB CATEGORY' ? null : 'SUB CATEGORY')}
                    >
                      <span>SUB CATEGORY</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${activeFilter === 'SUB CATEGORY' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Filter Options */}
                    <div className={`mt-2 overflow-hidden transition-all duration-300 ${activeFilter === 'SUB CATEGORY' ? 'max-h-96' : 'max-h-0'}`}>
                      <div className="pt-2 space-y-2">
                        {['Earrings', 'Necklaces', 'Rings', 'Bracelets'].map((subcat) => (
                          <button
                            key={subcat}
                            onClick={() => {
                              setSubCategoryFilter(subcat === subCategoryFilter ? null : subcat);
                              setShowMobileFilters(false);
                            }}
                            className={`block w-full text-left px-2 py-1 text-sm ${subCategoryFilter === subcat ? 'text-amber-600 font-bold' : 'text-gray-700'} hover:bg-gray-50 transition-colors`}
                          >
                            {subcat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Collection */}
                  <div className="border-b border-gray-200 pb-4">
                    <button 
                      className="flex justify-between items-center w-full text-left font-semibold text-black uppercase"
                      onClick={() => setActiveFilter(activeFilter === 'COLLECTION' ? null : 'COLLECTION')}
                    >
                      <span>COLLECTION</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${activeFilter === 'COLLECTION' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div className={`mt-2 overflow-hidden transition-all duration-300 ${activeFilter === 'COLLECTION' ? 'max-h-96' : 'max-h-0'}`}>
                      <div className="pt-2 space-y-2">
                        {['Classic', 'Modern', 'Vintage', 'Designer'].map((collection) => (
                          <button
                            key={collection}
                            onClick={() => {
                              setCollectionFilter(collection === collectionFilter ? null : collection);
                              setShowMobileFilters(false);
                            }}
                            className={`block w-full text-left px-2 py-1 text-sm ${collectionFilter === collection ? 'text-amber-600 font-bold' : 'text-gray-700'} hover:bg-gray-50 transition-colors`}
                          >
                            {collection}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Metal Weight */}
                  <div className="border-b border-gray-200 pb-4">
                    <button 
                      className="flex justify-between items-center w-full text-left font-semibold text-black uppercase"
                      onClick={() => setActiveFilter(activeFilter === 'METAL WT.' ? null : 'METAL WT.')}
                    >
                      <span>METAL WT.</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${activeFilter === 'METAL WT.' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div className={`mt-2 overflow-hidden transition-all duration-300 ${activeFilter === 'METAL WT.' ? 'max-h-96' : 'max-h-0'}`}>
                      <div className="pt-2">
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                          <span>{metalWeightRange[0]}</span>
                          <span>{metalWeightRange[1]}</span>
                        </div>
                        <Slider
                          range
                          min={0}
                          max={100}
                          defaultValue={[10, 60]}
                          value={metalWeightRange}
                          onChange={(value) => {
                            setMetalWeightRange(value as [number, number]);
                            setShowMobileFilters(false);
                          }}
                          trackStyle={[{ backgroundColor: '#d97706', height: 4 }]}
                          handleStyle={[
                            { borderColor: '#d97706', backgroundColor: '#d97706', opacity: 1 },
                            { borderColor: '#d97706', backgroundColor: '#d97706', opacity: 1 },
                          ]}
                          railStyle={{ backgroundColor: '#e5e7eb', height: 4 }}
                        />
                        <div className="mt-2 flex justify-between items-center text-[10px] text-gray-400">
                          <span>Min: 0g</span>
                          <span>Max: 100g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Diamond Weight */}
                  <div className="border-b border-gray-200 pb-4">
                    <button 
                      className="flex justify-between items-center w-full text-left font-semibold text-black uppercase"
                      onClick={() => setActiveFilter(activeFilter === 'DIAMOND WT.' ? null : 'DIAMOND WT.')}
                    >
                      <span>DIAMOND WT.</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${activeFilter === 'DIAMOND WT.' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div className={`mt-2 overflow-hidden transition-all duration-300 ${activeFilter === 'DIAMOND WT.' ? 'max-h-96' : 'max-h-0'}`}>
                      <div className="pt-2 space-y-2">
                        {['0.5ct - 1ct', '1ct - 2ct', '2ct - 3ct', '3ct+'].map((weight) => (
                          <button
                            key={weight}
                            onClick={() => {
                              setDiamondWeightFilter(weight === diamondWeightFilter ? null : weight);
                              setShowMobileFilters(false);
                            }}
                            className={`block w-full text-left px-2 py-1 text-sm ${diamondWeightFilter === weight ? 'text-amber-600 font-bold' : 'text-gray-700'} hover:bg-gray-50 transition-colors`}
                          >
                            {weight}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Type */}
                  <div className="pb-4">
                    <button 
                      className="flex justify-between items-center w-full text-left font-semibold text-black uppercase"
                      onClick={() => setActiveFilter(activeFilter === 'ORDER TYPE' ? null : 'ORDER TYPE')}
                    >
                      <span>ORDER TYPE</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${activeFilter === 'ORDER TYPE' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div className={`mt-2 overflow-hidden transition-all duration-300 ${activeFilter === 'ORDER TYPE' ? 'max-h-96' : 'max-h-0'}`}>
                      <div className="pt-2 space-y-2">
                        {['Ready to Ship', 'Made to Order', 'Pre-order'].map((orderType) => (
                          <button
                            key={orderType}
                            onClick={() => {
                              setOrderTypeFilter(orderType === orderTypeFilter ? null : orderType);
                              setShowMobileFilters(false);
                            }}
                            className={`block w-full text-left px-2 py-1 text-sm ${orderTypeFilter === orderType ? 'text-amber-600 font-bold' : 'text-gray-700'} hover:bg-gray-50 transition-colors`}
                          >
                            {orderType}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Apply Filters Button */}
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full bg-black text-white py-3 rounded uppercase font-bold tracking-widest hover:bg-amber-600 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="py-12">
          {/* Login Message */}
          {!isAuthenticated && (
            <div className="text-center mb-12">
              <p className="text-sm text-black tracking-wide">
                Please <Link href="/login" className="font-bold text-gray-900 hover:text-amber-600">login</Link> to see more products..
              </p>
            </div>
          )}

          {/* Personalized Items Section for Authenticated Users */}
          {isAuthenticated && (
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">Items You've Added</h2>
                <Link href="/my-items" className="text-amber-600 hover:text-amber-800 font-medium">
                  See More &gt;
                </Link>
              </div>
              {/* Show user's favorite/wishlist items */}
              {wishlistItems.length > 0 ? (
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {wishlistItems.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        router.push(`/jewelry/${params.category}/${product.id}`);
                      }}
                      className="group relative cursor-pointer"
                    >
                      {/* Image */}
                      <div className="aspect-square relative overflow-hidden bg-gray-100 mb-2">
                        <Image
                          src={
                            product.images && product.images[0]?.url
                              ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0].url}`
                              : product.imageUrl
                                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.imageUrl}`
                                : 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2070&auto=format&fit=crop'
                          }
                          alt={product.images && product.images[0]?.altText || product.name}
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
                                fill="red" // Always red since it's in wishlist
                                color="red"
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
                <p className="text-gray-600 text-center py-8">You haven't added any items yet. Start browsing and save your favorites!</p>
              )}
            </div>
          )}

          {/* Regular Product Grid */}
          {products.length > 0 ? (
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
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