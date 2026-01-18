'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
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
                className="text-4xl md:text-6xl font-bold text-white mb-6 tan-agean"
                variants={fadeInUp}
              >
                Privacy <span className="text-amber-600">Policy</span>
              </motion.h1>
              <motion.p 
                className="text-xl text-white max-w-3xl mx-auto"
                variants={fadeInUp}
              >
                How we collect, use, and protect your personal information
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Privacy Policy Content */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="prose prose-lg max-w-none"
              >
                <div className="mb-12">
                  <p className="text-gray-600">
                    At Celebration Diamonds, your privacy is important to us. We respect and protect your personal data in accordance with Nepal’s Data Protection Laws and global standards like GDPR.
                  </p>
                </div>

                <div className="space-y-12">
                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                      <li>Name, email, phone number</li>
                      <li>Billing/shipping address</li>
                      <li>Purchase and service history</li>
                      <li>Digital interactions (e.g., cookies, IP address)</li>
                    </ul>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                      <li>To process orders and deliver services</li>
                      <li>For customer support and communication</li>
                      <li>To personalize your experience</li>
                      <li>For marketing purposes (with consent)</li>
                    </ul>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">3. Data Protection</h3>
                    <p className="text-gray-600 mb-4">
                      Your data is stored securely. We do not sell or share your data with third parties without your consent, except for payment processing or legal obligations.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">4. Cookies</h3>
                    <p className="text-gray-600 mb-4">
                      We use cookies to enhance your browsing experience. You can choose to disable cookies via your browser settings.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">5. Your Rights</h3>
                    <p className="text-gray-600 mb-4">
                      You can request access, correction, or deletion of your personal data at any time.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}