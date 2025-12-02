import dotenv from 'dotenv';

// Load environment variables as early as possible
// For cloud platforms like Render, environment variables are injected directly
// For local development, load from .env files
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development' });
} else if (!process.env.MONGO_URI) {
  // Only load .env file if environment variables aren't already set (local production testing)
  dotenv.config({ path: '.env' });
}

const normalize = (value) => (typeof value === 'string' ? value.trim() : value);

const environment = {
  nodeEnv: normalize(process.env.NODE_ENV) || 'development',
  port: normalize(process.env.PORT) || 3000,
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
  'https://www.mykal-steele.github.io',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174', // In case vite uses alternate port
  'https://feelio.space',
  'https://adorio.space',
  'http://adorio.space',
  'https://www.adorio.space',
  'https://adorio.vercel.app',
  'http://127.0.0.1:5173',
];

const dynamicOrigins = [
  environment.clientUrl,
  environment.viteBackendUrl,
].filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...dynamicOrigins])];

export { environment, allowedOrigins, isProduction };
