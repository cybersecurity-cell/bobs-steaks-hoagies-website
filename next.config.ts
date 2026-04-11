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
    // Local /public images (storefront-hero.jpg, logo.png, menu.jpg, merch/*)
    // are served directly — no remotePatterns needed.
    unoptimized: false,
  },
};

export default nextConfig;
