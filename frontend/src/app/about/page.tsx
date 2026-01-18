'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type AboutData = {
  id: string;
  isActive: boolean;
  heroSection?: {
    id: string;
    title: string;
    subtitle: string;
    isActive: boolean;
  } | null;
  heritageSection?: {
    id: string;
    title: string;
    content: string[];
    isActive: boolean;
  } | null;
  beyondSparkle?: {
    id: string;
    title: string;
    subtitle: string;
    items: { title: string; description: string; icon: string }[];
    footerText?: string;
    isActive: boolean;
  } | null;
  celebrations?: {
    id: string;
    title: string;
    content: string[];
    collections: string[];
    isActive: boolean;
  } | null;
  gemologist?: {
    id: string;
    name: string;
    title: string;
    company: string;
    expertise: string[];
    messageTitle: string;
    message: string[];
    signature: string;
    isActive: boolean;
  } | null;
  knowledge?: {
    id: string;
    title: string;
    subtitle: string;
    content: string[];
    isActive: boolean;
  } | null;
  promise?: {
    id: string;
    title: string;
    promises: string[];
    isActive: boolean;
  } | null;
  brandPromise?: {
    id: string;
    brandName: string;
    tagline: string;
    buttonText: string;
    buttonLink?: string;
    isActive: boolean;
  } | null;
} | null;

// Default fallback data
const defaultData: AboutData = {
  id: '',
  isActive: true,
  heroSection: {
    id: '',
    title: 'About Celebration Diamonds',
    subtitle: 'At Celebration Diamonds, we believe a diamond is not merely an ornament — it is a legacy, a promise, and a celebration of life\'s most meaningful moments.',
    isActive: true
  },
  heritageSection: {
    id: '',
    title: 'Our Heritage',
    content: [
      'Rooted in decades of gemological expertise, Celebration Diamonds is Nepal\'s first diamond studio with an in-house advanced gemological laboratory, where every diamond is examined beyond beauty — through science, ethics, and uncompromising precision.',
      'Our journey is guided by over 30 years of professional gemology experience, combining traditional knowledge passed through generations with modern international diamond grading standards. Every loose diamond entering Celebration Diamonds undergoes 28 internal analytical quality tests, conducted by GIA-trained diamond grading professionals and personally monitored by our senior gemologist.',
      'This ensures that what you choose is not just brilliant — but genuine, natural, and accurately graded.'
    ],
    isActive: true
  },
  beyondSparkle: {
    id: '',
    title: 'Beyond the Sparkle',
    subtitle: 'In an era of increasing lab-grown diamonds and undisclosed treatments, trust has become the rarest luxury.',
    items: [
      {
        title: 'Natural Origin',
        description: 'Each diamond is carefully verified for its natural formation and authenticity.',
        icon: '🌍'
      },
      {
        title: 'Authentic Grading',
        description: 'Accurate grading based on international standards and scientific analysis.',
        icon: '📊'
      },
      {
        title: 'Cut Precision',
        description: 'Expert analysis of cut precision and light performance for maximum brilliance.',
        icon: '✨'
      },
      {
        title: 'Structural Integrity',
        description: 'Comprehensive testing for durability and structural soundness.',
        icon: '🛡️'
      },
      {
        title: 'Ethical Sourcing',
        description: 'Verified ethical sourcing from responsible supply chains.',
        icon: '🌱'
      },
      {
        title: 'Scientific Verification',
        description: 'Advanced detection technology combined with human expertise.',
        icon: '🔬'
      }
    ],
    footerText: 'Our process bridges advanced detection technology with human expertise — because true luxury lies in knowing exactly what you own.',
    isActive: true
  },
  celebrations: {
    id: '',
    title: 'Crafted for Meaningful Celebrations',
    content: [
      'From engagement rings and bridal jewellery to bespoke diamond creations, our collections are designed to honour emotions, milestones, and personal stories. We work closely with our clients to create pieces that are timeless, refined, and deeply personal — jewellery that speaks quietly, yet leaves a lasting impression.'
    ],
    collections: ['Engagement Rings', 'Bridal Jewellery', 'Bespoke Creations', 'Timeless Pieces'],
    isActive: true
  },
  gemologist: {
    id: '',
    name: 'Mr. Subhas Verma',
    title: 'Senior Gemologist',
    company: 'Asian Gemological Laboratory and Institute Pvt Ltd',
    expertise: [
      'In-hand practical experience in Gemological field over 30 years',
      'Specialized in Diamond Grading and Gemstone identification',
      'Gemstone cutting and polishing expertise',
      'Astro gemological consultant and mining expert',
      'Gemological training counselling'
    ],
    messageTitle: 'A Personal Note on Trust, Truth & Timeless Diamonds',
    message: [
      'A diamond carries more than brilliance — it carries belief. Belief in authenticity. Belief in value. Belief in a promise that lasts a lifetime.',
      'For over three decades, I have dedicated my life to the science and soul of gemstones. Raised in a family deeply rooted in practical gemology and mineral trading, my learning began not in classrooms alone, but in mines, markets, and laboratories — where experience teaches what textbooks cannot.',
      'At Celebration Diamonds, every diamond is examined through a lens of responsibility and respect. Before beauty is admired, truth is established. Each stone undergoes 28 internal analytical quality tests, combining advanced detection technology with human expertise, ensuring its natural origin, precise grading, and long-term integrity.',
      'In today\'s evolving diamond market — where lab-grown stones, undisclosed treatments, and misleading representations are increasingly common — I believe knowledge is the highest form of luxury. Our role as gemologists is not only to certify diamonds, but to protect customers, educate minds, and preserve trust.',
      'Every diamond approved at Celebration Diamonds is one I would confidently recommend to my own family — because authenticity is personal, and trust is non-negotiable.',
      'Thank you for allowing us to be part of your most meaningful celebrations.'
    ],
    signature: 'Subhas Verma\nSenior Gemologist\nCelebration Diamonds Studio Pvt Ltd\nAsian Gemological Laboratory & Institute Pvt. Ltd.',
    isActive: true
  },
  knowledge: {
    id: '',
    title: 'Knowledge as a Luxury',
    subtitle: 'Celebration Diamonds is backed by the Asian Gemological Laboratory & Institute Pvt. Ltd., Nepal\'s pioneering gemstone testing and identification laboratory.',
    content: [
      'This foundation allows us to educate our clients, empower informed decisions, and raise awareness in a market where clarity matters more than ever.',
      'We don\'t just sell diamonds — we certify confidence, preserve value, and celebrate trust.'
    ],
    isActive: true
  },
  promise: {
    id: '',
    title: 'A Promise That Endures',
    promises: [
      'Absolute authenticity',
      'Scientific verification', 
      'Ethical responsibility',
      'Personal guidance',
      'A diamond worthy of your story'
    ],
    isActive: true
  },
  brandPromise: {
    id: '',
    brandName: 'Celebration Diamonds',
    tagline: 'Where Every Diamond Is Tested. Every Story Is Honoured.',
    buttonText: 'Discover Our Collection',
    buttonLink: '/jewelry',
    isActive: true
  }
};

export default function AboutPage() {
  const [data, setData] = useState<AboutData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await fetch('/api/about');
      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch about data:', error);
      // Keep default data on error
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pb-16 flex items-center justify-center">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pb-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-amber-50 to-stone-100 overflow-hidden">
          <div className="absolute inset-0 bg-black"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {data?.heroSection?.isActive && (
                <>
                  <motion.h1 
                    className="text-4xl  font-bold text-white tan-agean mb-6"
                    variants={fadeInUp}
                  >
                    {data?.heroSection?.title || 'About Celebration Diamonds'}
                  </motion.h1>
                  <motion.p 
                    className="text-xl text-white max-w-5xl mx-auto "
                    variants={fadeInUp}
                  >
                    {data?.heroSection?.subtitle || 'At Celebration Diamonds, we believe a diamond is not merely an ornament — it is a legacy, a promise, and a celebration of life\'s most meaningful moments.'}
                  </motion.p>
                </>
              )}
            </motion.div>
          </div>
        </section>

        {/* Our Heritage */}
        {data?.heritageSection?.isActive && (
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
                    className="text-3xl md:text-4xl font-bold text-gray-900 tan-agean mb-8"
                    variants={fadeInUp}
                  >
                    {data?.heritageSection?.title || 'Our Heritage'}
                  </motion.h2>
                  <motion.div 
                    className="space-y-6 text-gray-900 text-lg leading-relaxed text-justify"
                    variants={fadeInUp}
                  >
                    {data?.heritageSection?.content?.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    )) || (
                      <>
                        <p>Rooted in decades of gemological expertise, Celebration Diamonds is Nepal's first diamond studio with an in-house advanced gemological laboratory, where every diamond is examined beyond beauty — through science, ethics, and uncompromising precision.</p>
                        <p>Our journey is guided by over 30 years of professional gemology experience, combining traditional knowledge passed through generations with modern international diamond grading standards. Every loose diamond entering Celebration Diamonds undergoes 28 internal analytical quality tests, conducted by GIA-trained diamond grading professionals and personally monitored by our senior gemologist.</p>
                        <p>This ensures that what you choose is not just brilliant — but genuine, natural, and accurately graded.</p>
                      </>
                    )}
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
        )}

        {/* Beyond the Sparkle */}
        {data?.beyondSparkle?.isActive && (
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
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tan-agean"
                  variants={fadeInUp}
                >
                  {data?.beyondSparkle?.title || 'Beyond the Sparkle'}
                </motion.h2>
                <motion.p 
                  className="text-xl text-gray-900 max-w-5xl mx-auto"
                  variants={fadeInUp}
                >
                  {data?.beyondSparkle?.subtitle || 'In an era of increasing lab-grown diamonds and undisclosed treatments, trust has become the rarest luxury.'}
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data?.beyondSparkle?.items?.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </motion.div>
                )) || [
                  { title: "Natural Origin", description: "Each diamond is carefully verified for its natural formation and authenticity.", icon: "🌍" },
                  { title: "Authentic Grading", description: "Accurate grading based on international standards and scientific analysis.", icon: "📊" },
                  { title: "Cut Precision", description: "Expert analysis of cut precision and light performance for maximum brilliance.", icon: "✨" },
                  { title: "Structural Integrity", description: "Comprehensive testing for durability and structural soundness.", icon: "🛡️" },
                  { title: "Ethical Sourcing", description: "Verified ethical sourcing from responsible supply chains.", icon: "🌱" },
                  { title: "Scientific Verification", description: "Advanced detection technology combined with human expertise.", icon: "🔬" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 tan-agean">{item.title}</h3>
                    <p className="text-gray-900">{item.description}</p>
                  </motion.div>
                ))}
              </div>
              
              {data?.beyondSparkle?.footerText && (
                <motion.div 
                  className="mt-12 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <p className="text-lg text-gray-800 font-bold italic tan-agean">
                    {data.beyondSparkle.footerText}
                  </p>
                </motion.div>
              )}
            </div>
          </section>
        )}

{/* Crafted for Meaningful Celebrations */}
        {data?.celebrations?.isActive && (
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
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src="/celeb.jpg"
                      alt="Celebration diamonds collection"
                      width={600}
                      height={800}
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
                    className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 tan-agean leading-relaxed"
                    variants={fadeInUp}
                  >
                    {data?.celebrations?.title || 'Crafted for Meaningful Celebrations'}
                  </motion.h2>
                  <motion.div 
                    className="space-y-6 text-gray-900 text-lg leading-relaxed"
                    variants={fadeInUp}
                  >
                    {data?.celebrations?.content?.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    )) || (
                      <p>
                        From engagement rings and bridal jewellery to bespoke diamond creations, our collections are designed to honour emotions, milestones, and personal stories. We work closely with our clients to create pieces that are timeless, refined, and deeply personal — jewellery that speaks quietly, yet leaves a lasting impression.
                      </p>
                    )}
                  </motion.div>
                  
                
                </motion.div>
              </div>
            </div>
          </section>
        )}


        {/* Knowledge as a Luxury */}
        {data?.knowledge?.isActive && (
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 md:px-6">
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="text-center "
              >
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-gray-900 tan-agean"
                  variants={fadeInUp}
                >
                  {data?.knowledge?.title || 'Knowledge as a Luxury'}
                </motion.h2>

                <motion.p 
                  className="text-xl text-gray-900 max-w-5xl mx-auto bg-black"
                  variants={fadeInUp}
                >
                  {data?.knowledge?.subtitle || 'Celebration Diamonds is backed by the Asian Gemological Laboratory & Institute Pvt. Ltd., Nepal\'s pioneering gemstone testing and identification laboratory.'}
                </motion.p>
              </motion.div>

              <motion.div 
                className="max-w-4xl mx-auto text-center space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {data?.knowledge?.content && data.knowledge.content.map((paragraph, index) => {
                  const isLast = index === (data.knowledge?.content?.length || 0) - 1;
                  return (
                  <p key={index} className={`text-lg text-gray-600 leading-relaxed ${isLast ? 'font-semibold' : ''}`}>
                    {paragraph}
                  </p>
                  );
                }) || [
                  'This foundation allows us to educate our clients, empower informed decisions, and raise awareness in a market where clarity matters more than ever.',
                  'We don\'t just sell diamonds — we certify confidence, preserve value, and celebrate trust.'
                ].map((paragraph, index) => (
                  <p key={index} className={`text-lg text-gray-600 leading-relaxed ${index === 1 ? 'font-semibold' : ''}`}>
                    {paragraph}
                  </p>
                ))}
              </motion.div>
            </div>
          </section>
        )}



        {/* A Promise That Endures */}
        {data?.promise?.isActive && (
          <section className="py-20 bg-gradient-to-br from-amber-50 to-stone-100">
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
                  {data?.promise?.title || 'A Promise That Endures'}
                </motion.h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-7xl mx-auto">
                {data?.promise?.promises?.map((promise, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 text-center group hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-lg">•</span>
                    </div>
                    <p className="text-gray-700 font-medium leading-relaxed">{promise}</p>
                  </motion.div>
                )) || [
                  "Absolute authenticity",
                  "Scientific verification", 
                  "Ethical responsibility",
                  "Personal guidance",
                  "A diamond worthy of your story"
                ].map((promise, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 text-center group hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-lg">•</span>
                    </div>
                    <p className="text-gray-700 font-medium leading-relaxed">{promise}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}


        {/* Meet our Gemologist */}
        {data?.gemologist?.isActive && (
          <section className="py-20 bg-white">
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
                  Meet our <span className="text-amber-600">Gemologist</span>
                </motion.h2>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="relative"
                >
                  <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white text-2xl font-bold">SV</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{data?.gemologist?.name || 'Mr. Subhas Verma'}</h3>
                        <p className="text-amber-600 font-semibold">{data?.gemologist?.title || 'Senior Gemologist'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        <span className="font-semibold">Gemologist at:</span> {data?.gemologist?.company || 'Asian Gemological Laboratory and Institute Pvt Ltd'}
                      </p>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Expertise & Experience:</h4>
                        <ul className="space-y-2">
                          {data?.gemologist?.expertise?.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-3 h-3 bg-amber-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                              <span className="text-gray-600">{item}</span>
                            </li>
                          )) || [
                            'In-hand practical experience in Gemological field over 30 years',
                            'Specialized in Diamond Grading and Gemstone identification',
                            'Gemstone cutting and polishing expertise',
                            'Astro gemological consultant and mining expert',
                            'Gemological training counselling'
                          ].map((item, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-3 h-3 bg-amber-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                              <span className="text-gray-600">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                >
                  <motion.h3 
                    className="text-2xl font-bold text-gray-900 mb-6"
                    variants={fadeInUp}
                  >
                    Gemologist's <span className="text-amber-600">Message</span>
                  </motion.h3>
                  
                  <motion.div 
                    className="bg-gradient-to-br from-gray-50 to-stone-50 rounded-2xl p-8 shadow-sm"
                    variants={fadeInUp}
                  >
                    <h4 className="text-xl font-semibold text-gray-900 mb-4 italic">
                      {data?.gemologist?.messageTitle || 'A Personal Note on Trust, Truth & Timeless Diamonds'}
                    </h4>
                    
                    <div className="space-y-4 text-gray-600 leading-relaxed">
                      {data?.gemologist?.message?.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      )) || [
                        'A diamond carries more than brilliance — it carries belief. Belief in authenticity. Belief in value. Belief in a promise that lasts a lifetime.',
                        'For over three decades, I have dedicated my life to the science and soul of gemstones. Raised in a family deeply rooted in practical gemology and mineral trading, my learning began not in classrooms alone, but in mines, markets, and laboratories — where experience teaches what textbooks cannot.',
                        'At Celebration Diamonds, every diamond is examined through a lens of responsibility and respect. Before beauty is admired, truth is established. Each stone undergoes 28 internal analytical quality tests, combining advanced detection technology with human expertise, ensuring its natural origin, precise grading, and long-term integrity.',
                        'In today\'s evolving diamond market — where lab-grown stones, undisclosed treatments, and misleading representations are increasingly common — I believe knowledge is the highest form of luxury. Our role as gemologists is not only to certify diamonds, but to protect customers, educate minds, and preserve trust.',
                        'Every diamond approved at Celebration Diamonds is one I would confidently recommend to my own family — because authenticity is personal, and trust is non-negotiable.',
                        'Thank you for allowing us to be part of your most meaningful celebrations.'
                      ].map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-gray-700 whitespace-pre-line">
                        {data?.gemologist?.signature || '— Subhas Verma\nSenior Gemologist\nCelebration Diamonds Studio Pvt Ltd\nAsian Gemological Laboratory & Institute Pvt. Ltd.'}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>
        )}

       


        {/* Brand Promise */}
        {data?.brandPromise?.isActive && (
          <section className="py-20 bg-[#DFC97E]">
            <div className="container mx-auto px-4 md:px-6">
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="text-center text-white"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="mb-8"
                >
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 tan-agean">{data?.brandPromise?.brandName || 'Celebration Diamonds'}</h2>
                  <div className="w-24 h-1 bg-white mx-auto rounded-full"></div>
                </motion.div>

                <motion.div className='text-2xl font-bold text-white  tan-agean mb-8 max-w-4xl mx-auto leading-relaxed '> {data?.brandPromise?.tagline || 'Where Every Diamond Is Tested. Every Story Is Honoured.'}</motion.div>
                
                
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <a 
                    href={data?.brandPromise?.buttonLink || '/jewelry'}
                    className="inline-block bg-white text-amber-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg tan-agean"
                  >
                    {data?.brandPromise?.buttonText || 'Discover Our Collection'}
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}