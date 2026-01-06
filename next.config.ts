import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // If your repository name is not 'username.github.io', uncomment and set the basePath
  // basePath: '/omnient-bord-game',
  // trailingSlash: true,
};

export default nextConfig;
