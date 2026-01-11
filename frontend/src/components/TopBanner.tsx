import Image from 'next/image';
import React from 'react';

const TopBanner = () => {
  return (
    <div className="w-full">
      <Image
        src="/Minimalist Bracelet Display.png"
        alt="Minimalist Bracelet Display"
        width={1920}
        height={400}
        className="w-full h-auto object-cover"
        priority
      />
    </div>
  );
};

export default TopBanner;