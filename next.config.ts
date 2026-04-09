import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    // Allow unoptimized external images at no extra cost on Vercel free tier
    unoptimized: false,
  },
};

export default nextConfig;
