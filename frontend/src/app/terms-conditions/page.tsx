'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function TermsConditionsPage() {
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
                Terms & <span className="text-amber-600">Conditions</span>
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-600 max-w-2xl mx-auto"
                variants={fadeInUp}
              >
                Please read these terms and conditions carefully before using our services
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Terms & Conditions Content */}
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
                    Welcome to Celebration Diamonds, based in Kathmandu, Nepal. By accessing or using our website, you agree to comply with the following terms and conditions. These terms apply to all visitors, customers, and partners who interact with our services either online or in-store.
                  </p>
                </div>

                <div className="space-y-12">
                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">1. Eligibility</h3>
                    <p className="text-gray-600 mb-4">
                      You must be at least 18 years old or use the site under the supervision of a parent or legal guardian.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">2. Product Information</h3>
                    <p className="text-gray-600 mb-4">
                      We make every effort to display our products accurately. However, slight variations in gemstones and gemstone colour, metal finishes and metal, metal appearance, and design details may occur due to natural materials and craftsmanship.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">3. Pricing</h3>
                    <p className="text-gray-600 mb-4">
                      All prices listed are in Nepalese Rupees (NPR) and are inclusive of applicable local taxes unless stated otherwise.
International pricing will be calculated as per the currency rates provided by authorised bank.Prices are subject to change without prior notice.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">4. Orders & Payment</h3>
                    <p className="text-gray-600 mb-4">
                      Orders are confirmed only after full or agreed partial payment. We accept online payment, mobile banking, cash, or card transactions via secure gateways.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">5. Custom Orders</h3>
                    <p className="text-gray-600 mb-4">
                      Customized jewelry is refundable as per our return and refund policies.Production begins only after design approval and agreed-upon advance payment.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">6. Intellectual Property</h3>
                    <p className="text-gray-600 mb-4">
                      All content on this website, including text, images, logos, and designs, is the property of Celebration Diamonds and may not be reproduced or republished without permission.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h3>
                    <p className="text-gray-600 mb-4">
                      We are not liable for any indirect or consequential damages arising from the use of our products or website.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">8. Governing Law</h3>
                    <p className="text-gray-600 mb-4">
                      These terms are governed by the laws of Nepal and applicable international commerce practices.
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