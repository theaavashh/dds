'use client';

import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <Image
        src="/CD Home page up.jpg"
        alt="Crafting the future of fine diamonds"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
    </section>
  );
}
