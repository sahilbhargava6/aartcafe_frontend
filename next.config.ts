import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aartcafe-backend-production-rjudvs.laravel.cloud",
      },
      {
        protocol: "https",
        hostname: "367be3a2035528943240074d0096e0cd.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
