'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';

const PreciousCraft: FC = () => {
    return (
        <section className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center max-w-5xl mx-auto"
                >
                    <h2 className="text-3xl md:text-4xl text-black mb-8 cabinet font-medium">
                        A Moments of Precious Craft
                    </h2>
                    <p className="text-sm md:text-base text-gray-800 leading-loose tracking-wide font-medium uppercase">
                        Our products exhibit a diversification of cultures much like our customers whose LOYALTY is not just an asset from our patrons but also a value towards our customers. Our faith in them is as unwavering as their towards us.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default PreciousCraft;
