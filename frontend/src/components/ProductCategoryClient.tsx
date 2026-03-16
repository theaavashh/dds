'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, Fragment, useCallback } from 'react';
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
import ProductSkeleton, { ProductGridSkeleton } from './ProductSkeleton';
import FilterSkeleton from './FilterSkeleton';

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
    diamondCaratWeight?: string;
    diamondQuantity?: number;
    createdAt?: string;
}

export default function ProductCategoryClient({ category: categoryProp }: { category: string }) {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuthenticated } = useAuth();
    const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
    // Use prop if provided, otherwise fall back to params (for backwards compatibility)
    const category = (categoryProp || params.category as string).toUpperCase();
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
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleProducts, setVisibleProducts] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productsPerPage = 24;

    // Debug log to check if env variable is available
    useEffect(() => {
        console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    }, []);

    // Sort products based on sortBy selection
    const sortProducts = useCallback((productsToSort: Product[], sortOption: string) => {
        const sorted = [...productsToSort];

        switch (sortOption) {
            case 'StyleCode (A->Z)':
                return sorted.sort((a, b) => a.productCode.localeCompare(b.productCode));
            case 'StyleCode (Z->A)':
                return sorted.sort((a, b) => b.productCode.localeCompare(a.productCode));
            case 'Metal Wt : Low to High':
                return sorted.sort((a, b) => {
                    const weightA = parseFloat(a.goldWeight || '0');
                    const weightB = parseFloat(b.goldWeight || '0');
                    return weightA - weightB;
                });
            case 'Metal Wt : High to Low':
                return sorted.sort((a, b) => {
                    const weightA = parseFloat(a.goldWeight || '0');
                    const weightB = parseFloat(b.goldWeight || '0');
                    return weightB - weightA;
                });
            case 'Dia. Wt : Low to High':
                return sorted.sort((a, b) => {
                    const weightA = parseFloat(a.diamondCaratWeight || '0');
                    const weightB = parseFloat(b.diamondCaratWeight || '0');
                    return weightA - weightB;
                });
            case 'Dia. Wt : High to Low':
                return sorted.sort((a, b) => {
                    const weightA = parseFloat(a.diamondCaratWeight || '0');
                    const weightB = parseFloat(b.diamondCaratWeight || '0');
                    return weightB - weightA;
                });
            case 'New Arrivals':
                return sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            default:
                return sorted;
        }
    }, []);

    // Apply sorting when allProducts or sortBy changes
    useEffect(() => {
        const sorted = sortProducts(allProducts, sortBy);
        setProducts(sorted);
    }, [allProducts, sortBy, sortProducts]);

    // Intersection Observer for lazy loading
    const setupIntersectionObserver = useCallback(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const productId = entry.target.getAttribute('data-product-id');
                        if (productId) {
                            setVisibleProducts((prev) => new Set(prev).add(productId));
                            observer.unobserve(entry.target);
                        }
                    }
                });
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        return observer;
    }, []);

    // Fetch products based on category
    const fetchProducts = async () => {
        try {
            if (initialLoading) {
                setInitialLoading(true);
            } else {
                setLoading(true);
            }

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

            // Add API key header and use proxy
            const apiKey = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || 'frontend_secure_key_2024_change_me';

            const response = await fetch(`/api/products?${queryParams.toString()}`, {
                headers: {
                    'x-api-key': apiKey,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setAllProducts(data.data || []);
                setTotalProducts(data.total || 0);
                setTotalPages(data.pagination?.pages || 1);
                setError(null);
            } else {
                setError(data.message || 'Failed to fetch products');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
            setError(errorMessage);
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
            setInitialLoading(false);
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

    // Setup intersection observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const productId = entry.target.getAttribute('data-product-id');
                        if (productId) {
                            setVisibleProducts((prev) => new Set(prev).add(productId));
                            observer.unobserve(entry.target);
                        }
                    }
                });
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        // Observe all product elements
        const productElements = document.querySelectorAll('[data-product-id]');
        productElements.forEach((element) => {
            observer.observe(element);
        });

        return () => observer.disconnect();
    }, [products]);

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

    // Initial loading with full skeleton
    if (initialLoading) {
        return (
            <main className="min-h-screen bg-white">
                <Header />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex gap-8">
                        {/* Filters Skeleton */}
                        <div className="hidden lg:block w-64 flex-shrink-0">
                            <FilterSkeleton />
                        </div>

                        {/* Products Skeleton */}
                        <div className="flex-1">
                            <div className="mb-6">
                                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                            </div>
                            <ProductGridSkeleton count={12} />
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    if (error && products.length === 0) {
        return (
            <main className="min-h-screen bg-white">
                <Header />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="mb-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Products</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                fetchProducts();
                            }}
                            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
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
            <div className="pt-8 text-left px-4 sm:px-6 lg:px-8 ml-12">
                <p className="text-xl font-semibold  text-gray-600 uppercase ">
                    Home / <span className="text-gray-900">{category}({totalProducts})</span>
                </p>
            </div>

            {/* Filter Section */}
            <div className=" px-4 sm:px-6  py-8 mr-12">
                <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 pb-6">
                    <div className="flex-1"></div>

                    {/* Filter Button on Right */}
                    <button
                        className="flex items-center gap-2 text-lg text-black font-medium ml-auto mr-4"
                        onClick={() => {
                            setShowMobileFilters(true);
                            setActiveFilter(null);
                        }}
                    >
                        <span>Filter & Sort</span>

                    </button>
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
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
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

                                        <motion.div
                                            initial={false}
                                            animate={{
                                                height: activeFilter === 'SUB CATEGORY' ? 'auto' : 0,
                                                opacity: activeFilter === 'SUB CATEGORY' ? 1 : 0
                                            }}
                                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                            className="overflow-hidden"
                                        >
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
                                        </motion.div>
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

                                        <motion.div
                                            initial={false}
                                            animate={{
                                                height: activeFilter === 'COLLECTION' ? 'auto' : 0,
                                                opacity: activeFilter === 'COLLECTION' ? 1 : 0
                                            }}
                                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                            className="overflow-hidden"
                                        >
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
                                        </motion.div>
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

                                        <motion.div
                                            initial={false}
                                            animate={{
                                                height: activeFilter === 'METAL WT.' ? 'auto' : 0,
                                                opacity: activeFilter === 'METAL WT.' ? 1 : 0
                                            }}
                                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                            className="overflow-hidden"
                                        >
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
                                        </motion.div>
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

                                        <motion.div
                                            initial={false}
                                            animate={{
                                                height: activeFilter === 'DIAMOND WT.' ? 'auto' : 0,
                                                opacity: activeFilter === 'DIAMOND WT.' ? 1 : 0
                                            }}
                                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                            className="overflow-hidden"
                                        >
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
                                        </motion.div>
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

                                        <motion.div
                                            initial={false}
                                            animate={{
                                                height: activeFilter === 'ORDER TYPE' ? 'auto' : 0,
                                                opacity: activeFilter === 'ORDER TYPE' ? 1 : 0
                                            }}
                                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                            className="overflow-hidden"
                                        >
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
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Sort Section */}
                                <div className="border-b border-gray-200 pb-4 mb-6">
                                    <button
                                        className="flex justify-between items-center w-full text-left font-semibold text-black uppercase"
                                        onClick={() => setActiveFilter(activeFilter === 'SORT' ? null : 'SORT')}
                                    >
                                        <span>SORT BY</span>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${activeFilter === 'SORT' ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height: activeFilter === 'SORT' ? 'auto' : 0,
                                            opacity: activeFilter === 'SORT' ? 1 : 0
                                        }}
                                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-2 space-y-2">
                                            {[
                                                'StyleCode (Z->A)',
                                                'StyleCode (A->Z)',
                                                'Metal Wt : Low to High',
                                                'Metal Wt : High to Low',
                                                'Dia. Wt : Low to High',
                                                'Dia. Wt : High to Low',
                                                'New Arrivals'
                                            ].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setSortBy(option);
                                                        setShowMobileFilters(false);
                                                    }}
                                                    className={`block w-full text-left px-2 py-1 text-sm ${sortBy === option ? 'text-amber-600 font-bold' : 'text-gray-700'} hover:bg-gray-50 transition-colors`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Apply Filters Button */}
                                <div className="mt-8 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowMobileFilters(false)}
                                        className="w-full bg-[#DFC9FE] text-black py-3 rounded uppercase font-bold tracking-widest hover:bg-[#c9b4e8] transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Product Grid */}
                <div>

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
                                <div className="relative max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {wishlistItems.slice(0, 4).map((product) => (
                                        <div
                                            key={product.id}
                                            onClick={() => {
                                                router.push(`/jewelry/${params.category}/${product.id}`);
                                            }}
                                            className="group relative cursor-pointer"
                                        >
                                            {/* Image */}
                                            <div className="aspect-[3/4] relative overflow-hidden bg-gray-100 mb-2">
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
                                                    <span className="text-sm font-bold text-gray-800 tracking-wide truncate max-w-[150px]">{product.name}</span>
                                                    <div className="flex items-center gap-3">

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


                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-8">You haven't added any items yet. Start browsing and save your favorites!</p>
                            )}
                        </div>
                    )}

                    {/* Loading Overlay for Refresh */}
                    {loading && !initialLoading && (
                        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-gray-600">Loading...</span>
                            </div>
                        </div>
                    )}

                    {/* Regular Product Grid */}
                    {products.length > 0 ? (
                        <div className="max-w-8xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
                            {products.map((product) => {
                                const isVisible = visibleProducts.has(product.id);
                                return (
                                    <div
                                        key={product.id}
                                        data-product-id={product.id}
                                        onClick={() => {
                                            router.push(`/jewelry/${params.category}/${product.id}`);
                                        }}
                                        className="group relative cursor-pointer"
                                    >
                                        {/* Image */}
                                        <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                                            {!isVisible ? (
                                                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                                            ) : (
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
                                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                    priority={false}
                                                    placeholder="blur"
                                                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA=="
                                                    onError={(e) => {
                                                        console.log('Image failed to load:', e);
                                                    }}
                                                />
                                            )}
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-4 pt-3">
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-md font-bold text-gray-800 tracking-wide truncate flex-1">{product.name}</span>
                                                <div className="flex items-center gap-3 flex-shrink-0">

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

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-600 mb-4">
                                {error ? 'Please try again or adjust your filters.' : 'Try adjusting your filters or browse other categories.'}
                            </p>
                            {error ? (
                                <button
                                    onClick={() => {
                                        setError(null);
                                        fetchProducts();
                                    }}
                                    className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setSubCategoryFilter(null);
                                        setCollectionFilter(null);
                                        setDiamondWeightFilter(null);
                                        setOrderTypeFilter(null);
                                        setDurationFilter(null);
                                        setMetalWeightRange([0, 100]);
                                    }}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-6 mt-16">
                            {/* Previous Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full text-gray-600 bg-white hover:bg-[#DFC97E] hover:text-black hover:border-[#DFC97E] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page =>
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    )
                                    .map((page, index, filteredPages) => (
                                        <Fragment key={page}>
                                            {index > 0 && filteredPages[index - 1] !== page - 1 && (
                                                <span className="w-8 text-center text-gray-400 text-lg">...</span>
                                            )}
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${currentPage === page
                                                    ? 'bg-[#DFC97E] text-black font-semibold'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </Fragment>
                                    ))}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full text-gray-600 bg-white hover:bg-[#DFC97E] hover:text-black hover:border-[#DFC97E] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}