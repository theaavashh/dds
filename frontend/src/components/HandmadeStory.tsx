'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';


export default function HandmadeStory() {
    return (
        <section className="py-4 md:py-24 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section 1: Flagship Store */}
                <div className="flex flex-col mb-16 md:mb-32">
                    {/* Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl text-black leading-tight">
                            <span className="text-4xl block md:inline mr-3 font-bold tan-agean text-[#DFC97E]">Handmade</span>
                            <span className="text-2xl md:text-2xl font-semibold  block md:inline mt-2 md:mt-0 italic">
                                In Our Flagship Store
                            </span>
                        </h2>
                    </motion.div>

                    {/* Images Grid - 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-12 lg:gap-20 items-center">

                        {/* Left Image - Store Interior */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative w-full aspect-[4/3] md:aspect-[5/4] bg-gray-100"
                        >
                            <Image
                                src="/earring.jpg" // TODO: Replace with actual image
                                alt="Flagship Store Interior"
                                fill
                                className="object-cover"
                            />
                        </motion.div>

                        {/* Right Image - Craftsmanship */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="relative w-full aspect-square md:aspect-square lg:w-[90%] lg:ml-auto bg-gray-100 mt-8 md:mt-20"
                        >
                            <Image
                                src="/ladiesbracelet.jpg" // TODO: Replace with actual image
                                alt="Jewelry Crafting"
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Section 2: The Founder */}
                <div className="flex flex-col">
                    {/* Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12 text-right w-full"
                    >
                        <h2 className="text-4xl md:text-5xl text-black leading-tight flex flex-col md:block items-end md:text-right">
                            <span className="text-2xl md:text-3xl font-semibold  uppercase block md:inline mb-2 md:mb-0 md:mr-3">
                                FIND OUT MORE
                            </span>
                            <span className="italic text-4xl md:text-6xl font-bold tan-agean text-[#DFC97E]">
                                about the products
                            </span>
                        </h2>
                    </motion.div>

                    {/* Images Grid - 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-12 lg:gap-20 items-end">

                        {/* Left Image - Founder Portrait */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative w-full aspect-[3/4] md:aspect-[3/4] lg:w-[85%] bg-gray-100"
                        >
                            <Image
                                src="/ladiesring.jpg" // TODO: Replace with actual image
                                alt="Founder Portrait"
                                fill
                                className="object-cover"
                            />
                        </motion.div>

                        {/* Right Image - Nature/Action Shot */}
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="relative w-full aspect-[4/5] bg-gray-100 -mt-10 md:mt-10 md:mb-20"
                        >
                            <Image
                                src="/mangalsutra.jpg" // TODO: Replace with actual image
                                alt="Founder in Nature"
                                fill
                                className="object-cover"
                            />
                            {/* Optional: Add a button or link if needed based on "FIND OUT MORE" */}
                        </motion.div>

                    </div>
                </div>

            </div>
        </section>
    );
}
