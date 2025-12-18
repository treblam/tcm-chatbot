import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
    ],
  },
  serverExternalPackages: [],
  turbopack: {
    resolveAlias: {
      // 允许使用 node 内置模块
      "node:fs/promises": "fs/promises",
      "node:fs": "fs",
      "node:path": "path",
    },
  },
};

export default nextConfig;
