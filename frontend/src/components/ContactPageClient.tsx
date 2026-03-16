'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Phone, Mail, Send, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'react-toastify';

const contactSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Invalid email address' }),
    subject: z.string().min(5, { message: 'Subject must be at least 5 characters' }),
    message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPageClient() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true);
        try {
            // Mock API call
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log('Form data:', data);
            toast.success('Your message has been sent successfully!');
            reset();
        } catch (error) {
            toast.error('Something went wrong. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: 'easeOut' },
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-black">
                    <div className="absolute inset-0 opacity-40">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20 z-10" />
                        {/* Background image placeholder - You can replace this with a real image */}
                        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1573408302185-11756543b5f7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale" />
                    </div>

                    <div className="container mx-auto px-4 relative z-20 text-center">
                        <motion.h1
                            className="text-4xl md:text-6xl font-bold text-white tan-agean mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            Contact Us
                        </motion.h1>
                        <motion.p
                            className="text-lg text-gray-200 max-w-2xl mx-auto font-light tracking-wide"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            We're here to help you find the perfect piece or answer any questions about our craft.
                        </motion.p>
                    </div>
                </section>

                {/* Contact Info & Form Section */}
                <section className="py-20 bg-stone-50">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                            {/* Left Column: Contact Info */}
                            <motion.div
                                initial="initial"
                                whileInView="animate"
                                viewport={{ once: true }}
                                variants={staggerContainer}
                                className="space-y-12"
                            >
                                <div>
                                    <motion.h2
                                        className="text-3xl font-bold text-gray-900 tan-agean mb-6"
                                        variants={fadeInUp}
                                    >
                                        Get in Touch
                                    </motion.h2>
                                    <motion.p
                                        className="text-gray-600 leading-relaxed mb-8"
                                        variants={fadeInUp}
                                    >
                                        Experience the brilliance of Celebration Diamonds in person. Visit our studio or contact us through any of the channels below. Our team is dedicated to providing you with an exceptional experience.
                                    </motion.p>
                                </div>

                                <div className="space-y-8">
                                    <motion.div className="flex items-start gap-5" variants={fadeInUp}>
                                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-1">Our Studio</h4>
                                            <p className="text-gray-600">New Road, Kathmandu, Nepal</p>
                                            <p className="text-gray-600 text-sm">P.O. Box: 12345</p>
                                        </div>
                                    </motion.div>

                                    <motion.div className="flex items-start gap-5" variants={fadeInUp}>
                                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-1">Phone</h4>
                                            <p className="text-gray-600">+977 1-42XXXXX</p>
                                            <p className="text-gray-600">+977 98XXXXXXXX</p>
                                        </div>
                                    </motion.div>

                                    <motion.div className="flex items-start gap-5" variants={fadeInUp}>
                                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-1">Email</h4>
                                            <p className="text-gray-600">info@celebrationdiamonds.com</p>
                                            <p className="text-gray-600">sales@celebrationdiamonds.com</p>
                                        </div>
                                    </motion.div>

                                    <motion.div className="flex items-start gap-5" variants={fadeInUp}>
                                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-1">Business Hours</h4>
                                            <p className="text-gray-600">Sunday - Friday: 10:00 AM - 7:00 PM</p>
                                            <p className="text-gray-600">Saturday: Closed</p>
                                        </div>
                                    </motion.div>
                                </div>

                                <div>
                                    <motion.h4 className="text-lg font-semibold text-gray-900 mb-4" variants={fadeInUp}>Follow Us</motion.h4>
                                    <motion.div className="flex gap-4" variants={fadeInUp}>
                                        {[
                                            { icon: <Facebook size={20} />, href: '#' },
                                            { icon: <Instagram size={20} />, href: '#' },
                                            { icon: <Twitter size={20} />, href: '#' }
                                        ].map((social, idx) => (
                                            <a
                                                key={idx}
                                                href={social.href}
                                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all duration-300"
                                            >
                                                {social.icon}
                                            </a>
                                        ))}
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Right Column: Contact Form */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="bg-white p-8 md:p-12 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100"
                            >
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 tan-agean mb-2">Send us a Message</h3>
                                    <p className="text-gray-600 text-sm">Fields marked with * are required.</p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                            <input
                                                {...register('name')}
                                                type="text"
                                                className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-amber-500 bg-gray-50'
                                                    }`}
                                                placeholder="John Doe"
                                            />
                                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                            <input
                                                {...register('email')}
                                                type="email"
                                                className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-amber-500 bg-gray-50'
                                                    }`}
                                                placeholder="john@example.com"
                                            />
                                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                                        <input
                                            {...register('subject')}
                                            type="text"
                                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition-all ${errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-amber-500 bg-gray-50'
                                                }`}
                                            placeholder="Inquiry about diamond rings"
                                        />
                                        {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Message *</label>
                                        <textarea
                                            {...register('message')}
                                            rows={5}
                                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition-all resize-none ${errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-amber-500 bg-gray-50'
                                                }`}
                                            placeholder="Tell us more about what you're looking for..."
                                        />
                                        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-amber-600 text-white font-bold py-4 rounded-lg hover:bg-amber-700 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-amber-600/20"
                                    >
                                        {isSubmitting ? (
                                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Send Message
                                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Map Section */}
                <section className="h-[500px] w-full relative">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14131.065097241258!2d85.30948905330882!3d27.701358963577782!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190000000001%3A0x6e8a0f9184517332!2sNew%20Road%2C%20Kathmandu!5e0!3m2!1sen!2snp!4v1707198765432!5m2!1sen!2snp"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="grayscale contrast-125"
                    />
                    <div className="absolute top-8 left-8 bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white max-w-xs hidden md:block">
                        <h4 className="text-xl font-bold text-gray-900 tan-agean mb-2">Visit our Studio</h4>
                        <p className="text-sm text-gray-600 mb-4">Located in the heart of Kathmandu, our studio is designed to offer you a private and luxurious diamond viewing experience.</p>
                        <a
                            href="https://maps.app.goo.gl/XXXXX"
                            target="_blank"
                            className="text-amber-600 font-semibold text-sm hover:underline flex items-center gap-1"
                        >
                            Get Directions <MapPin size={14} />
                        </a>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
