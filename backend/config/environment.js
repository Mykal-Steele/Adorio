import dotenv from 'dotenv';

// Load environment variables as early as possible
dotenv.config();

const normalize = (value) => (typeof value === 'string' ? value.trim() : value);

const environment = {
  nodeEnv: normalize(process.env.NODE_ENV) || 'development',
  port: normalize(process.env.PORT) || 5000,
  mongoUri: normalize(process.env.MONGO_URI),
  jwtSecret: normalize(process.env.JWT_SECRET),
  refreshTokenSecret:
    normalize(process.env.REFRESH_TOKEN_SECRET) ||
    normalize(process.env.JWT_SECRET),
  clientUrl: normalize(process.env.CLIENT_URL),
  viteBackendUrl: normalize(process.env.VITE_BACKEND_URL),
  cloudinary: {
    name: normalize(process.env.CLOUDINARY_NAME),
    key: normalize(process.env.CLOUDINARY_KEY),
    secret: normalize(process.env.CLOUDINARY_SECRET),
  },
};

const isProduction = environment.nodeEnv === 'production';

const defaultOrigins = [
  'https://mykal-steele.github.io',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://feelio.space',
  'https://adorio.space',
  'http://adorio.space',
  'https://www.adorio.space',
  'https://adorio.vercel.app',
];

const dynamicOrigins = [
  environment.clientUrl,
  environment.viteBackendUrl,
].filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...dynamicOrigins])];

export { environment, allowedOrigins, isProduction };
