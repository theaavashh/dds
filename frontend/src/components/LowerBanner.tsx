import Image from 'next/image';
import React from 'react';

const LowerBanner = () => {
  return (
    <div className="w-full">
      <Image
        src="/Hands Holding Two Rings.png"
        alt="Hands Holding Two Rings"
        width={1920}
        height={400}
        className="w-full h-auto object-cover"
        priority
      />
    </div>
  );
};

export default LowerBanner;