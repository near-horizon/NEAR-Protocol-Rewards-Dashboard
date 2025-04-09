import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/dashboard',
        destination: 'https://near-protocol-rewards-tracking.com/dashboard',
      },
    ];
  },
};

export default nextConfig;
