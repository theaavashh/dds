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
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationForm, setQuotationForm] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+91',
    message: '',
    preferredContact: 'email' as 'email' | 'whatsapp' | 'call'
  });
  const dispatch = useDispatch();

  // Get authentication state from Redux
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  // Fetch product based on ID (allow for all users)
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

    // Fetch product for all users (authenticated or not)
    if (params.productId) {
      fetchProduct();
    }
  }, [params.productId, params.category]);

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
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-black font-bold hover:text-amber-600 tan-agean transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href={`/jewelry/${params.category}`} className="text-black font-bold hover:text-amber-600 tan-agean capitalize transition-colors">
                {params.category as string}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-bold tan-agean truncate max-w-xs">
              {product?.name || 'Product Details'}
            </li>
          </ol>
        </nav>

        {/* Show product details for everyone */}
        {product ? (
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
                  <h1 className="text-3xl text-black mb-2 font-bold tan-agean">{product.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl md:text-2xl text-black">Product Code:</span>
                    <span className="text-lg md:text-xl font-medium">{product.productCode}</span>
                  </div>
                </div>

               


                <div className="mt-12">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-bold tan-agean text-gray-900 mb-3">Basic Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-lg">
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
                      <span className="font-medium">{product.size || '-'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-black">Quantity</span>
                      <span className="font-medium">{product.stock > 0 ? product.stock : 'Out of Stock'}</span>
                    </div>


                    <div className="flex justify-between">
                      <span className="text-black">Gross Weight</span>
                      <span className="font-medium">{product.grossWeight || '-'}</span>
                    </div>


                  </div>
                </div>

                {/* Product Details
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900 tan-agean mb-3">Product Details</h2>
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
                </div> */}


                {!isAuthenticated && (
                  <div className="border-b border-gray-200 pb-4 ">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 tan-agean">Diamond Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xl">

                      <div className="flex justify-between">
                        <span className="text-black">Diamond Color</span>
                        <span className="font-medium">{product.diamondColorGrade || '-'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Diamond Clarity</span>
                        <span className="font-medium">{product.diamondClarityGrade || '-'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black">Diamond Cut</span>
                        <span className="font-medium">{product.diamondShapeCut || '-'}</span>
                      </div>

                     
                    </div>
                  </div>
                )}


                

                {/* Diamond Details - Only for authenticated users */}
                {isAuthenticated && (
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
                )}

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold text-black tan-agean mb-3">Description</h2>
                  <div className="text-black prose max-w-none text-xl">
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
                        dispatch(addToCart({ ...product, quantity }));
                        toast.success(`${quantity} item(s) added to cart`);
                      }}
                      className="flex-1 bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-amber-600 transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      Add to Cart
                    </button>
                    
                    {/* Show Wishlist button only for authenticated users */}
                    {isAuthenticated && (
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
                    )}
                  </div>

                  {/* Get Price Quotation Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setShowQuotationModal(true);
                      }}
                      className="w-full bg-amber-600 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-amber-700 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <span>Get Price Quotation</span>
                    </button>
                  </div>
                </div>




                
              </div>
            </div>

            {/* Product Specifications - moved to bottom for better layout */}
          
          </>
        ) : (
          // Show product not found message
          <div className="text-center py-12">
            <p className="text-gray-600">Product not found.</p>
          </div>
        )}
      </div>

      {/* Price Quotation Modal */}
      {showQuotationModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50"></div>
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl"
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 tan-agean">Get Price Quotation</h3>
                <button
                  onClick={() => setShowQuotationModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                // TODO: Implement quotation submission logic
                console.log('Quotation form submitted:', {
                  ...quotationForm,
                  product: {
                    name: product?.name,
                    code: product?.productCode,
                    category: product?.category
                  }
                });
                toast.success('Quotation request submitted successfully!');
                setShowQuotationModal(false);
                setQuotationForm({ 
                  name: '', 
                  email: '', 
                  phone: '', 
                  countryCode: '+91',
                  message: '',
                  preferredContact: 'email'
                });
              }}>
                <div className="space-y-6">
                  {/* Product Information */}
                  {product && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-black mb-3">Product Details</h4>
                      <div className="flex gap-4">
                        {/* Product Image */}
                        {product.images && product.images.length > 0 && (
                          <div className="flex-shrink-0">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden">
                              <Image
                                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0].url}`}
                                alt={product.images[0].altText || product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                        {/* Product Details */}
                        <div className="flex-1 space-y-1 text-sm">
                          <p><span className="font-medium">Name:</span> {product.name}</p>
                          <p><span className="font-medium">Code:</span> {product.productCode}</p>
                          <p><span className="font-medium">Category:</span> {product.category}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={quotationForm.name}
                      onChange={(e) => setQuotationForm({...quotationForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={quotationForm.email}
                      onChange={(e) => setQuotationForm({...quotationForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  {/* Phone with Country Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <div className="flex gap-2">
                      <select
                        value={quotationForm.countryCode}
                        onChange={(e) => setQuotationForm({...quotationForm, countryCode: e.target.value})}
                        className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="+93">🇦🇫 Afghanistan (+93)</option>
                        <option value="+355">🇦🇱 Albania (+355)</option>
                        <option value="+213">🇩🇿 Algeria (+213)</option>
                        <option value="+1">🇺🇸 American Samoa (+1)</option>
                        <option value="+376">🇦🇩 Andorra (+376)</option>
                        <option value="+244">🇦🇴 Angola (+244)</option>
                        <option value="+1">🇦🇮 Anguilla (+1)</option>
                        <option value="+672">🇦🇶 Antarctica (+672)</option>
                        <option value="+1">🇦🇬 Antigua and Barbuda (+1)</option>
                        <option value="+54">🇦🇷 Argentina (+54)</option>
                        <option value="+374">🇦🇲 Armenia (+374)</option>
                        <option value="+297">🇦🇼 Aruba (+297)</option>
                        <option value="+61">🇦🇺 Australia (+61)</option>
                        <option value="+43">🇦🇹 Austria (+43)</option>
                        <option value="+994">🇦🇿 Azerbaijan (+994)</option>
                        <option value="+1">🇧🇸 Bahamas (+1)</option>
                        <option value="+973">🇧🇭 Bahrain (+973)</option>
                        <option value="+880">🇧🇩 Bangladesh (+880)</option>
                        <option value="+1">🇧🇧 Barbados (+1)</option>
                        <option value="+375">🇧🇾 Belarus (+375)</option>
                        <option value="+32">🇧🇪 Belgium (+32)</option>
                        <option value="+501">🇧🇿 Belize (+501)</option>
                        <option value="+229">🇧🇯 Benin (+229)</option>
                        <option value="+1">🇧🇲 Bermuda (+1)</option>
                        <option value="+975">🇧🇹 Bhutan (+975)</option>
                        <option value="+591">🇧🇴 Bolivia (+591)</option>
                        <option value="+387">🇧🇦 Bosnia and Herzegovina (+387)</option>
                        <option value="+267">🇧🇼 Botswana (+267)</option>
                        <option value="+55">🇧🇷 Brazil (+55)</option>
                        <option value="+246">🇮🇴 British Indian Ocean Territory (+246)</option>
                        <option value="+1">🇻🇬 British Virgin Islands (+1)</option>
                        <option value="+673">🇧🇳 Brunei (+673)</option>
                        <option value="+359">🇧🇬 Bulgaria (+359)</option>
                        <option value="+226">🇧🇫 Burkina Faso (+226)</option>
                        <option value="+257">🇧🇮 Burundi (+257)</option>
                        <option value="+855">🇰🇭 Cambodia (+855)</option>
                        <option value="+237">🇨🇲 Cameroon (+237)</option>
                        <option value="+1">🇨🇦 Canada (+1)</option>
                        <option value="+238">🇨🇻 Cape Verde (+238)</option>
                        <option value="+1">🇰🇾 Cayman Islands (+1)</option>
                        <option value="+236">🇨🇫 Central African Republic (+236)</option>
                        <option value="+235">🇹🇩 Chad (+235)</option>
                        <option value="+56">🇨🇱 Chile (+56)</option>
                        <option value="+86">🇨🇳 China (+86)</option>
                        <option value="+61">🇨🇽 Christmas Island (+61)</option>
                        <option value="+61">🇨🇨 Cocos Islands (+61)</option>
                        <option value="+57">🇨🇴 Colombia (+57)</option>
                        <option value="+269">🇰🇲 Comoros (+269)</option>
                        <option value="+682">🇨🇰 Cook Islands (+682)</option>
                        <option value="+506">🇨🇷 Costa Rica (+506)</option>
                        <option value="+385">🇭🇷 Croatia (+385)</option>
                        <option value="+53">🇨🇺 Cuba (+53)</option>
                        <option value="+599">🇨🇼 Curacao (+599)</option>
                        <option value="+357">🇨🇾 Cyprus (+357)</option>
                        <option value="+420">🇨🇿 Czech Republic (+420)</option>
                        <option value="+243">🇨🇩 Democratic Republic of the Congo (+243)</option>
                        <option value="+45">🇩🇰 Denmark (+45)</option>
                        <option value="+253">🇩🇯 Djibouti (+253)</option>
                        <option value="+1">🇩🇲 Dominica (+1)</option>
                        <option value="+1">🇩🇴 Dominican Republic (+1)</option>
                        <option value="+670">🇹🇱 East Timor (+670)</option>
                        <option value="+593">🇪🇨 Ecuador (+593)</option>
                        <option value="+20">🇪🇬 Egypt (+20)</option>
                        <option value="+503">🇸🇻 El Salvador (+503)</option>
                        <option value="+240">🇬🇶 Equatorial Guinea (+240)</option>
                        <option value="+291">🇪🇷 Eritrea (+291)</option>
                        <option value="+372">🇪🇪 Estonia (+372)</option>
                        <option value="+251">🇪🇹 Ethiopia (+251)</option>
                        <option value="+500">🇫🇰 Falkland Islands (+500)</option>
                        <option value="+298">🇫🇴 Faroe Islands (+298)</option>
                        <option value="+679">🇫🇯 Fiji (+679)</option>
                        <option value="+358">🇫🇮 Finland (+358)</option>
                        <option value="+33">🇫🇷 France (+33)</option>
                        <option value="+689">🇵🇫 French Polynesia (+689)</option>
                        <option value="+241">🇬🇦 Gabon (+241)</option>
                        <option value="+220">🇬🇲 Gambia (+220)</option>
                        <option value="+995">🇬🇪 Georgia (+995)</option>
                        <option value="+49">🇩🇪 Germany (+49)</option>
                        <option value="+233">🇬🇭 Ghana (+233)</option>
                        <option value="+350">🇬🇮 Gibraltar (+350)</option>
                        <option value="+30">🇬🇷 Greece (+30)</option>
                        <option value="+299">🇬🇱 Greenland (+299)</option>
                        <option value="+1">🇬🇩 Grenada (+1)</option>
                        <option value="+1">🇬🇺 Guam (+1)</option>
                        <option value="+502">🇬🇹 Guatemala (+502)</option>
                        <option value="+44">🇬🇬 Guernsey (+44)</option>
                        <option value="+224">🇬🇳 Guinea (+224)</option>
                        <option value="+245">🇬🇼 Guinea-Bissau (+245)</option>
                        <option value="+592">🇬🇾 Guyana (+592)</option>
                        <option value="+509">🇭🇹 Haiti (+509)</option>
                        <option value="+504">🇭🇳 Honduras (+504)</option>
                        <option value="+852">🇭🇰 Hong Kong (+852)</option>
                        <option value="+36">🇭🇺 Hungary (+36)</option>
                        <option value="+354">🇮🇸 Iceland (+354)</option>
                        <option value="+91">🇮🇳 India (+91)</option>
                        <option value="+62">🇮🇩 Indonesia (+62)</option>
                        <option value="+98">🇮🇷 Iran (+98)</option>
                        <option value="+964">🇮🇶 Iraq (+964)</option>
                        <option value="+353">🇮🇪 Ireland (+353)</option>
                        <option value="+44">🇮🇲 Isle of Man (+44)</option>
                        <option value="+972">🇮🇱 Israel (+972)</option>
                        <option value="+39">🇮🇹 Italy (+39)</option>
                        <option value="+225">🇨🇮 Ivory Coast (+225)</option>
                        <option value="+1">🇯🇲 Jamaica (+1)</option>
                        <option value="+81">🇯🇵 Japan (+81)</option>
                        <option value="+44">🇯🇪 Jersey (+44)</option>
                        <option value="+962">🇯🇴 Jordan (+962)</option>
                        <option value="+7">🇰🇿 Kazakhstan (+7)</option>
                        <option value="+254">🇰🇪 Kenya (+254)</option>
                        <option value="+686">🇰🇮 Kiribati (+686)</option>
                        <option value="+383">🇽🇰 Kosovo (+383)</option>
                        <option value="+965">🇰🇼 Kuwait (+965)</option>
                        <option value="+996">🇰🇬 Kyrgyzstan (+996)</option>
                        <option value="+856">🇱🇦 Laos (+856)</option>
                        <option value="+371">🇱🇻 Latvia (+371)</option>
                        <option value="+961">🇱🇧 Lebanon (+961)</option>
                        <option value="+266">🇱🇸 Lesotho (+266)</option>
                        <option value="+231">🇱🇷 Liberia (+231)</option>
                        <option value="+218">🇱🇾 Libya (+218)</option>
                        <option value="+423">🇱🇮 Liechtenstein (+423)</option>
                        <option value="+370">🇱🇹 Lithuania (+370)</option>
                        <option value="+352">🇱🇺 Luxembourg (+352)</option>
                        <option value="+853">🇲🇴 Macao (+853)</option>
                        <option value="+389">🇲🇰 Macedonia (+389)</option>
                        <option value="+261">🇲🇬 Madagascar (+261)</option>
                        <option value="+265">🇲🇼 Malawi (+265)</option>
                        <option value="+60">🇲🇾 Malaysia (+60)</option>
                        <option value="+960">🇲🇻 Maldives (+960)</option>
                        <option value="+223">🇲🇱 Mali (+223)</option>
                        <option value="+356">🇲🇹 Malta (+356)</option>
                        <option value="+692">🇲🇭 Marshall Islands (+691)</option>
                        <option value="+222">🇲🇷 Mauritania (+222)</option>
                        <option value="+230">🇲🇺 Mauritius (+230)</option>
                        <option value="+262">🇾🇹 Mayotte (+262)</option>
                        <option value="+52">🇲🇽 Mexico (+52)</option>
                        <option value="+691">🇫🇲 Micronesia (+691)</option>
                        <option value="+373">🇲🇩 Moldova (+373)</option>
                        <option value="+377">🇲🇨 Monaco (+377)</option>
                        <option value="+976">🇲🇳 Mongolia (+976)</option>
                        <option value="+382">🇲🇪 Montenegro (+382)</option>
                        <option value="+1">🇲🇸 Montserrat (+1)</option>
                        <option value="+212">🇲🇦 Morocco (+212)</option>
                        <option value="+258">🇲🇿 Mozambique (+258)</option>
                        <option value="+95">🇲🇲 Myanmar (+95)</option>
                        <option value="+264">🇳🇦 Namibia (+264)</option>
                        <option value="+674">🇳🇷 Nauru (+674)</option>
                        <option value="+977">🇳🇵 Nepal (+977)</option>
                        <option value="+31">🇳🇱 Netherlands (+31)</option>
                        <option value="+599">🇦🇳 Netherlands Antilles (+599)</option>
                        <option value="+687">🇳🇨 New Caledonia (+687)</option>
                        <option value="+64">🇳🇿 New Zealand (+64)</option>
                        <option value="+505">🇳🇮 Nicaragua (+505)</option>
                        <option value="+227">🇳🇪 Niger (+227)</option>
                        <option value="+234">🇳🇬 Nigeria (+234)</option>
                        <option value="+683">🇳🇺 Niue (+683)</option>
                        <option value="+850">🇰🇵 North Korea (+850)</option>
                        <option value="+1">🇲🇵 Northern Mariana Islands (+1)</option>
                        <option value="+47">🇳🇴 Norway (+47)</option>
                        <option value="+968">🇴🇲 Oman (+968)</option>
                        <option value="+92">🇵🇰 Pakistan (+92)</option>
                        <option value="+680">🇵🇼 Palau (+680)</option>
                        <option value="+970">🇵🇸 Palestine (+970)</option>
                        <option value="+507">🇵🇦 Panama (+507)</option>
                        <option value="+675">🇵🇬 Papua New Guinea (+675)</option>
                        <option value="+595">🇵🇾 Paraguay (+595)</option>
                        <option value="+51">🇵🇪 Peru (+51)</option>
                        <option value="+63">🇵🇭 Philippines (+63)</option>
                        <option value="+64">🇵🇳 Pitcairn (+64)</option>
                        <option value="+48">🇵🇱 Poland (+48)</option>
                        <option value="+351">🇵🇹 Portugal (+351)</option>
                        <option value="+1">🇵🇷 Puerto Rico (+1)</option>
                        <option value="+974">🇶🇦 Qatar (+974)</option>
                        <option value="+242">🇨🇬 Republic of the Congo (+242)</option>
                        <option value="+262">🇷🇪 Reunion (+262)</option>
                        <option value="+40">🇷🇴 Romania (+40)</option>
                        <option value="+7">🇷🇺 Russia (+7)</option>
                        <option value="+250">🇷🇼 Rwanda (+250)</option>
                        <option value="+590">🇧🇱 Saint Barthelemy (+590)</option>
                        <option value="+290">🇸🇭 Saint Helena (+290)</option>
                        <option value="+1">🇰🇳 Saint Kitts and Nevis (+1)</option>
                        <option value="+1">🇱🇨 Saint Lucia (+1)</option>
                        <option value="+590">🇲🇫 Saint Martin (+590)</option>
                        <option value="+508">🇵🇲 Saint Pierre and Miquelon (+508)</option>
                        <option value="+1">🇻🇨 Saint Vincent and the Grenadines (+1)</option>
                        <option value="+685">🇼🇸 Samoa (+685)</option>
                        <option value="+378">🇸🇲 San Marino (+378)</option>
                        <option value="+239">🇸🇹 Sao Tome and Principe (+239)</option>
                        <option value="+966">🇸🇦 Saudi Arabia (+966)</option>
                        <option value="+221">🇸🇳 Senegal (+221)</option>
                        <option value="+381">🇷🇸 Serbia (+381)</option>
                        <option value="+248">🇸🇨 Seychelles (+248)</option>
                        <option value="+232">🇸🇱 Sierra Leone (+232)</option>
                        <option value="+65">🇸🇬 Singapore (+65)</option>
                        <option value="+1">🇸🇽 Sint Maarten (+1)</option>
                        <option value="+421">🇸🇰 Slovakia (+421)</option>
                        <option value="+386">🇸🇮 Slovenia (+386)</option>
                        <option value="+677">🇸🇧 Solomon Islands (+677)</option>
                        <option value="+252">🇸🇴 Somalia (+252)</option>
                        <option value="+27">🇿🇦 South Africa (+27)</option>
                        <option value="+82">🇰🇷 South Korea (+82)</option>
                        <option value="+211">🇸🇸 South Sudan (+211)</option>
                        <option value="+34">🇪🇸 Spain (+34)</option>
                        <option value="+94">🇱🇰 Sri Lanka (+94)</option>
                        <option value="+249">🇸🇩 Sudan (+249)</option>
                        <option value="+597">🇸🇷 Suriname (+597)</option>
                        <option value="+47">🇸🇯 Svalbard and Jan Mayen (+47)</option>
                        <option value="+268">🇸🇿 Swaziland (+268)</option>
                        <option value="+46">🇸🇪 Sweden (+46)</option>
                        <option value="+41">🇨🇭 Switzerland (+41)</option>
                        <option value="+963">🇸🇾 Syria (+963)</option>
                        <option value="+886">🇹🇼 Taiwan (+886)</option>
                        <option value="+992">🇹🇯 Tajikistan (+992)</option>
                        <option value="+255">🇹🇿 Tanzania (+255)</option>
                        <option value="+66">🇹🇭 Thailand (+66)</option>
                        <option value="+228">🇹🇬 Togo (+228)</option>
                        <option value="+690">🇹🇰 Tokelau (+690)</option>
                        <option value="+676">🇹🇴 Tonga (+676)</option>
                        <option value="+1">🇹🇹 Trinidad and Tobago (+1)</option>
                        <option value="+216">🇹🇳 Tunisia (+216)</option>
                        <option value="+90">🇹🇷 Turkey (+90)</option>
                        <option value="+993">🇹🇲 Turkmenistan (+993)</option>
                        <option value="+1">🇹🇨 Turks and Caicos Islands (+1)</option>
                        <option value="+688">🇹🇻 Tuvalu (+688)</option>
                        <option value="+1">🇻🇮 U.S. Virgin Islands (+1)</option>
                        <option value="+256">🇺🇬 Uganda (+256)</option>
                        <option value="+380">🇺🇦 Ukraine (+380)</option>
                        <option value="+971">🇦🇪 United Arab Emirates (+971)</option>
                        <option value="+44">🇬🇧 United Kingdom (+44)</option>
                        <option value="+1">🇺🇸 United States (+1)</option>
                        <option value="+598">🇺🇾 Uruguay (+598)</option>
                        <option value="+998">🇺🇿 Uzbekistan (+998)</option>
                        <option value="+678">🇻🇺 Vanuatu (+678)</option>
                        <option value="+379">🇻🇦 Vatican (+379)</option>
                        <option value="+58">🇻🇪 Venezuela (+58)</option>
                        <option value="+84">🇻🇳 Vietnam (+84)</option>
                        <option value="+681">🇼🇫 Wallis and Futuna (+681)</option>
                        <option value="+212">🇪🇭 Western Sahara (+212)</option>
                        <option value="+967">🇾🇪 Yemen (+967)</option>
                        <option value="+260">🇿🇲 Zambia (+260)</option>
                        <option value="+263">🇿🇼 Zimbabwe (+263)</option>
                      </select>
                      <input
                        type="tel"
                        required
                        value={quotationForm.phone}
                        onChange={(e) => setQuotationForm({...quotationForm, phone: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Preferred Contact Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Reply Method *</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="email"
                          checked={quotationForm.preferredContact === 'email'}
                          onChange={(e) => setQuotationForm({...quotationForm, preferredContact: e.target.value as 'email' | 'whatsapp' | 'call'})}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-gray-700">📧 Email</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="whatsapp"
                          checked={quotationForm.preferredContact === 'whatsapp'}
                          onChange={(e) => setQuotationForm({...quotationForm, preferredContact: e.target.value as 'email' | 'whatsapp' | 'call'})}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-gray-700">💬 WhatsApp</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="call"
                          checked={quotationForm.preferredContact === 'call'}
                          onChange={(e) => setQuotationForm({...quotationForm, preferredContact: e.target.value as 'email' | 'whatsapp' | 'call'})}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-gray-700">📞 Phone Call</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Message (Optional)</label>
                    <textarea
                      rows={3}
                      value={quotationForm.message}
                      onChange={(e) => setQuotationForm({...quotationForm, message: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Any specific requirements or questions"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowQuotationModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </main>
  );
}