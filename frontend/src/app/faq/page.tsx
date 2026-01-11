'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
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
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all unworn jewelry items in their original condition. Items must include all original packaging and documentation. Please contact our customer service team to initiate a return."
    },
    {
      question: "How do I care for my jewelry?",
      answer: "To maintain the beauty of your jewelry, we recommend cleaning with a soft cloth and mild soap. Avoid exposure to harsh chemicals, perfumes, and lotions. Store in a dry place and remove during physical activities."
    },
    {
      question: "Do you offer custom jewelry design?",
      answer: "Yes, we offer custom design services to create unique pieces tailored to your preferences. Our team of designers will work with you from concept to completion to bring your vision to life."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days within the country. International shipping typically takes 7-14 business days depending on the destination. Expedited shipping options are available at checkout."
    },
    {
      question: "Are your diamonds ethically sourced?",
      answer: "Absolutely. We are committed to ethical sourcing and ensure all our diamonds and precious materials come from conflict-free sources that meet international standards."
    },
    {
      question: "Do you provide jewelry appraisals?",
      answer: "Yes, we provide complimentary appraisals for all jewelry purchased from Celebration Diamonds. For existing pieces, we offer appraisal services through our certified gemologists."
    },
    {
      question: "Can I resize my ring?",
      answer: "Yes, we offer ring resizing services. The time and cost depend on the complexity of the piece. Please contact us to schedule an appointment with our craftsmen."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, bank transfers, and digital payment methods. For high-value items, we also offer financing options subject to approval."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-amber-50 to-stone-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-stone-200/20"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.h1 
                className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
                variants={fadeInUp}
              >
                Frequently Asked <span className="text-amber-600">Questions</span>
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-600 max-w-2xl mx-auto"
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
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
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