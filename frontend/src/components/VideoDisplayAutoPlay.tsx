'use client';

import { useRef, useState, useEffect } from 'react';

const VideoDisplayAutoPlay = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt to play the video automatically
    const playVideo = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        // Auto-play was prevented
        setIsPlaying(false);
      }
    };

    playVideo();

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <div className="max-full mt-18 md:my-6">
      <video
        ref={videoRef}
        src="/Dharma-Home-Page-Video.mp4"
        className="w-full h-auto object-cover max-h-[1600px]"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
    </div>
  );
};

export default VideoDisplayAutoPlay;