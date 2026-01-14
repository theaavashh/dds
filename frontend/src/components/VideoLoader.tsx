import { useState, useEffect } from 'react';

const VideoLoader = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide loader after video completes or after a timeout
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000); // 5 seconds timeout in case video doesn't load

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          src="/CDS Logo landscape.mp4"
          autoPlay
          muted
          playsInline
          loop={false}
          onEnded={() => setIsVisible(false)}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};

export default VideoLoader;