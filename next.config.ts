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
      // Static public pages — Cloudflare caches at edge.
      {
        source:
          '/:path(|about|projects|contact|coding|login|register|smartcity|tempBeforeReal|algo)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      // Protected/auth routes — must never be cached at a shared CDN layer.
      {
        source: '/:path(profile|data-lookup|sendenv|rygame)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store',
          },
        ],
      },
      // Project detail pages are SSG — safe to cache longer
      {
        source: '/projects/:id',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
};

export default config;
