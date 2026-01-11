'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const clients = [
    {
        id: 1,
        name: "Facebook",
        description: "Characters, diversity and style that brings for the app some comemorative dates.",
        image: "/hands-holding-diamonds.jpg", // Placeholder
        color: "bg-blue-500", // Fallback color
        reverse: false
    },
    {
        id: 2,
        name: "Huawei",
        description: "Meet Hu, The New Digital Influencer that is the face of Huawei.",
        image: "/earring.jpg", // Placeholder
        color: "bg-emerald-500",
        reverse: true
    },
    {
        id: 3,
        name: "Instagram",
        description: "Create Don't Hate is an Anti-Bullying Online and Offline Campaign by Instagram.",
        image: "/necklaces.jpg", // Placeholder
        color: "bg-purple-500",
        reverse: false
    }
];

function ClientItem({ client }: { client: any }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    return (
        <div
            ref={ref}
            className={`flex flex-col ${client.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}
        >
            {/* Image Side */}
            <motion.div
                className="w-full md:w-1/2"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                {/* Parallax Container */}
                <div className={`relative aspect-[4/5] md:aspect-[3/4]  overflow-hidden shadow-xl ${client.color}`}>
                    <motion.div className="w-full h-[120%] -top-[10%] relative" style={{ y }}>
                        <Image
                            src={client.image}
                            alt={client.name}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </motion.div>
                </div>
            </motion.div>

            {/* Text Side */}
            <motion.div
                className="w-full md:w-1/2 flex flex-col justify-center items-start"
                initial={{ opacity: 0, x: client.reverse ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <h3 className="text-3xl md:text-5xl font-medium text-gray-900 mb-6">
                    {client.name}
                </h3>
                <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
                    {client.description}
                </p>
                <Link href="#" className="flex items-center text-blue-500 font-medium hover:text-blue-600 transition-colors group">
                    <span className="text-sm uppercase tracking-wide">Learn more</span>
                    <svg
                        className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </motion.div>
        </div>
    );
}

export default function ClientWork() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col gap-24 md:gap-40">

                    {clients.map((client) => (
                        <ClientItem key={client.id} client={client} />
                    ))}

                </div>
            </div>
        </section>
    );
}
