'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import { addToCart } from '@/store/cartSlice';
import { toast } from 'react-toastify';

// Define Product type
interface Product {
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
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();

  // Get authentication state from Redux
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  // Fetch product based on ID (only if authenticated)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Use the API URL from environment variables or default to /api
        const response = await fetch(`/api/products/${params.productId}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.data);
        } else {
          setError(data.message || 'Failed to fetch product');
        }
      } catch (err) {
        setError('Failed to fetch product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch product if user is authenticated
    if (isAuthenticated && params.productId) {
      fetchProduct();
    } else if (!isAuthenticated) {
      // Don't show loading state for unauthenticated users
      setLoading(false);
    }
  }, [params.productId, params.category, isAuthenticated]);

  // Navigation functions for image gallery
  const goToPreviousImage = () => {
    if (!product) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? (product.images.length - 1) : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === (product.images.length - 1) ? 0 : prevIndex + 1
    );
  };

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const toggleWishlist = () => {
    if (!product) return;
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

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'inc') {
      setQuantity(prev => prev + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center">Loading product details...</p>
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
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-32 ">
        {/* Enhanced Breadcrumb */}
        <nav className="mb-8 text-xl" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-black hover:text-amber-600 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href={`/jewelry/${params.category}`} className="text-black hover:text-amber-600 capitalize transition-colors">
                {params.category as string}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium truncate max-w-xs">
              {product?.name || 'Product Details'}
            </li>
          </ol>
        </nav>

        {/* Show login message if user is not authenticated */}
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login to View Product Details</h2>
              <p className="text-gray-600 mb-8">
                You need to be logged in to view the full product details and specifications.
              </p>
              <Link
                href="/login"
                className="inline-block bg-amber-600 text-white px-6 py-3 rounded-md font-medium hover:bg-amber-700 transition-colors"
              >
                Login to Continue
              </Link>
            </div>
          </div>
        ) : (
          // Show product details if user is authenticated and product exists
          product ? (
            <>
              {/* Product Detail */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Gallery - Left Column */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <>
                        <motion.div
                          initial={{ clipPath: 'inset(100% 0 0 0)' }}
                          whileInView={{ clipPath: 'inset(0 0 0 0)' }}
                          transition={{
                            duration: 2,
                            ease: [0.34, 1.56, 0.64, 1],
                          }}
                          viewport={{ once: false }}
                          className="relative w-full h-full"
                        >
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[currentImageIndex]?.url}`}
                            alt={product.images[currentImageIndex]?.altText || product.name}
                            fill
                            className="object-contain"
                          />
                        </motion.div>
                        {/* Navigation Arrows */}
                        {product.images.length > 1 && (
                          <>
                            <button
                              onClick={goToPreviousImage}
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                            >
                              <ChevronLeft className="h-5 w-5 text-gray-800" />
                            </button>
                            <button
                              onClick={goToNextImage}
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                            >
                              <ChevronRight className="h-5 w-5 text-gray-800" />
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500">No image available</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto py-2">
                      {product.images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => handleThumbnailClick(index)}
                          className={`relative aspect-square w-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? 'border-amber-600' : 'border-gray-200'
                            }`}
                        >
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${image.url}`}
                            alt={image.altText || product.name}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details - Right Column */}
                <div className="space-y-6">
                  {/* Product Name and Code */}
                  <div>
                    <h1 className="text-3xl text-black mb-2 title-regular">{product.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xl text-black">Style Code:</span>
                      <span className="font-medium">{product.productCode}</span>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="pt-4 space-y-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-medium text-black uppercase tracking-wider">Quantity :</span>
                      <div className="flex items-center border border-black rounded-sm overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange('dec')}
                          className="px-4 py-2 hover:bg-gray-100 transition-colors border-r border-black font-bold h-10 w-10 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="px-6 py-2 font-medium min-w-[60px] text-center h-10 flex items-center justify-center">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange('inc')}
                          className="px-4 py-2 hover:bg-gray-100 transition-colors border-l border-black font-bold h-10 w-10 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={(e) => {
                          if (!isAuthenticated) {
                            toast.error('Kindly login to add items to cart');
                            return;
                          }
                          dispatch(addToCart({ ...product, quantity }));
                          toast.success(`${quantity} item(s) added to cart`);
                        }}
                        className="flex-1 bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-amber-600 transition-all duration-300 flex items-center justify-center gap-3 group"
                      >
                        <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        Add to Cart
                      </button>
                      <button
                        onClick={toggleWishlist}
                        className={`flex-1 px-8 py-4 rounded-full font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 border-2 ${wishlistItems.some(item => item.id === product.id)
                          ? 'border-red-500 text-red-500 bg-red-50'
                          : 'border-black text-black hover:bg-gray-50'
                          }`}
                      >
                        <Heart
                          className={`h-5 w-5 ${wishlistItems.some(item => item.id === product.id) ? 'fill-current' : ''}`}
                        />
                        {wishlistItems.some(item => item.id === product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Specifications - moved to bottom for better layout */}
              <div className="mt-12">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Basic Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-black">Metal Type</span>
                        <span className="font-medium">{product.metalType || '-'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Metal Color</span>
                        <span className="font-medium">{product.goldType || '-'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Size</span>
                        <span className="font-medium">Free Size</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Quantity</span>
                        <span className="font-medium">{product.stock > 0 ? product.stock : 'Out of Stock'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Product Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-black">Purity</span>
                        <span className="font-medium">{product.goldPurity || '-'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Gold Net Weight</span>
                        <span className="font-medium">{product.goldWeight || '-'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Color Stone</span>
                        <span className="font-medium">{product.stoneType || '-'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Size</span>
                        <span className="font-medium">Free Size</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Gross Weight</span>
                        <span className="font-medium">{product.grossWeight || product.goldWeight || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Diamond Details */}
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Diamond Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-black">Diamond Quality</span>
                        <span className="font-medium">{product.diamondClarityGrade || '-'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Diamond Color</span>
                        <span className="font-medium">{product.diamondColorGrade || '-'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Diamond Count</span>
                        <span className="font-medium">{product.diamondQuantity || '-'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Diamond Shape</span>
                        <span className="font-medium">{product.diamondShapeCut || '-'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Diamond Weight</span>
                        <span className="font-medium">{product.diamondCaratWeight ? `${product.diamondCaratWeight} ct` : '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                    <div className="text-black prose max-w-none">
                      {product.fullDescription ? (
                        <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
                      ) : product.description ? (
                        <p>{product.description}</p>
                      ) : (
                        <p>No description available.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Show product not found message if authenticated but no product
            <div className="text-center py-12">
              <p className="text-gray-600">Product not found.</p>
            </div>
          )
        )}
      </div>
      <Footer />
    </main>
  );
}