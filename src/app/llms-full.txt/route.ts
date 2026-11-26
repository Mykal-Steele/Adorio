import { llmsFullTxt } from '@/lib/agentMarkdown';

// every portfolio page as markdown in one file, for tools that read a site in one go
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsFullTxt(), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
