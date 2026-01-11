'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { ShoppingCart, Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { removeFromWishlist } from '@/store/wishlistSlice';
import { toast } from 'react-toastify';

export default function WishlistPage() {
    const { isAuthenticated } = useAuth();
    const dispatch = useDispatch();
    const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

    const handleRemove = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        dispatch(removeFromWishlist(id));
        toast.info('Removed from wishlist');
    };

    return (
        <main className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <div className="relative h-[40vh] w-full bg-[#f2f2f2] flex items-center justify-center pt-20">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-sans font-normal tracking-wide mb-4 text-black cabinet uppercase">
                        My Wishlist
                    </h1>
                    <div className="w-16 h-0.5 bg-amber-600 mx-auto mb-4"></div>
                    <p className="text-lg md:text-xl font-light tracking-wider text-gray-600 uppercase">
                        Your Favorite Pieces
                    </p>
                </div>
            </div>

            {/* Wishlist Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {!isAuthenticated ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-600 mb-8">Please login to view your wishlist.</p>
                        <Link
                            href="/login"
                            className="inline-block px-8 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors"
                        >
                            Login Now
                        </Link>
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart className="h-16 w-16 text-gray-200 mx-auto mb-6" />
                        <p className="text-xl text-gray-600 mb-8">Your wishlist is empty.</p>
                        <Link
                            href="/jewelry"
                            className="inline-block px-8 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {wishlistItems.map((product) => (
                            <div key={product.id} className="group relative border border-gray-100 p-4 hover:shadow-xl transition-shadow">
                                <Link href={`/jewelry/${product.category.toLowerCase()}/${product.id}`}>
                                    {/* Image */}
                                    <div className="aspect-square relative overflow-hidden bg-gray-50 mb-4">
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
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">{product.productCode}</h3>
                                                <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                                            </div>
                                            <button
                                                onClick={(e) => handleRemove(e, product.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Remove from wishlist"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center text-[11px] font-medium text-gray-600 pt-2 border-t border-gray-50">
                                            <span>Gold: {product.goldWeight || 'N/A'}</span>
                                            {product.diamondCaratWeight && <span>Dia: {product.diamondCaratWeight} ct</span>}
                                        </div>

                                        <button className="w-full mt-4 bg-black text-white py-2 text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                                            <ShoppingCart className="h-3 w-3" />
                                            Add to Cart
                                        </button>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
