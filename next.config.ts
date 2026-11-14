import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // swcMinify удален, так как он устарел в Next.js 15
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
