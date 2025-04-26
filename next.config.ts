import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['s3proxygw.cineplexx.at', 'movie.pequla.com'],
  },
  output: "standalone",
};

export default nextConfig;
