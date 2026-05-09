import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'rocatileusa.com',
      },
      {
        protocol: 'https',
        hostname: 'www.us.roca.com',
      },
      {
        protocol: 'https',
        hostname: 'us.roca.com',
      },
      {
        protocol: 'https',
        hostname: 'website-duneceramics.s3.eu-central-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'duneceramics.com',
      },
      {
        protocol: 'https',
        hostname: 'www.duneceramics.com',
      },
    ],
  },
};

export default nextConfig;
