'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { setUser } from '@/store/userSlice';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // State for login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // State for registration form
  const [registerData, setRegisterData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    email: '',
    password: '',
    country: ''
  });

  // State for messages
  const [message, setMessage] = useState<{ type: string, text: string } | null>(null);

  // Handle login form changes
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle registration form changes
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle login submission for distributors
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Use the API URL from environment variables or default to /api
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

      // Attempt distributor login (no CSRF token needed as it's excluded in middleware)
      const response = await fetch('/api/distributors/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      });

      // Check if response is OK and content type is JSON
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('Network error or invalid response');
      }

      const data = await response.json();

      if (data.success) {
        // Set user in Redux store
        dispatch(setUser(data.data.distributor));

        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        // Redirect to dashboard or home page
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // Handle registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Use the API URL from environment variables or default to /api
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

      const response = await fetch('/api/distributors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      });

      // Check if response is OK and content type is JSON
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('Network error or invalid response');
      }

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Registration successful! Your account is pending approval.' });
        // Reset form
        setRegisterData({
          companyName: '',
          firstName: '',
          lastName: '',
          phone: '',
          city: '',
          email: '',
          password: '',
          country: ''
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <div className="relative h-[50vh] w-full bg-gray-200">
        <Image
          src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=2070&auto=format&fit=crop"
          alt="Woman looking down"
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      {/* Main Content Container - Overlapping */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20 mb-20">
        <div className="bg-white shadow-xl flex flex-col lg:flex-row relative">

          {/* Social Sidebar (Right Side fixed/absolute) */}
          <div className="hidden lg:flex flex-col gap-2 absolute top-0 -right-12">
            <a href="#" className="bg-[#3b5998] p-2 text-white hover:opacity-90 transition-opacity">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="bg-gradient-to-b from-purple-500 to-pink-500 p-2 text-white hover:opacity-90 transition-opacity">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="bg-[#0077b5] p-2 text-white hover:opacity-90 transition-opacity">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>

          {/* Registered Customers Column */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-100">
            <h2 className="text-xl font-normal tracking-widest text-gray-800 mb-8 uppercase">
              Registered Customers
            </h2>

            {message && message.type === 'info' && (
              <div className="mb-4 p-2 text-sm bg-blue-100 text-blue-700">
                {message.text}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="E-mail Id"
                  className="w-full bg-[#e6e6e6] border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-400 outline-none placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Password"
                  className="w-full bg-[#e6e6e6] border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-400 outline-none placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <Link href="#" className="text-xs text-gray-600 hover:text-gray-900 tracking-wide">
                  Forgot Password ?
                </Link>
              </div>

              <div className="pt-4 flex flex-col items-center">
                <button
                  type="submit"
                  className="text-sm font-bold text-gray-800 uppercase tracking-widest hover:text-amber-600 transition-colors"
                >
                  LOGIN
                </button>
                <div className="h-0.5 w-8 bg-amber-600 mt-2"></div>

                <p className="text-xs text-gray-600 mt-4 text-center">
                  Note: This login is for approved distributors only.
                </p>
              </div>
            </form>
          </div>

          {/* Gap between columns - visible only on mobile */}
          <div className="lg:hidden h-8"></div>

          {/* New Customers Column */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            <h2 className="text-xl font-normal tracking-widest text-gray-800 mb-8 uppercase">
              New Customers
            </h2>

            {message && message.type !== 'info' && (
              <div className={`mb-4 p-2 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={registerData.companyName}
                  onChange={handleRegisterChange}
                  placeholder="Company Name"
                  className="w-full bg-[#e6e6e6] border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-400 outline-none placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={registerData.firstName}
                  onChange={handleRegisterChange}
                  placeholder="First Name"
                  className="w-full bg-[#e6e6e6] border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-400 outline-none placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={registerData.lastName}
                  onChange={handleRegisterChange}
                  placeholder="Last Name"
                  className="w-full bg-[#e6e6e6] border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-400 outline-none placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Mobile No.
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  placeholder="Mobile Number"
                  className="w-full bg-[#e6e6e6] border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-400 outline-none placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={registerData.city}
                  onChange={handleRegisterChange}
                  placeholder="City"
                  className="w-full bg-[#e6e6e6] border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-400 outline-none placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="Email Address"
                  className="w-full bg-[#e6e6e6] border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-400 outline-none placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Password"
                  className="w-full bg-[#e6e6e6] border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-400 outline-none placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={registerData.country}
                  onChange={handleRegisterChange}
                  placeholder="Country"
                  className="w-full bg-[#e6e6e6] border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gray-400 outline-none placeholder-gray-500"
                  required
                />
              </div>

              <div className="pt-4 flex flex-col items-center">
                <button
                  type="submit"
                  className="text-sm font-bold text-gray-800 uppercase tracking-widest hover:text-amber-600 transition-colors"
                >
                  Register
                </button>
                <div className="h-0.5 w-8 bg-amber-600 mt-2"></div>

                <p className="text-xs text-gray-600 mt-4 text-center">
                  Note: New distributor accounts require administrator approval before login.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}