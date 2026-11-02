import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Отключает проверку ESLint при сборке на Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Отключает проверку типов TypeScript при сборке
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
