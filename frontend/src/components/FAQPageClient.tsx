'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPageClient() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: 'easeOut' }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const faqs = [
        {
            question: "Are your diamonds natural or lab-grown?",
            answer: "At Celebration Diamonds, we primarily deal in natural diamonds. Every diamond is scientifically tested and verified in our in-house gemological laboratory to confirm its origin, authenticity, and grading. Any disclosure, if applicable, is done with complete transparency."
        },
        {
            question: "How do you ensure the authenticity of your diamonds?",
            answer: "Each loose diamond undergoes 28 internal analytical quality tests, conducted by GIA-trained diamond grading professionals and personally supervised by our senior gemologist with over 30 years of experience."
        },
        {
            question: "Do you provide diamond certificates?",
            answer: "Yes. Diamonds are provided with proper grading documentation and verification. Our processes are backed by the Asian Gemological Laboratory & Institute Pvt. Ltd., ensuring scientific accuracy and reliability."
        },
        {
            question: "What makes Celebration Diamonds different from other jewellers?",
            answer: "We are Nepal\u2019s first diamond studio with an in-house advanced gemological laboratory. We don\u2019t rely solely on visual beauty \u2014 every diamond is tested for origin, cut precision, durability, and ethical integrity before it reaches you."
        },
        {
            question: "Can I customise my jewellery?",
            answer: "Absolutely. We specialise in bespoke diamond jewellery, working closely with clients to create pieces that reflect personal stories, emotions, and milestones \u2014 from engagement rings to heirloom creations."
        },
        {
            question: "How do you address lab-grown diamonds and treated stones?",
            answer: "In today\u2019s market, undisclosed lab-grown and treated diamonds are a concern. Our advanced detection technology and expert analysis ensure clear identification and full disclosure, so you always know exactly what you are purchasing."
        },
        {
            question: "Are your diamonds ethically sourced?",
            answer: "Yes. Ethical responsibility is a core value at Celebration Diamonds. We carefully assess sourcing practices to ensure diamonds are obtained through responsible and ethical channels."
        },
        {
            question: "Can customers see the testing or verification process?",
            answer: "Yes. Transparency builds trust. Wherever possible, we guide clients through the testing, grading, and verification process, helping them make confident and informed decisions."
        },
        {
            question: "Do you educate customers about diamonds?",
            answer: "Yes. Knowledge is a luxury. Backed by a professional gemological institute, we believe in educating our clients, not just selling diamonds."
        },
        {
            question: "Why is diamond testing important?",
            answer: "Diamond testing protects you from misrepresentation, undisclosed treatments, and incorrect grading. It ensures long-term value, durability, and peace of mind."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="pb-16">
                {/* Hero Section */}
                <section className="relative py-20 md:py-32 bg-black overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-stone-200/20"></div>
                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <motion.div
                            className="max-w-4xl mx-auto text-center"
                            initial="initial"
                            animate="animate"
                            variants={staggerContainer}
                        >
                            <motion.h1
                                className="text-4xl md:text-6xl font-bold text-white mb-6 tan-agean leading-relaxed"
                                variants={fadeInUp}
                            >
                                Frequently Asked <span className="text-amber-600">Questions</span>
                            </motion.h1>
                            <motion.p
                                className="text-xl text-white max-w-3xl mx-auto"
                                variants={fadeInUp}
                            >
                                Find answers to common questions about our products, services, and policies
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial="initial"
                                whileInView="animate"
                                viewport={{ once: true }}
                                variants={staggerContainer}
                                className="space-y-6"
                            >
                                {faqs.map((faq, index) => (
                                    <motion.div
                                        key={index}
                                        variants={fadeInUp}
                                        className="border border-gray-200 rounded-xl overflow-hidden"
                                    >
                                        <button
                                            className="w-full flex justify-between items-center p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                                            onClick={() => toggleFAQ(index)}
                                        >
                                            <h3 className="text-lg md:text-xl font-semibold text-gray-900">{faq.question}</h3>
                                            {openIndex === index ? (
                                                <ChevronUp className="h-5 w-5 text-amber-600" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-amber-600" />
                                            )}
                                        </button>
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                height: openIndex === index ? 'auto' : '0',
                                                opacity: openIndex === index ? 1 : 0
                                            }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 border-t border-gray-100">
                                                <p className="text-gray-600">{faq.answer}</p>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4 md:px-6">
                        <motion.div
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <motion.h2
                                className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tan-agean"
                                variants={fadeInUp}
                            >
                                Still have <span className="text-amber-600">questions</span>?
                            </motion.h2>
                            <motion.p
                                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                                variants={fadeInUp}
                            >
                                Our customer service team is ready to assist you with any additional inquiries.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                <button className="bg-amber-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-amber-700 transition-colors shadow-lg">
                                    Contact Us
                                </button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}