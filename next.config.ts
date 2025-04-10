import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/dashboard',
  assetPrefix: '/dashboard/',
  trailingSlash: true, // importante para exportação estática se for usar isso
};

export default nextConfig;
