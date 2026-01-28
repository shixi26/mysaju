import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repositoryName = process.env.REPOSITORY_NAME || 'mysaju';

const nextConfig: NextConfig = {
  // GitHub Pages 정적 배포
  output: 'export', // 정적 내보내기
  
  // GitHub Pages 배포 시에만 basePath 설정
  ...(isGitHubPages && {
    basePath: `/${repositoryName}`,
    assetPrefix: `/${repositoryName}/`,
  }),

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // 이미지 최적화 비활성화
  },
};

export default nextConfig;
