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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Last Updated: January 10, 2026</h2>
                  <p className="text-gray-600">
                    Welcome to Celebration Diamonds. These terms and conditions outline the rules and regulations for the use of Celebration Diamonds' Website and Services.
                  </p>
                </div>

                <div className="space-y-12">
                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Introduction</h3>
                    <p className="text-gray-600 mb-4">
                      By accessing this website, you agree to be bound by these terms and conditions, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Intellectual Property</h3>
                    <p className="text-gray-600 mb-4">
                      Unless otherwise stated, Celebration Diamonds and/or its licensors own the intellectual property rights for all material on Celebration Diamonds. All intellectual property rights are reserved. You may access this from Celebration Diamonds for your own personal use subjected to restrictions set in these terms and conditions.
                    </p>
                    <p className="text-gray-600">
                      You must not reproduce, duplicate, or copy content from Celebration Diamonds without express written permission from us.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Prohibited Activities</h3>
                    <p className="text-gray-600 mb-4">
                      You are specifically restricted from all of the following:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                      <li>Publishing any Website material in any other media</li>
                      <li>Selling, sublicensing and/or otherwise commercializing any Website material</li>
                      <li>Publicly performing and/or showing any Website material</li>
                      <li>Using this Website in any way that is or may be damaging to this Website</li>
                      <li>Using this Website in any way that impacts user access to this Website</li>
                      <li>Using this Website contrary to applicable laws and regulations</li>
                      <li>Engaging in any data mining, data harvesting, or similar extraction activities</li>
                    </ul>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Products and Services</h3>
                    <p className="text-gray-600 mb-4">
                      All products and services offered by Celebration Diamonds are described with accuracy on our website. We reserve the right to refuse any order placed through our website. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order.
                    </p>
                    <p className="text-gray-600">
                      Prices for products and services are subject to change without notice. We reserve the right to discontinue any product or service at any time.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Order and Payment</h3>
                    <p className="text-gray-600 mb-4">
                      By placing an order, you warrant that you are legally capable of entering into binding contracts. All orders placed through our website are subject to acceptance by us. We may require additional verification or information before accepting any order.
                    </p>
                    <p className="text-gray-600">
                      Payment must be made in full before we process your order. We accept various payment methods as indicated on our website. All payments are processed securely through trusted payment processors.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Shipping and Delivery</h3>
                    <p className="text-gray-600 mb-4">
                      Shipping costs and delivery times are specified during the checkout process. We are not responsible for delays caused by shipping carriers or customs procedures. Risk of loss and title for items purchased pass to you upon delivery to the carrier.
                    </p>
                    <p className="text-gray-600">
                      We are not responsible for packages that are reported as delivered by the shipping carrier but not received by the customer. In case of lost or damaged shipments, please contact us immediately.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Returns and Refunds</h3>
                    <p className="text-gray-600 mb-4">
                      Our return and refund policy is governed by separate terms. Generally, items must be returned in their original condition within 30 days of receipt. Certain items may be non-returnable. Please refer to our Return Policy for complete details.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Limitation of Liability</h3>
                    <p className="text-gray-600 mb-4">
                      In no event shall Celebration Diamonds, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                    </p>
                    <p className="text-gray-600">
                      Celebration Diamonds' total liability to you for any claims arising out of or relating to these terms shall not exceed the amount you paid to Celebration Diamonds for the products or services that gave rise to the claim.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Governing Law</h3>
                    <p className="text-gray-600 mb-4">
                      These terms shall be governed and construed in accordance with the laws of Nepal, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these terms will not be considered a waiver of those rights. If any provision of these terms is held to be invalid or unenforceable by a court, the remaining provisions of these terms will remain in effect.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Changes to Terms</h3>
                    <p className="text-gray-600 mb-4">
                      We reserve the right, at our sole discretion, to modify or replace these terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h3>
                    <p className="text-gray-600">
                      If you have any questions about these Terms and Conditions, please contact us:<br />
                      Email: legal@celebrationdiamonds.com<br />
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