'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function MyOrders() {
  const router = useRouter();
  const { distributor, isAuthenticated, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center">Loading...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full bg-gray-200">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-sans font-normal tracking-wide mb-2">
            My Orders
          </h1>
          <p className="text-lg md:text-xl font-light tracking-wider">
            View your order history
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-[#e6e6e6] py-3 text-center">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
          Home / <span className="text-gray-900">My Orders</span>
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">My Account</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/account" className="text-gray-600 hover:text-amber-600">
                    Account Information
                  </Link>
                </li>
                <li>
                  <Link href="/my-orders" className="text-amber-600 font-medium">
                    My Orders
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Orders Content */}
          <div className="md:w-3/4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Order History</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                  <Link href="/" className="text-amber-600 hover:underline">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Order items would go here */}
                  <p>You have {orders.length} orders</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}