'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Account() {
  const router = useRouter();
  const { distributor, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    city: '',
    country: ''
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    
    // Populate form with distributor data when available
    if (distributor) {
      setFormData({
        firstName: distributor.firstName || '',
        lastName: distributor.lastName || '',
        email: distributor.email || '',
        phone: distributor.phone || '',
        companyName: distributor.companyName || '',
        city: distributor.city || '',
        country: distributor.country || ''
      });
    }
  }, [isAuthenticated, loading, router, distributor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log('Form submitted:', formData);
  };

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
            My Account
          </h1>
          <p className="text-lg md:text-xl font-light tracking-wider">
            Manage your account information
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-[#e6e6e6] py-3 text-center">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
          Home / <span className="text-gray-900">My Account</span>
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-medium tracking-wide text-gray-900">Account Menu</h2>
              </div>
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <Link 
                      href="/account" 
                      className="flex items-center px-4 py-3 text-amber-600 font-medium bg-amber-50 rounded-lg transition-all duration-200"
                    >
                      <div className="w-2 h-2 bg-amber-600 rounded-full mr-3"></div>
                      Account Information
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/my-orders" 
                      className="flex items-center px-4 py-3 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                    >
                      <div className="w-2 h-2 bg-transparent border border-gray-400 rounded-full mr-3"></div>
                      My Orders
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Account Content */}
          <div className="md:w-3/4">
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-6 border-b border-gray-100">
                <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-2">Account Information</h2>
                <p className="text-sm text-gray-600">Update your personal and business details</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8">
                {/* Personal Information Section */}
                <div className="mb-10">
                  <div className="flex items-center mb-6">
                    <div className="w-1 h-6 bg-amber-500 mr-3"></div>
                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-amber-600">
                        First Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 placeholder-gray-400"
                          placeholder="Enter your first name"
                          required
                        />
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-amber-600">
                        Last Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 placeholder-gray-400"
                          placeholder="Enter your last name"
                          required
                        />
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-amber-600">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 placeholder-gray-400"
                          placeholder="your.email@example.com"
                          required
                        />
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-amber-600">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 placeholder-gray-400"
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Information Section */}
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-1 h-6 bg-amber-500 mr-3"></div>
                    <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-amber-600">
                        Company Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 placeholder-gray-400"
                          placeholder="Enter your company name"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-amber-600">
                        City
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 placeholder-gray-400"
                          placeholder="Enter your city"
                          required
                        />
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                      </div>
                    </div>
                    
                    <div className="group md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-amber-600">
                        Country
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 placeholder-gray-400"
                          placeholder="Enter your country"
                          required
                        />
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (distributor) {
                        setFormData({
                          firstName: distributor.firstName || '',
                          lastName: distributor.lastName || '',
                          email: distributor.email || '',
                          phone: distributor.phone || '',
                          companyName: distributor.companyName || '',
                          city: distributor.city || '',
                          country: distributor.country || ''
                        });
                      }
                    }}
                    className="flex-1 sm:flex-none bg-white text-gray-700 px-8 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}