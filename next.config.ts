import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repositoryName = process.env.REPOSITORY_NAME || 'mysaju';

const nextConfig: NextConfig = {
  output: 'export',

  ...(isGitHubPages && {
    basePath: `/${repositoryName}`,
    assetPrefix: `/${repositoryName}/`,
  }),

  trailingSlash: true,            // ✅ 추가

  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
};

export default nextConfig;
