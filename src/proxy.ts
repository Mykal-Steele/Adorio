import { NextResponse, type NextRequest } from 'next/server';
import { agentRoute } from '@/lib/agentMarkdown';

// Serves the markdown copy of a portfolio page at <page>.md, or at the page itself when
// an agent sends "Accept: text/markdown", and points HTML pages at that copy.
export function proxy(request: NextRequest) {
  const route = agentRoute(request.nextUrl.pathname, request.headers.get('accept'));
  if (!route) return NextResponse.next();

  if (route.type === 'markdown') {
    const response = NextResponse.rewrite(new URL(route.rewrite, request.url));
    response.headers.set('Vary', 'Accept');
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('Link', route.link);
  return response;
}

// only the portfolio pages have a markdown copy
export const config = {
  matcher: [
    '/',
    '/index.md',
    '/projects',
    '/projects.md',
    '/projects/:path*',
    '/skills/:path*',
    '/certificates',
    '/certificates.md',
    '/certificates/:path*',
    '/contact',
    '/contact.md',
  ],
};
