import { allowedOrigins } from './environment.js';
import ApiError from '../utils/ApiError.js';

const isVercelPreview = (origin = '') =>
  /^https:\/\/[\w-]+\.vercel\.app$/i.test(origin) ||
  /^https:\/\/adorio-[\w-]+\.vercel\.app$/i.test(origin);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || isVercelPreview(origin)) {
      return callback(null, true);
    }

    return callback(ApiError.forbidden('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default corsOptions;
