import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export in production builds
  // In development, Next.js will handle dynamic routes normally
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  /* config options here */
};

export default nextConfig;
