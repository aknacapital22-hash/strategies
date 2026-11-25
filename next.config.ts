import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a verification build go to its own folder (NEXT_DIST_DIR=.next-verify), so it cannot clash with another build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  /* config options here */
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/engine", destination: "/strategies", permanent: true },
      { source: "/reset-password", destination: "/forgot-password", permanent: false },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
