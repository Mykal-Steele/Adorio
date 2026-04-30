import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',

  // framer-motion v12 is ESM-only; transpile it so webpack handles it correctly
  transpilePackages: ['framer-motion'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ibb.co' },
    ],
  },

  // Proxy /api to Express — works in dev and standalone builds.
  // In Docker production, Nginx intercepts /api before Next.js, so this is a no-op there.
  async rewrites() {
    const backend = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3000';
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
};

export default config;
