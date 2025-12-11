import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
      {
        protocol: "https",
        hostname: "img.logo.dev",
      },
      {
        protocol: "https",
        hostname: "img.logokit.com",
      },
      // Allow any domain for fallback logos (favicon.ico, logo.png, etc.)
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Externalize pdf-parse for server-side (works with both Turbopack and Webpack)
  serverExternalPackages: ['pdf-parse'],
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
  // Keep webpack config for fallback (if --webpack flag is used)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize pdf-parse for server-side to avoid bundling issues
      config.externals = config.externals || [];
      config.externals.push('pdf-parse');
    }
    return config;
  },
};

export default nextConfig;
