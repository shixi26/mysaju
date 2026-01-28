import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repositoryName = process.env.REPOSITORY_NAME || 'mysaju';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  
  // GitHub Pages 배포 시 basePath 설정
  ...(isGitHubPages && {
    basePath: `/${repositoryName}`,
    assetPrefix: `/${repositoryName}/`,
  }),

  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
};

export default nextConfig;
