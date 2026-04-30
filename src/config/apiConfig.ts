// In dev, call the Express backend directly (CORS allows localhost:3001)
// In production, use relative /api — Nginx proxies to Express
export const API_BASE_URL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api';
