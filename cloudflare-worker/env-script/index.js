import SCRIPT from './script.sh';

const ALLOWED_PATHS = new Set(['/', '/install', '/env']);

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed\n', {
        status: 405,
        headers: { allow: 'GET, HEAD' },
      });
    }

    if (!ALLOWED_PATHS.has(url.pathname)) {
      return new Response('Not found\n', { status: 404 });
    }

    return new Response(SCRIPT, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      },
    });
  },
};
