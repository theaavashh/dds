'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { removeFromCart, updateQuantity, clearCart } from '@/store/cartSlice';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';

export default function CartPage() {
    const { isAuthenticated } = useAuth();
    const dispatch = useDispatch();
    const cart = useSelector((state: RootState) => state.cart);

    const [isLoading, setIsLoading] = useState(false);

    const handleUpdateQuantity = (id: string, currentQty: number, delta: number) => {
        const newQty = currentQty + delta;
        if (newQty > 0) {
            dispatch(updateQuantity({ id, quantity: newQty }));
        } else if (newQty === 0) {
            dispatch(removeFromCart(id));
            toast.info('Item removed from cart');
        }
    };

    const handleRemove = (id: string) => {
        dispatch(removeFromCart(id));
        toast.info('Item removed from cart');
    };

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            dispatch(clearCart());
            toast.info('Cart cleared');
        }
    };

    const handleSendInquiry = async () => {
        if (cart.items.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: cart.items,
                    notes: 'Order inquiry from website'
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Inquiry sent successfully! Our team will contact you soon.');
                dispatch(clearCart());
            } else {
                toast.error(data.message || 'Failed to send inquiry');
            }
        } catch (error) {
            console.error('Error sending inquiry:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <div className="relative h-[30vh] w-full bg-[#f2f2f2] flex items-center justify-center pt-20">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-sans font-normal tracking-wide mb-2 text-black cabinet uppercase">
                        Your Shopping Cart
                    </h1>
                    <div className="w-16 h-0.5 bg-amber-600 mx-auto"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {!isAuthenticated ? (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <p className="text-xl text-gray-600 mb-8 font-light italic">Please login to view and manage your cart.</p>
                        <Link
                            href="/login"
                            className="inline-block px-10 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-amber-600 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Login to Proceed
                        </Link>
                    </div>
                ) : cart.items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="mb-6 flex justify-center">
                            <div className="p-6 bg-gray-50 rounded-full">
                                <ShoppingCart className="h-12 w-12 text-gray-300" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-light text-gray-900 mb-4 uppercase tracking-widest">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added any gorgeous pieces to your cart yet.</p>
                        <Link
                            href="/jewelry"
                            className="inline-block px-10 py-4 border-2 border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
                        >
                            Discover Collections
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900">
                                    Items ({cart.totalItems})
                                </h2>
                                <button
                                    onClick={handleClear}
                                    className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                                >
                                    Clear Cart
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-6 group">
                                        {/* Item Image */}
                                        <Link href={`/jewelry/${item.category.toLowerCase()}/${item.id}`} className="relative h-32 w-32 bg-gray-50 flex-shrink-0 overflow-hidden rounded-md">
                                            <Image
                                                src={
                                                    item.images[0]?.url
                                                        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.images[0].url}`
                                                        : item.imageUrl
                                                            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.imageUrl}`
                                                            : 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2070&auto=format&fit=crop'
                                                }
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </Link>

                                        {/* Item Info */}
                                        <div className="flex-grow flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <Link href={`/jewelry/${item.category.toLowerCase()}/${item.id}`}>
                                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest hover:text-amber-600 transition-colors">
                                                            {item.productCode}
                                                        </h3>
                                                    </Link>
                                                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{item.category}</p>
                                                    <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-400 font-medium">
                                                        {item.goldWeight && <span>Gold: {item.goldWeight}</span>}
                                                        {item.goldPurity && <span>Purity: {item.goldPurity}</span>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex justify-between items-end mt-4">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center border border-gray-200 rounded-full p-1 bg-gray-50">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                                        className="p-1 hover:text-amber-600 transition-colors"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                                        className="p-1 hover:text-amber-600 transition-colors"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/jewelry"
                                className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-amber-600 transition-colors mt-8 uppercase tracking-widest"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Continue Shopping
                            </Link>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 p-8 rounded-lg space-y-6 sticky top-32">
                                <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900 border-b border-gray-200 pb-4">
                                    Order Summary
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 font-medium uppercase tracking-wide">Total Items</span>
                                        <span className="text-gray-900 font-bold">{cart.totalItems}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 font-medium uppercase tracking-wide">Inquiry Status</span>
                                        <span className="text-amber-600 font-bold">In Progress</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-200">
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6 italic text-center">
                                        Note: This inquiry will be sent to our team who will contact you with current pricing based on live gold and diamond rates.
                                    </p>

                                    <button
                                        onClick={handleSendInquiry}
                                        disabled={isLoading}
                                        className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-amber-600 transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Sending...' : 'Send Inquiry'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
