import type { NextConfig } from 'next';

const nextConfig: NextConfig = {

  // GitHub Pages 정적 배포
  output: 'export',
  basePath: '/mysaju',
  assetPrefix: '/mysaju/',

  
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
