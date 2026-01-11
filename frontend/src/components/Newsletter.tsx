'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

export default function Newsletter() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setStatus('loading');
    setMessage('');

    try {
      // Simulate API call for now or use real endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      // In a real scenario, uncomment the fetch call
      /*
      const response = await fetch(`${apiUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || res.errors?.[0]?.msg || 'Something went wrong');
      }
      */

      setStatus('success');
      setMessage('Thank you for subscribing.');
      reset();
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong.');
    }
  };

  return (
    <section className="py-24 md:py-32 bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 md:px-12">

        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-normal text-gray-900 mb-4 tracking-tight">
              Subscribe to our newsletter.
            </h2>
            <p className="text-gray-500 mb-12 font-light text-lg">
              Receive exclusive updates, portfolio highlights, and offers.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-transparent border-b border-gray-300 py-4 text-center text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email',
                    },
                  })}
                  disabled={status === 'loading' || isSubmitting}
                />
                {/* Error Message */}
                {errors.email && (
                  <p className="absolute left-0 right-0 -bottom-6 text-center text-sm text-red-500">{errors.email.message as string}</p>
                )}
              </div>

              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className="group flex items-center gap-2 text-sm uppercase tracking-widest font-medium text-gray-900 hover:text-black transition-colors disabled:opacity-50"
                  disabled={status === 'loading' || isSubmitting}
                >
                  <span>{status === 'loading' || isSubmitting ? 'Subscribing...' : 'Subscribe'}</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </button>
              </div>

              {message && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center text-sm mt-2 ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}
                >
                  {message}
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>

        {/* Minimal Footer / Social Link */}
        <div className="mt-24 md:mt-32 border-t border-gray-100 pt-12 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 font-light">
          <p>© 2026 Celebration Diamonds. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-black transition-colors">Instagram</a>
            <a href="#" className="hover:text-black transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-black transition-colors">Twitter</a>
          </div>
        </div>

      </div>
    </section>
  );
}
