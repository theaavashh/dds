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
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define schema for login form
const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email format' }),
  password: z.string().min(1, { message: 'Password is required' }).min(6, { message: 'Password must be at least 6 characters' }),
});

// Define schema for registration form
const registerSchema = z.object({
  companyName: z.string().min(1, { message: 'Company name is required' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email format' }),
  password: z.string().min(1, { message: 'Password is required' }).min(6, { message: 'Password must be at least 6 characters' }),
  country: z.string().min(1, { message: 'Country is required' }),
});

// Define types for form data
type LoginFormInputs = z.infer<typeof loginSchema>;
type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Initialize React Hook Form for login
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Initialize React Hook Form for registration
  const {
    register: registerRegister,
    handleSubmit: handleSubmitRegister,
    formState: { errors: registerErrors },
    reset: resetRegister,
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: '',
      firstName: '',
      lastName: '',
      phone: '',
      city: '',
      email: '',
      password: '',
      country: '',
    },
  });

  // State for messages
  const [message, setMessage] = useState<{ type: string, text: string } | null>(null);
  
  // State for showing login vs register form
  const [showLoginForm, setShowLoginForm] = useState(true);

  // Handle login submission for distributors
  const handleLoginSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
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
        body: JSON.stringify(data)
      });

      // Check if response is OK and content type is JSON
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('Network error or invalid response');
      }

      const responseData = await response.json();

      if (responseData.success) {
        // Set user in Redux store
        dispatch(setUser(responseData.data.distributor));

        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        // Reset form
        resetLogin();
        // Redirect to dashboard or home page
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setMessage({ type: 'error', text: responseData.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // Handle registration submission
  const handleRegisterSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      // Use the API URL from environment variables or default to /api
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

      const response = await fetch('/api/distributors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      // Check if response is OK and content type is JSON
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('Network error or invalid response');
      }

      const responseData = await response.json();

      if (responseData.success) {
        setMessage({ type: 'success', text: 'Registration successful! Your account is pending approval.' });
        // Reset form
        resetRegister();
      } else {
        setMessage({ type: 'error', text: responseData.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };





  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      {/* Hero Section */}
      <div className="relative h-72 w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=2070&auto=format&fit=crop"
          alt="Luxury jewelry collection"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tan-agean">Welcome Back</h1>
            <p className="text-xl md:text-4xl">Sign in to your distributor account</p>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">

            {/* Login Section */}
            <div className={`w-full lg:w-1/2 p-8 lg:p-12 bg-gray-50 ${showLoginForm ? 'block' : 'hidden lg:block'}`}>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2 tan-agean">Distributor Login</h2>
                <p className="text-black">Sign in to your account to continue</p>
              </div>

              {message && message.type === 'info' && (
                <div className="mb-6 p-3 text-sm bg-blue-100 text-blue-700 rounded-lg">
                  {message.text}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmitLogin(handleLoginSubmit)}>
                <div>
                  <label className="block text-md font-normal text-black mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...registerLogin('email')}
                    placeholder="Enter your email"
                    className={`w-full bg-white border ${loginErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                  />
                  {loginErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{loginErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-md font-normal text-black mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    {...registerLogin('password')}
                    placeholder="Enter your password"
                    className={`w-full bg-white border ${loginErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                  />
                  {loginErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                    <span className="ml-2 text-sm text-black">Remember me</span>
                  </label>
                  <Link href="#" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-[1.02]"
                >
                  Sign In
                </button>

                <p className="text-md text-black mt-4 text-center cabinet">
                  This login is for approved distributors only.
                </p>

                {/* Show on mobile and tablet only */}
                <div className="lg:hidden mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setShowLoginForm(false)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Don't Have Account? Create One
                  </button>
                </div>
              </form>
            </div>

            {/* Divider for mobile */}
            <div className="lg:hidden h-px bg-gray-200 mx-8"></div>

            {/* Registration Section */}
            <div className={`w-full lg:w-1/2 p-8 lg:p-12 ${!showLoginForm ? 'block' : 'hidden lg:block'}`}>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Create Account</h2>
                <p className="text-gray-600">Join us as a distributor today</p>
              </div>

              {message && message.type !== 'info' && (
                <div className={`mb-6 p-3 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-lg`}>
                  {message.text}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmitRegister(handleRegisterSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      {...registerRegister('firstName')}
                      placeholder="First name"
                      className={`w-full bg-white border ${registerErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                    />
                    {registerErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      {...registerRegister('lastName')}
                      placeholder="Last name"
                      className={`w-full bg-white border ${registerErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                    />
                    {registerErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    {...registerRegister('companyName')}
                    placeholder="Company name"
                    className={`w-full bg-white border ${registerErrors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                  />
                  {registerErrors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.companyName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...registerRegister('email')}
                    placeholder="Email address"
                    className={`w-full bg-white border ${registerErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                  />
                  {registerErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    {...registerRegister('password')}
                    placeholder="Create password"
                    className={`w-full bg-white border ${registerErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                  />
                  {registerErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.password.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      {...registerRegister('phone')}
                      placeholder="Phone number"
                      className={`w-full bg-white border ${registerErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                    />
                    {registerErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      {...registerRegister('city')}
                      placeholder="City"
                      className={`w-full bg-white border ${registerErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                    />
                    {registerErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.city.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    {...registerRegister('country')}
                    placeholder="Country"
                    className={`w-full bg-white border ${registerErrors.country ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                  />
                  {registerErrors.country && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.country.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-[1.02]"
                >
                  Create Account
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  New distributor accounts require administrator approval before login.
                </p>

                {/* Show on mobile and tablet only */}
                <div className="lg:hidden mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setShowLoginForm(true)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Already Have Account? Sign In
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