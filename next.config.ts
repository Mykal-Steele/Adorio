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
      // Static pre-rendered pages — let Cloudflare cache the HTML at edge.
      // s-maxage controls the CDN TTL; max-age keeps the browser copy for 60s.
      // stale-while-revalidate lets Cloudflare serve stale while it re-fetches in the background.
      {
        source:
          '/:path(|about|projects|contact|coding|login|register|rygame|smartcity|profile|data-lookup|sendenv|tempBeforeReal|algo)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
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
