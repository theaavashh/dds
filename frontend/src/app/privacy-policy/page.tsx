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
                Privacy <span className="text-amber-600">Policy</span>
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-600 max-w-2xl mx-auto"
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Last Updated: January 10, 2026</h2>
                  <p className="text-gray-600">
                    This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
                  </p>
                </div>

                <div className="space-y-12">
                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Information We Collect</h3>
                    <p className="text-gray-600 mb-4">
                      We collect information that identifies you as a customer or visitor to our website and stores, such as:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                      <li>Personal identification information (Name, email address, phone number, shipping address)</li>
                      <li>Payment information (credit card details, billing address)</li>
                      <li>Browsing information (pages visited, time spent on site, products viewed)</li>
                      <li>Device information (IP address, browser type, operating system)</li>
                      <li>Communication preferences and customer service interactions</li>
                    </ul>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">How We Use Your Information</h3>
                    <p className="text-gray-600 mb-4">
                      We use the collected data for various purposes:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                      <li>To provide and maintain our Service</li>
                      <li>To process transactions and send related information</li>
                      <li>To provide customer support and respond to inquiries</li>
                      <li>To send marketing communications (with your consent)</li>
                      <li>To monitor and analyze usage patterns</li>
                      <li>To detect, prevent, and address technical issues</li>
                      <li>To comply with legal obligations</li>
                    </ul>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Data Security</h3>
                    <p className="text-gray-600 mb-4">
                      We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h3>
                    <p className="text-gray-600 mb-4">
                      We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Third-Party Services</h3>
                    <p className="text-gray-600 mb-4">
                      We may employ third-party companies and individuals to facilitate our Service, provide the Service on our behalf, perform Service-related services, or assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Your Rights</h3>
                    <p className="text-gray-600 mb-4">
                      Depending on your location, you may have the following rights regarding your personal data:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                      <li>The right to access, update or delete the information we have on you</li>
                      <li>The right to rectification of inaccurate data</li>
                      <li>The right to restrict processing of your personal data</li>
                      <li>The right to data portability</li>
                      <li>The right to withdraw consent where we rely on consent</li>
                    </ul>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h3>
                    <p className="text-gray-600 mb-4">
                      We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h3>
                    <p className="text-gray-600">
                      If you have any questions about this Privacy Policy, please contact us:<br />
                      Email: privacy@celebrationdiamonds.com<br />
                      Phone: +1 (555) 123-4567<br />
                      Address: 123 Jewelry Lane, Diamond District, New York, NY 10001
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