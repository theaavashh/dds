'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function NewsletterModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if the user has already seen the modal
        const hasSeenModal = localStorage.getItem('hasSeenNewsletterModal');

        if (!hasSeenModal) {
            // Show modal after a delay (e.g., 2.5 seconds)
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        // Persist that the user has seen the modal so it doesn't annoy them
        localStorage.setItem('hasSeenNewsletterModal', 'true');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Handle newsletter subscription logic here
        console.log("Subscribed!");
        handleClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-white p-8 md:p-12 shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Content */}
                        <div className="text-center">
                            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
                                15% Off Your First
                            </h2>
                            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6">
                                Purchase
                            </h2>

                            <p className="text-gray-600 mb-8 text-sm md:text-base leading-relaxed">
                                For a limited time, enjoy 15% off all full-price designs when you join our community.
                                Subscribe below now to receive your personal code.
                            </p>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
                                />

                                <button
                                    type="submit"
                                    className="w-full bg-[#2A3138] text-white py-3 font-medium hover:bg-black transition-colors uppercase tracking-wide text-sm"
                                >
                                    Receive My Code
                                </button>
                            </form>

                            <p className="mt-6 text-xs text-gray-400">
                                Offer ends on 31/01/2026. Select items only
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
