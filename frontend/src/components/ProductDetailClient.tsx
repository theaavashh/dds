'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import { addToCart } from '@/store/cartSlice';
import { toast } from 'react-toastify';
import { Product } from '@/types/product';

interface ProductDetailClientProps {
  initialProduct: Product;
  category: string;
}

export default function ProductDetailClient({ initialProduct, category }: ProductDetailClientProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [product] = useState<Product>(initialProduct);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Get authentication state from Redux
  const { isAuthenticated } = useSelector((state: any) => state.user);
  const wishlistItems = useSelector((state: any) => state.wishlist.items);
  const isInWishlist = wishlistItems.some((item: Product) => item.id === product.id);

  const toggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.info('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist');
    }
  };

  const addProductToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    dispatch(addToCart({ ...product, quantity }));
    toast.success(`Added ${quantity} item(s) to cart`);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (product.images.length - 1) : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (product.images.length - 1) ? 0 : prev + 1
    );
  };

  const currentImage = product.images[currentImageIndex] || product.images[0];

  return (
    <main className="min-h-screen bg-white" itemScope itemType="https://schema.org/Product">
      <Header />
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 py-4">
        <ol className="flex items-center text-sm text-gray-600">
          <li><Link href="/" className="hover:text-amber-600">Home</Link></li>
          <li className="mx-2">/</li>
          <li><Link href="/jewelry" className="hover:text-amber-600">Jewelry</Link></li>
          <li className="mx-2">/</li>
          <li>
            <Link href={`/jewelry/${category}`} className="hover:text-amber-600 capitalize">
              {category}
            </Link>
          </li>
          <li className="mx-2">/</li>
          <li className="text-gray-900 font-medium" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      {/* Main Product Section */}
      <section className="container mx-auto px-4 py-8" aria-labelledby="product-title">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={currentImage?.url || product.imageUrl || '/placeholder-product.jpg'}
                    alt={currentImage?.altText || product.name}
                    fill
                    className={`object-cover transition-transform duration-500 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    quality={90}
                    itemProp="image"
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToPreviousImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {product.images.length}
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-amber-600' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    aria-label={`View image ${index + 1}`}
                    aria-current={index === currentImageIndex ? 'true' : 'false'}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `${product.name} - view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & SKU */}
            <div>
              <h1 id="product-title" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2" itemProp="name">
                {product.name}
              </h1>
              <p className="text-gray-500">SKU: <span itemProp="sku">{product.productCode}</span></p>
            </div>
            
            {/* Price */}
            {product.price > 0 && (
              <div className="text-3xl font-bold text-amber-600" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                <meta itemProp="priceCurrency" content="USD" />
                <meta itemProp="availability" content={product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'} />
                <span itemProp="price">${product.price.toLocaleString()}</span>
              </div>
            )}
            
            {/* Short Description */}
            <p className="text-gray-700 leading-relaxed" itemProp="description">
              {product.description}
            </p>
            
            {/* Product Specifications */}
            <div className="border-t border-b border-gray-200 py-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {product.goldPurity && (
                  <>
                    <dt className="text-gray-600">Gold Purity:</dt>
                    <dd className="font-medium" itemProp="material">{product.goldPurity}</dd>
                  </>
                )}
                {product.goldWeight && (
                  <>
                    <dt className="text-gray-600">Gold Weight:</dt>
                    <dd className="font-medium">{product.goldWeight}g</dd>
                  </>
                )}
                {product.diamondCaratWeight && (
                  <>
                    <dt className="text-gray-600">Diamond Weight:</dt>
                    <dd className="font-medium">{product.diamondCaratWeight}ct</dd>
                  </>
                )}
                {product.diamondQuantity && (
                  <>
                    <dt className="text-gray-600">Diamond Count:</dt>
                    <dd className="font-medium">{product.diamondQuantity} stones</dd>
                  </>
                )}
                {product.diamondShapeCut && (
                  <>
                    <dt className="text-gray-600">Diamond Cut:</dt>
                    <dd className="font-medium">{product.diamondShapeCut}</dd>
                  </>
                )}
                {product.metalType && (
                  <>
                    <dt className="text-gray-600">Metal Type:</dt>
                    <dd className="font-medium">{product.metalType}</dd>
                  </>
                )}
              </dl>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-3 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              
              {/* Add to Cart */}
              <button
                onClick={addProductToCart}
                className="flex-1 bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              
              {/* Wishlist */}
              <button
                onClick={toggleWishlist}
                className={`p-3 border rounded-lg transition-colors ${
                  isInWishlist 
                    ? 'border-red-500 text-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
              
              {/* Share */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: product.description,
                      url: window.location.href,
                    });
                  }
                }}
                className="p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                aria-label="Share product"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
            
            {/* Stock Status */}
            <div className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </div>
            
            {/* Request Quotation */}
            <button
              onClick={() => setShowQuotationModal(true)}
              className="w-full border-2 border-amber-600 text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
            >
              Request Custom Quotation
            </button>
          </div>
        </div>
        
        {/* Full Description */}
        {product.fullDescription && (
          <section className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              {product.fullDescription}
            </div>
          </section>
        )}
      </section>

      {/* Quotation Modal */}
      <AnimatePresence>
        {showQuotationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuotationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Request Quotation</h3>
              <p className="text-gray-600 mb-4">Interested in {product.name}? Send us your requirements.</p>
              <button
                onClick={() => setShowQuotationModal(false)}
                className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
