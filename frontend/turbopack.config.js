/** @type {import('next').NextConfig} */

const nextConfig = {
  // Disable the webpack config warning since we're using Next.js built-in config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Apply compression plugin for client-side builds
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    return config;
  },
};

module.exports = nextConfig;