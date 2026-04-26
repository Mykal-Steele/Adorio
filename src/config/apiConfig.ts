// Client requests go to /api (relative, same origin)
// Next.js rewrites handle /api → Express in dev
// Nginx handles /api → Express in production
export const API_BASE_URL = '/api';
