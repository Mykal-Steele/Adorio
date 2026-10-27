import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const config: NextConfig = {
  output: 'standalone',

  // skipped in prod (Docker) builds, type checking runs locally with `npm run typecheck`
  typescript: { ignoreBuildErrors: isProd },

  // framer-motion v12 is ESM only, webpack chokes on it without this
  transpilePackages: ['framer-motion'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ibb.co' },
    ],
  },

  // for dev and standalone builds. In Docker, Nginx takes /api before it gets here.
  async rewrites() {
    const backend = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3000';
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ];
  },

  // Old static resume path now served by the /resume proxy route.
  async redirects() {
    return [
      { source: '/OakarResume.pdf', destination: '/resume', permanent: true },
      { source: '/about', destination: '/', permanent: true },
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
    // portfolio pages are fully static, so prefetches can live well past the 5 min default.
    // Someone reading About for a while shouldn't refetch Projects when they click it.
    staleTimes: {
      static: 1800,
    },
  },
};

export default config;
