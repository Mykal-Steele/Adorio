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

  // In dev, proxy /api to Express so no CORS issues
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
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
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
};

export default config;
