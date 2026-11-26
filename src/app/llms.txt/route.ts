import { llmsTxt } from '@/lib/agentMarkdown';

// /llms.txt (llmstxt.org): what the site is and where each page's markdown copy lives
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsTxt(), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
