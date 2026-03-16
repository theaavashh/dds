'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';


export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Small delay to prevent immediate layout shift if valid
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-xl"
                >
                    <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg  text-gray-900 mb-2">We Use Cookies</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                We use cookies and similar technologies to help personalize content, tailor and measure ads, and provide a better experience. By clicking accept, you agree to this, as outlined in our Cookie Policy.
                            </p>
                        </div>

                        <div className="flex flex-row items-center gap-3 w-full md:w-auto justify-center md:justify-end">
                            <button
                                onClick={handleDecline}
                                className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleAccept}
                                className="bg-[#2A3138] text-white px-8 py-2.5 text-sm font-medium hover:bg-black transition-colors min-w-[120px]"
                            >
                                Accept
                            </button>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
