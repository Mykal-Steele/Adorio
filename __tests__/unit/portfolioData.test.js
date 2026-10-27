import { portfolioData } from '../../src/views/Portfolio/data/portfolio.ts';
import { projectsForSkill, skillsForProject } from '../../src/views/Portfolio/data/skills.ts';
import { liveLabel } from '../../src/views/Portfolio/data/links.ts';

const project = (id) => portfolioData.projects.find((p) => p.id === id);
const skill = (id) => portfolioData.skills.find((s) => s.id === id);
const names = (list) => list.map((item) => item.name);

// The same list, in the same groups, as the Skills section of the resume
const RESUME_SKILLS = {
  Languages: ['TypeScript', 'JavaScript', 'Java', 'Python', 'SQL'],
  'Web & Backend': [
    'React',
    'Next.js',
    'Tailwind CSS',
    'Node.js',
    'Bun',
    'Express',
    'NestJS',
    'Hono',
    'Prisma',
  ],
  Databases: ['PostgreSQL', 'SQLite', 'MongoDB'],
  'Tools & Infra': [
    'Docker',
    'Nginx',
    'GitHub Actions',
    'Azure',
    'Cloudflare',
    'Git',
    'Linux',
    'Swagger / OpenAPI',
    'Figma',
  ],
};

describe('portfolio skills', () => {
  test('should list the same skills in the same groups as the resume', () => {
    const groups = {};
    for (const s of portfolioData.skills) (groups[s.group] ??= []).push(s.name);
    expect(groups).toEqual(RESUME_SKILLS);
  });

  test('should link a project to exactly the skills in its stack', () => {
    expect(names(skillsForProject(project('smartcity-financial')))).toEqual(
      expect.arrayContaining(['TypeScript', 'React', 'Hono', 'Prisma']),
    );
    expect(names(skillsForProject(project('uniloom')))).not.toContain('Linux');
    expect(names(skillsForProject(project('coding-challenges')))).toContain('Java');
  });

  test('should not count JavaScript projects as Java projects', () => {
    const javaProjects = projectsForSkill(skill('java')).map((p) => p.id);
    expect(javaProjects).not.toContain('create-adorex');
  });
});

describe('portfolio projects', () => {
  test('should give every project what a recruiter looks for', () => {
    for (const p of portfolioData.projects) {
      expect({ id: p.id, ok: Boolean(p.summary && p.problem && p.role && p.result) }).toEqual({
        id: p.id,
        ok: true,
      });
      expect(p.stack.length).toBeGreaterThan(0);
    }
  });

  // Adorio is the platform; the apps on it are their own projects
  test('should list Social and Hosting as their own projects next to Adorio', () => {
    expect(project('adorio')?.liveUrl).toBe('https://adorio.space');
    expect(project('social')?.liveUrl).toBe('/social');
    expect(project('hosting')?.liveUrl).toBe('/hosting');
  });

  test('should not describe Adorio with the social feed', () => {
    const adorio = project('adorio');
    expect(adorio?.image?.src).not.toContain('/social/');
    expect(JSON.stringify(adorio)).not.toMatch(/infinite scroll|threaded comments/i);
  });

  test('should not tell visitors to ask for a demo account', () => {
    for (const p of portfolioData.projects) expect(p).not.toHaveProperty('requiresAccount');
  });

  test('should not use em or en dashes in any copy', () => {
    expect(JSON.stringify(portfolioData)).not.toMatch(/[–—]/);
  });
});

describe('portfolio writing', () => {
  test('should give every skill a story', () => {
    const empty = portfolioData.skills.filter((s) => !s.story.trim()).map((s) => s.name);
    expect(empty).toEqual([]);
  });

  test('should describe every other project in a line', () => {
    const empty = portfolioData.otherProjects.filter((p) => !p.detail?.trim()).map((p) => p.name);
    expect(empty).toEqual([]);
  });

  test('should give every role at least one highlight', () => {
    const empty = portfolioData.experience
      .filter((e) => e.highlights.length === 0)
      .map((e) => e.role);
    expect(empty).toEqual([]);
  });
});

describe('linux setup', () => {
  test('should show the machine, system, and tools setup on the Linux page', () => {
    const setup = skill('linux').setup ?? [];
    expect(setup.map((g) => g.group)).toEqual(['Machine', 'System', 'Tools']);
    expect(setup.flatMap((g) => g.items.map((i) => i.value)).join(' ')).toContain('foot');
  });

  // Exact models, boot setup, browser, and failover or spending thresholds help someone target me
  test('should not publish details that help an attacker', () => {
    const text = JSON.stringify(portfolioData);
    for (const detail of [
      'UX5401ZAS',
      'Tiny11',
      'Limine',
      'Brave',
      'Two failed requests',
      'every 5 minutes',
      '$2.50 a day',
      'failover does not mistake',
    ]) {
      expect({ detail, found: text.includes(detail) }).toEqual({ detail, found: false });
    }
  });
});

describe('portfolio experience', () => {
  const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  // "Aug to Dec 2025" starts in Aug 2025, "Jun 2026 to Jul 2026" in Jun 2026
  const start = (period) => {
    const month = MONTHS.indexOf(period.slice(0, 3));
    const year = Number(period.match(/\d{4}/)[0]);
    return year * 12 + month;
  };

  test('should list roles newest first, since the timeline marks the first one as current', () => {
    const starts = portfolioData.experience.map((exp) => start(exp.period));
    expect(starts).toEqual([...starts].sort((a, b) => b - a));
  });
});

describe('liveLabel', () => {
  test('should show where a live project runs, without the protocol', () => {
    expect(liveLabel('/coding')).toBe('adorio.space/coding');
    expect(liveLabel('https://loom.psstee.me/')).toBe('loom.psstee.me');
    expect(liveLabel('https://adorio.space')).toBe('adorio.space');
  });
});

describe('portfolio redirects', () => {
  // A leftover redirect hid /projects/social behind the Adorio page after Social got its own entry
  test('should not redirect away from a project that has its own page', async () => {
    const { default: config } = await import('../../next.config.ts');
    const sources = (await config.redirects()).map((r) => r.source);
    const shadowed = portfolioData.projects
      .map((p) => `/projects/${p.id}`)
      .filter((path) => sources.includes(path));
    expect(shadowed).toEqual([]);
  });
});
