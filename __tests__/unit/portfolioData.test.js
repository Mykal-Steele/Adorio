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

  test('should have an Adorio project in place of the old social feed entry', () => {
    expect(project('adorio')?.liveUrl).toBe('https://adorio.space');
    expect(project('social')).toBeUndefined();
  });

  test('should not tell visitors to ask for a demo account', () => {
    for (const p of portfolioData.projects) expect(p).not.toHaveProperty('requiresAccount');
  });

  test('should not use em or en dashes in any copy', () => {
    expect(JSON.stringify(portfolioData)).not.toMatch(/[–—]/);
  });
});

describe('liveLabel', () => {
  test('should show where a live project runs, without the protocol', () => {
    expect(liveLabel('/coding')).toBe('adorio.space/coding');
    expect(liveLabel('https://loom.psstee.me/')).toBe('loom.psstee.me');
    expect(liveLabel('https://adorio.space')).toBe('adorio.space');
  });
});
