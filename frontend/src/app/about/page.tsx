'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AboutPage() {
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
                About <span className="text-amber-600">Celebration Diamonds</span>
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-600 max-w-2xl mx-auto"
                variants={fadeInUp}
              >
                Crafting timeless elegance with exceptional craftsmanship since our inception
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-8"
                  variants={fadeInUp}
                >
                  Our <span className="text-amber-600">Story</span>
                </motion.h2>
                <motion.div 
                  className="space-y-6 text-gray-600 text-lg leading-relaxed"
                  variants={fadeInUp}
                >
                  <p>
                    Founded with a vision to redefine luxury in fine jewelry, Celebration Diamonds has grown from a small boutique to a premier destination for exquisite jewelry pieces. Our journey began with a simple belief: that every piece of jewelry should tell a story of elegance, craftsmanship, and timeless beauty.
                  </p>
                  <p>
                    Today, we continue to honor traditional techniques while embracing innovation to create pieces that resonate with contemporary tastes. Each design reflects our commitment to excellence and our passion for the art of jewelry making.
                  </p>
                  <p>
                    Our team of skilled artisans brings decades of experience, combining ancestral techniques with modern precision to craft pieces that stand the test of time.
                  </p>
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative"
              >
                <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/necklaces.jpg"
                    alt="Our jewelry craftsmanship"
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">CD</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                variants={fadeInUp}
              >
                Our <span className="text-amber-600">Values</span>
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600 max-w-2xl mx-auto"
                variants={fadeInUp}
              >
                The principles that guide our commitment to excellence
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Quality Craftsmanship",
                  description: "Every piece undergoes meticulous inspection to ensure perfection in every detail.",
                  icon: "✨"
                },
                {
                  title: "Ethical Sourcing",
                  description: "We ensure all materials are ethically sourced and environmentally responsible.",
                  icon: "🌱"
                },
                {
                  title: "Customer Satisfaction",
                  description: "Your satisfaction drives our commitment to delivering exceptional service.",
                  icon: "💎"
                }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative"
              >
                <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/celeb.jpg"
                    alt="Our team at work"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-8"
                  variants={fadeInUp}
                >
                  Meet Our <span className="text-amber-600">Team</span>
                </motion.h2>
                <motion.div 
                  className="space-y-6 text-gray-600 text-lg leading-relaxed"
                  variants={fadeInUp}
                >
                  <p>
                    Our team of master jewelers, designers, and gemologists work together to bring your vision to life. With years of expertise and a passion for their craft, they transform raw materials into stunning works of art.
                  </p>
                  <p>
                    Each member of our team shares our commitment to excellence and customer satisfaction. We believe that great jewelry is born from great collaboration and attention to detail.
                  </p>
                  <p>
                    From initial concept to final polish, our artisans ensure that every piece meets our high standards of quality and beauty.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-8 pt-8 border-t border-gray-200"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Expertise</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['Design', 'Gemology', 'Manufacturing', 'Quality Control'].map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-amber-500 to-amber-600">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center text-white"
            >
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-6"
                variants={fadeInUp}
              >
                Visit Our Store
              </motion.h2>
              <motion.p 
                className="text-xl mb-8 max-w-2xl mx-auto"
                variants={fadeInUp}
              >
                Experience our collection in person and discover the perfect piece for your special moment.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <button className="bg-white text-amber-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                  Book an Appointment
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