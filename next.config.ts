import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a verification build go to its own folder (NEXT_DIST_DIR=.next-verify), so it cannot clash with another build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  /* config options here */
  compress: true,
  poweredByHeader: false,
  // Hashed build files are already cached for a year. Files from public/ are not by default, so browsers would ask for
  // the logo again and again. Kept for a week in the browser. Rename a file to change it sooner.
  async headers() {
    const week = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];
    return ["/logo.png", "/logo-mark-sm.png", "/logo-mark-dark-sm.png"].map((source) => ({ source, headers: week }));
  },
  // The product screenshots change rarely: keep their resized copies for a month, so they are not re-made.
  images: { minimumCacheTTL: 2678400 },
  async redirects() {
    return [
      { source: "/engine", destination: "/strategies", permanent: true },
      { source: "/strategies/focused-largecap-20", destination: "/strategies/focused-largecap-15", permanent: true },
      { source: "/subscribe/focused-largecap-20", destination: "/subscribe/focused-largecap-15", permanent: true },
      { source: "/reset-password", destination: "/forgot-password", permanent: false },
      { source: "/subscribe/all-access", destination: "/pricing", permanent: false },
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
