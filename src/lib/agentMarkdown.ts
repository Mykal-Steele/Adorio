import { portfolioData, type Project } from '@/views/Portfolio/data/portfolio';
import {
  experienceForSkill,
  projectsForSkill,
  skillsForProject,
} from '@/views/Portfolio/data/skills';
import { statusConfig } from '@/views/Portfolio/constants/status';
import { ALTERNATE_NAMES, EMAILS, PROFILES, SITE_URL } from '@/lib/identity';

// Markdown copies of the portfolio pages for AI agents. They are served at <page>.md
// and at the normal URL when a request sends "Accept: text/markdown" (see src/proxy.ts),
// and they are built from the same data as the pages, so they can't drift from them.

export const MARKDOWN_ROUTE = '/agent-markdown';

// q value of each media type in an Accept header
function acceptWeights(accept: string) {
  const weights = new Map<string, number>();
  for (const part of accept.split(',')) {
    const [type, ...params] = part.trim().toLowerCase().split(';');
    if (!type) continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
    const weight = q ? Number.parseFloat(q.slice(2)) : 1;
    weights.set(type, Number.isNaN(weight) ? 0 : weight);
  }
  return weights;
}

// Browsers never list text/markdown, so this only fires for agents that ask for it
export function prefersMarkdown(accept: string | null | undefined) {
  if (!accept) return false;
  const weights = acceptWeights(accept);
  const markdown = Math.max(weights.get('text/markdown') ?? 0, weights.get('text/x-markdown') ?? 0);
  const html = weights.get('text/html') ?? 0;
  return markdown > 0 && markdown >= html;
}

export const markdownHref = (path: string) => (path === '/' ? '/index.md' : `${path}.md`);

export function pagePathFromMarkdown(pathname: string) {
  if (pathname === '/index.md') return '/';
  return pathname.endsWith('.md') ? pathname.slice(0, -3) : null;
}

export function markdownPaths() {
  return [
    '/',
    '/projects',
    ...portfolioData.projects.map((p) => `/projects/${p.id}`),
    ...portfolioData.skills.map((s) => `/skills/${s.id}`),
    '/certificates',
    ...portfolioData.certificates.map((c) => `/certificates/${c.id}`),
    '/contact',
  ];
}

// Data keeps some links short ("github.com/x") or relative ("/coding")
function fullUrl(href: string) {
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith('/')) return `${SITE_URL}${href}`;
  return `https://${href}`;
}

const pageUrl = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`;
const link = (label: string, href: string) => `[${label}](${fullUrl(href)})`;
const list = (items: string[]) => items.map((item) => `- ${item}`);

function page(title: string, path: string, body: (string | false | undefined)[]) {
  const lines = [
    `# ${title}`,
    '',
    `Source: ${pageUrl(path)}`,
    '',
    ...body.filter((l) => l !== false && l !== undefined),
  ];
  // collapse the blank lines left by optional sections
  return `${lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()}\n`;
}

const section = (heading: string, lines: string[]) =>
  lines.length ? ['', `## ${heading}`, '', ...lines] : [];

function projectLinks(project: Project) {
  const links: string[] = [];
  if (project.liveUrl) links.push(link('Live', project.liveUrl));
  if (project.repoUrl) links.push(link('Source code', project.repoUrl));
  if (project.npm) links.push(link('npm package', project.npm));
  for (const l of project.links ?? []) links.push(link(l.label, l.href));
  return links;
}

function home() {
  const d = portfolioData;
  return page(`${d.name}, ${d.role}`, '/', [
    `> ${d.headline}`,
    '',
    `${d.name} (also known as ${ALTERNATE_NAMES.join(', ')}) lives in ${d.location} (${d.timezone}). Studies: ${d.university}.`,
    '',
    `Email: ${EMAILS.join(', ')}. Resume (PDF): ${SITE_URL}/resume`,
    ...section('Now', list(d.now.map((n) => `${n.label}: ${n.detail}`))),
    ...section(
      'Experience',
      d.experience.flatMap((e) => [
        `### ${e.role}`,
        '',
        `${e.org}. ${e.period}.`,
        '',
        ...list(e.highlights),
        ...(e.projectId ? ['', `Project: ${pageUrl(`/projects/${e.projectId}`)}`] : []),
        '',
      ]),
    ),
    ...section(
      'Projects',
      d.projects.map(
        (p) =>
          `- ${link(p.name, `/projects/${p.id}`)} (${statusConfig[p.status].label}): ${p.summary}`,
      ),
    ),
    ...section(
      'Other projects',
      d.otherProjects.map((p) => `- ${link(p.name, p.href)}: ${p.detail}`),
    ),
    ...section(
      'Skills',
      [...new Set(d.skills.map((s) => s.group))].map(
        (group) =>
          `- ${group}: ${d.skills
            .filter((s) => s.group === group)
            .map((s) => link(s.name, `/skills/${s.id}`))
            .join(', ')}`,
      ),
    ),
    ...section(
      'Certificates',
      d.certificates.map(
        (c) => `- ${link(c.name, `/certificates/${c.id}`)}, ${c.issuer}, ${c.issued}`,
      ),
    ),
    ...section(
      'Communities',
      d.community.map((c) => `- ${c.name}, since ${c.since}. ${c.detail}`),
    ),
    ...section(
      'Timeline',
      d.timeline.flatMap((t) => [`### ${t.year}`, '', ...list(t.events), '']),
    ),
    ...section(
      'Profiles',
      PROFILES.map((p) => `- ${link(p.label, p.url)}`),
    ),
    ...section('How this site is laid out', [
      `- ${pageUrl('/')}: this page, about ${d.name}`,
      `- ${pageUrl('/projects')}: every project, each with its own page at /projects/<id>`,
      '- /skills/<id>: what was built with each skill and how it was learned',
      `- ${pageUrl('/certificates')}: certificates, each with its own page at /certificates/<id>`,
      `- ${pageUrl('/contact')}: email and profiles`,
      `- ${SITE_URL}/social, ${SITE_URL}/coding and the other apps are part of Adorio, the platform that runs this site`,
      `- Add .md to any page above for its Markdown copy, or send "Accept: text/markdown". ${SITE_URL}/llms.txt lists them all`,
    ]),
  ]);
}

function projectsIndex() {
  return page(`Projects by ${portfolioData.name}`, '/projects', [
    ...portfolioData.projects.flatMap((p) => [
      `## ${link(p.name, `/projects/${p.id}`)}`,
      '',
      `${statusConfig[p.status].label}. Built with ${p.stack.join(', ')}.`,
      '',
      p.summary,
      '',
    ]),
    ...section(
      'Other projects',
      portfolioData.otherProjects.map((p) => `- ${link(p.name, p.href)}: ${p.detail}`),
    ),
  ]);
}

function projectPage(project: Project) {
  const p = project;
  return page(p.name, `/projects/${p.id}`, [
    `> ${p.summary}`,
    '',
    `Status: ${statusConfig[p.status].label}.${p.language ? ` Main language: ${p.language}.` : ''}`,
    '',
    `Stack: ${p.stack.join(', ')}`,
    ...section('Links', list(projectLinks(p))),
    ...section('The problem', [p.problem]),
    ...section('My role', [p.role]),
    ...section('Result', [p.result]),
    ...section('Features', list(p.features ?? [])),
    ...section(
      'Decisions',
      (p.decisions ?? []).map((d) => `- ${d.title}: ${d.reason}`),
    ),
    ...section('Numbers', list(p.numbers ?? [])),
    ...section('The hard part', p.hardPart ? [p.hardPart] : []),
    ...section('What I learned', p.learned ? [p.learned] : []),
    ...section('Limits', p.limits ? [p.limits] : []),
    ...section('Note', p.note ? [p.note] : []),
    ...section(
      'Screenshots',
      (p.screenshots ?? []).map((s) => `- ${link(s.caption || s.alt, s.src)}: ${s.alt}`),
    ),
    ...section(
      'Skills used',
      skillsForProject(p).map((s) => `- ${link(s.name, `/skills/${s.id}`)}`),
    ),
  ]);
}

function skillPage(id: string) {
  const skill = portfolioData.skills.find((s) => s.id === id);
  if (!skill) return null;
  return page(`${skill.name} (${skill.group})`, `/skills/${skill.id}`, [
    skill.story,
    ...section(
      'Projects built with it',
      projectsForSkill(skill).map((p) => `- ${link(p.name, `/projects/${p.id}`)}: ${p.summary}`),
    ),
    ...section(
      'Where it came up at work',
      experienceForSkill(skill).map((e) => `- ${e.role}, ${e.org}: ${e.highlight}`),
    ),
    ...(skill.setup ?? []).flatMap((g) =>
      section(
        g.group,
        g.items.map((i) => `- ${i.label}: ${i.value}`),
      ),
    ),
  ]);
}

function certificatesIndex() {
  return page(`Certificates of ${portfolioData.name}`, '/certificates', [
    ...portfolioData.certificates.flatMap((c) => [
      `## ${link(c.name, `/certificates/${c.id}`)}`,
      '',
      `${c.issuer}, ${c.issued}.`,
      '',
      c.summary,
      '',
    ]),
  ]);
}

function certificatePage(id: string) {
  const c = portfolioData.certificates.find((x) => x.id === id);
  if (!c) return null;
  return page(c.name, `/certificates/${c.id}`, [
    `Issued by ${c.issuer}, ${c.issued}.`,
    '',
    c.summary,
    ...section('Courses', list(c.courses ?? [])),
    ...section('Check it', c.verifyUrl ? [link('Verify online', c.verifyUrl)] : []),
    ...section('Image', [link(c.image.alt, c.image.src)]),
  ]);
}

function contactPage() {
  return page(`Contact ${portfolioData.name}`, '/contact', [
    ...section('Email', list(EMAILS)),
    ...section(
      'Profiles',
      PROFILES.map((p) => `- ${link(p.label, p.url)}`),
    ),
    ...section('Resume', [`${SITE_URL}/resume (PDF)`]),
    '',
    `Based in ${portfolioData.location} (${portfolioData.timezone}).`,
  ]);
}

export function pageMarkdown(path: string): string | null {
  if (path === '/') return home();
  if (path === '/projects') return projectsIndex();
  if (path === '/certificates') return certificatesIndex();
  if (path === '/contact') return contactPage();
  const [, kind, id, extra] = path.split('/');
  if (!id || extra !== undefined) return null;
  if (kind === 'projects') {
    const project = portfolioData.projects.find((p) => p.id === id);
    return project ? projectPage(project) : null;
  }
  if (kind === 'skills') return skillPage(id);
  if (kind === 'certificates') return certificatePage(id);
  return null;
}

// What src/proxy.ts does with a request: serve the markdown copy, or add Link headers
// to the HTML page so agents can find the markdown and the site-wide files.
export type AgentRoute = { type: 'markdown'; rewrite: string } | { type: 'html'; link: string };

export function agentRoute(pathname: string, accept: string | null): AgentRoute | null {
  const fromMarkdown = pagePathFromMarkdown(pathname);
  const path = fromMarkdown ?? pathname;
  if (!markdownPaths().includes(path)) return null;
  if (fromMarkdown !== null || prefersMarkdown(accept)) {
    return {
      type: 'markdown',
      rewrite: path === '/' ? MARKDOWN_ROUTE : `${MARKDOWN_ROUTE}${path}`,
    };
  }
  return {
    type: 'html',
    link: [
      `<${markdownHref(path)}>; rel="alternate"; type="text/markdown"`,
      '</llms.txt>; rel="describedby"; type="text/plain"',
      '</sitemap.xml>; rel="sitemap"; type="application/xml"',
    ].join(', '),
  };
}

// /llms.txt (llmstxt.org): what the site is and where every page's markdown lives
export function llmsTxt() {
  const d = portfolioData;
  const entry = (path: string, label: string, note?: string) =>
    `- [${label}](${SITE_URL}${markdownHref(path)})${note ? `: ${note}` : ''}`;
  return [
    `# ${d.name}`,
    '',
    `> ${d.role} in ${d.location}. ${d.headline}`,
    '',
    `${d.name} also goes by ${ALTERNATE_NAMES.join(', ')}. The emails and profiles below all belong to the same person. Adorio is the platform that runs this site and its apps.`,
    '',
    `Every page below is Markdown. Any page on ${SITE_URL} also answers with Markdown when the request sends "Accept: text/markdown". Everything in one file: ${SITE_URL}/llms-full.txt`,
    '',
    '## Contact',
    '',
    ...list(EMAILS),
    `- [Resume (PDF)](${SITE_URL}/resume)`,
    '',
    '## Pages',
    '',
    entry('/', 'About', 'who this is, experience, projects, skills, certificates, timeline'),
    entry('/projects', 'Projects', 'every project in short'),
    entry('/certificates', 'Certificates'),
    entry('/contact', 'Contact'),
    '',
    '## Projects',
    '',
    ...d.projects.map((p) => entry(`/projects/${p.id}`, p.name, p.summary)),
    '',
    '## Skills',
    '',
    ...d.skills.map((s) => entry(`/skills/${s.id}`, s.name, s.group)),
    '',
    '## Certificates',
    '',
    ...d.certificates.map((c) =>
      entry(`/certificates/${c.id}`, c.name, `${c.issuer}, ${c.issued}`),
    ),
    '',
    '## Profiles',
    '',
    ...PROFILES.map((p) => `- [${p.label}](${p.url})`),
    '',
    '## Optional',
    '',
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    ...d.otherProjects.map((p) => `- [${p.name}](${fullUrl(p.href)}): ${p.detail}`),
    '',
  ].join('\n');
}

export function llmsFullTxt() {
  return markdownPaths()
    .map((path) => pageMarkdown(path))
    .join('\n---\n\n');
}

// rough count, about four characters per token, sent the way Cloudflare does
export const markdownTokens = (markdown: string) => Math.ceil(markdown.length / 4);
