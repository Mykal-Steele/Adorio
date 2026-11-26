import { describe, expect, test } from 'bun:test';
import {
  agentRoute,
  llmsFullTxt,
  llmsTxt,
  markdownHref,
  markdownPaths,
  pageMarkdown,
  pagePathFromMarkdown,
  prefersMarkdown,
} from '../../src/lib/agentMarkdown.ts';
import { robotsTxt } from '../../src/lib/robotsTxt.ts';
import { EMAILS, PROFILES } from '../../src/lib/identity.ts';
import { portfolioData } from '../../src/views/Portfolio/data/portfolio.ts';

// AI agents get a Markdown copy of every portfolio page, either at <page>.md or by
// sending "Accept: text/markdown" to the normal URL (what Cloudflare's paid
// "Markdown for Agents" does, built into the app instead).

describe('Accept header negotiation', () => {
  test('should pick markdown when the agent asks for it', () => {
    expect(prefersMarkdown('text/markdown')).toBe(true);
    expect(prefersMarkdown('text/markdown, text/html;q=0.8')).toBe(true);
    expect(prefersMarkdown('text/markdown, text/html')).toBe(true);
    expect(prefersMarkdown('text/x-markdown')).toBe(true);
  });

  test('should keep HTML for browsers and plain fetches', () => {
    expect(prefersMarkdown(null)).toBe(false);
    expect(prefersMarkdown('')).toBe(false);
    expect(prefersMarkdown('*/*')).toBe(false);
    expect(prefersMarkdown('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')).toBe(
      false,
    );
    expect(prefersMarkdown('text/html, text/markdown;q=0.5')).toBe(false);
    expect(prefersMarkdown('text/markdown;q=0')).toBe(false);
  });
});

describe('markdown URLs', () => {
  test('should put the home page at /index.md and others at <path>.md', () => {
    expect(markdownHref('/')).toBe('/index.md');
    expect(markdownHref('/projects')).toBe('/projects.md');
    expect(markdownHref('/projects/adorio')).toBe('/projects/adorio.md');
  });

  test('should map a .md URL back to its page', () => {
    expect(pagePathFromMarkdown('/index.md')).toBe('/');
    expect(pagePathFromMarkdown('/projects.md')).toBe('/projects');
    expect(pagePathFromMarkdown('/skills/typescript.md')).toBe('/skills/typescript');
    expect(pagePathFromMarkdown('/projects/adorio')).toBe(null);
  });

  test('should cover every portfolio page', () => {
    const paths = markdownPaths();
    expect(paths).toEqual(expect.arrayContaining(['/', '/projects', '/certificates', '/contact']));
    for (const p of portfolioData.projects) expect(paths).toContain(`/projects/${p.id}`);
    for (const s of portfolioData.skills) expect(paths).toContain(`/skills/${s.id}`);
    for (const c of portfolioData.certificates) expect(paths).toContain(`/certificates/${c.id}`);
  });
});

describe('page markdown', () => {
  test('should give every page a title and its canonical URL', () => {
    for (const path of markdownPaths()) {
      const md = pageMarkdown(path);
      expect(md).toStartWith('# ');
      expect(md).toContain(`https://oakar.dev${path === '/' ? '/' : path}`);
    }
  });

  test('should return null for pages that do not exist', () => {
    expect(pageMarkdown('/projects/nope')).toBe(null);
    expect(pageMarkdown('/login')).toBe(null);
  });

  test('home page should say who this is, what they do now, and how to get around', () => {
    const md = pageMarkdown('/');
    expect(md).toContain('Oakar Oo');
    expect(md).toContain(portfolioData.headline);
    for (const e of portfolioData.experience) expect(md).toContain(e.role);
    for (const p of portfolioData.projects)
      expect(md).toContain(`https://oakar.dev/projects/${p.id}`);
    for (const c of portfolioData.certificates) expect(md).toContain(c.name);
    expect(md).toContain(EMAILS[0]);
    expect(md).toContain('https://oakar.dev/resume');
  });

  test('project page should carry the full write-up', () => {
    const p = portfolioData.projects.find((x) => x.id === 'adorio');
    const md = pageMarkdown('/projects/adorio');
    for (const text of [p.summary, p.problem, p.role, p.result, ...p.stack]) {
      expect(md).toContain(text);
    }
    expect(md).toContain('https://github.com/Mykal-Steele/Adorio');
  });

  test('skill page should include the story and the projects that use it', () => {
    const s = portfolioData.skills.find((x) => x.id === 'typescript');
    const md = pageMarkdown('/skills/typescript');
    expect(md).toContain(s.story);
    expect(md).toContain('https://oakar.dev/projects/adorio');
  });

  test('certificate page should link to the online check when there is one', () => {
    const md = pageMarkdown('/certificates/google-it-support');
    expect(md).toContain('https://coursera.org/verify/professional-cert/5C70N9AVQC69');
    expect(md).toContain('Technical Support Fundamentals');
  });

  test('contact page should list every email and profile', () => {
    const md = pageMarkdown('/contact');
    for (const email of EMAILS) expect(md).toContain(email);
    for (const profile of PROFILES) expect(md).toContain(profile.url);
  });

  test('should turn short repo links into full https URLs', () => {
    for (const path of markdownPaths()) {
      expect(pageMarkdown(path)).not.toMatch(/\]\((github|npmjs)\.com/);
    }
  });
});

describe('proxy routing', () => {
  test('should rewrite .md URLs to the markdown route', () => {
    expect(agentRoute('/projects/adorio.md', null)).toEqual({
      type: 'markdown',
      rewrite: '/agent-markdown/projects/adorio',
    });
    expect(agentRoute('/index.md', null)).toEqual({ type: 'markdown', rewrite: '/agent-markdown' });
  });

  test('should rewrite a page to markdown when the Accept header asks for it', () => {
    expect(agentRoute('/projects', 'text/markdown')).toEqual({
      type: 'markdown',
      rewrite: '/agent-markdown/projects',
    });
    expect(agentRoute('/', 'text/markdown')).toEqual({
      type: 'markdown',
      rewrite: '/agent-markdown',
    });
  });

  test('should point HTML responses at the markdown copy and the agent files', () => {
    const route = agentRoute('/projects/adorio', 'text/html');
    expect(route.type).toBe('html');
    expect(route.link).toContain('</projects/adorio.md>; rel="alternate"; type="text/markdown"');
    expect(route.link).toContain('</llms.txt>; rel="describedby"');
    expect(route.link).toContain('</sitemap.xml>; rel="sitemap"');
  });

  test('should leave unknown pages alone', () => {
    expect(agentRoute('/projects/nope', 'text/markdown')).toBe(null);
    expect(agentRoute('/projects/nope.md', null)).toBe(null);
    expect(agentRoute('/social', 'text/markdown')).toBe(null);
  });
});

describe('llms.txt', () => {
  test('should follow the llmstxt.org layout and link every markdown page', () => {
    const txt = llmsTxt();
    expect(txt).toStartWith('# Oakar Oo\n\n> ');
    for (const path of markdownPaths()) {
      expect(txt).toContain(`(https://oakar.dev${markdownHref(path)})`);
    }
    expect(txt).toContain('https://oakar.dev/llms-full.txt');
  });

  test('llms-full.txt should hold every page in full', () => {
    const full = llmsFullTxt();
    for (const path of markdownPaths()) expect(full).toContain(pageMarkdown(path));
  });
});

describe('robots.txt', () => {
  test('should allow search, AI answers and AI training through Content Signals', () => {
    const txt = robotsTxt();
    expect(txt).toContain('Content-Signal: search=yes, ai-input=yes, ai-train=yes');
    expect(txt).toContain('Sitemap: https://oakar.dev/sitemap.xml');
  });

  test('should keep private app pages and the internal markdown route out', () => {
    const txt = robotsTxt();
    for (const path of ['/api/', '/profile', '/login', '/agent-markdown']) {
      expect(txt).toContain(`Disallow: ${path}`);
    }
    expect(txt).toMatch(/^User-agent: \*$/m);
  });
});
