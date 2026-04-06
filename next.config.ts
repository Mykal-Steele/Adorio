import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typedRoutes: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "lodash-es"],
  },
};

export default nextConfig;
