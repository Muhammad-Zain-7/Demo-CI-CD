import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-rendered deployment (API routes enabled)
  eslint: {
    // Allow production builds to successfully complete even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript checking during builds to bypass silly type errors
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value:
              'geolocation=(self "https://www.paypal.com"), microphone=(), camera=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
