import { markdownPaths, markdownTokens, pageMarkdown } from '@/lib/agentMarkdown';
import { SITE_URL } from '@/lib/identity';

// The markdown copies that src/proxy.ts rewrites <page>.md to. Built at build time.
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return markdownPaths().map((path) => ({ slug: path === '/' ? [] : path.slice(1).split('/') }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const path = `/${slug.join('/')}`;
  const markdown = pageMarkdown(path);
  if (!markdown) return new Response('Not found', { status: 404 });
  return new Response(markdown, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': String(markdownTokens(markdown)),
      link: `<${SITE_URL}${path === '/' ? '/' : path}>; rel="canonical"`,
      'x-robots-tag': 'noindex',
      vary: 'Accept',
    },
  });
}
