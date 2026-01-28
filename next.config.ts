import type { NextConfig } from 'next';

const nextConfig: NextConfig = {

  // GitHub Pages 정적 배포
  output: 'export', //정적 내보내기
  basePath: '/mysaju', //레포지토리 이름
  assetPrefix: '/mysaju/', //하위 파일 경로

  
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, //이미지 최적화 비활성화
  },
};

export default nextConfig;
