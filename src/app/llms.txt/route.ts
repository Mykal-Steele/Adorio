import { portfolioData } from '@/views/Portfolio/data/portfolio';
import { ALTERNATE_NAMES, EMAILS, PROFILES, SITE_URL } from '@/lib/identity';

// /llms.txt (llmstxt.org): a plain summary of the site for AI tools, built from the
// same data as the pages so it can't drift from them.
export const dynamic = 'force-static';

export function GET() {
  const lines = [
    `# ${portfolioData.name}`,
    '',
    `> ${portfolioData.role} in ${portfolioData.location}. ${portfolioData.headline}`,
    '',
    `${portfolioData.name} also goes by ${ALTERNATE_NAMES.join(', ')}. The emails and profiles below all belong to the same person. Adorio is the project that runs this site and its apps.`,
    '',
    '## Contact',
    '',
    ...EMAILS.map((email) => `- ${email}`),
    '',
    '## Profiles',
    '',
    ...PROFILES.map((profile) => `- [${profile.label}](${profile.url})`),
    '',
    '## Pages',
    '',
    `- [About](${SITE_URL}/)`,
    `- [Projects](${SITE_URL}/projects)`,
    `- [Certificates](${SITE_URL}/certificates)`,
    `- [Contact](${SITE_URL}/contact)`,
    `- [Resume (PDF)](${SITE_URL}/resume)`,
    '',
    '## Projects',
    '',
    ...portfolioData.projects.map(
      (p) => `- [${p.name}](${SITE_URL}/projects/${p.id}): ${p.summary}`,
    ),
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
