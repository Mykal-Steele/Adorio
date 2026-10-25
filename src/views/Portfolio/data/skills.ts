import { portfolioData, type Project, type Skill } from './portfolio';

// Whole-word match, so "Java" doesn't match "JavaScript" and "SQL" doesn't match "PostgreSQL"
function mentions(text: string, skill: Skill) {
  const name = skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Za-z0-9.])${name}($|[^A-Za-z0-9])`, 'i').test(text);
}

// The stack lists the exact skill names a project was built with
const usesSkill = (project: Project, skill: Skill) => project.stack.includes(skill.name);

export const projectsForSkill = (skill: Skill) =>
  portfolioData.projects.filter((project) => usesSkill(project, skill));

export const skillsForProject = (project: Project) =>
  portfolioData.skills.filter((skill) => usesSkill(project, skill));

export const experienceForSkill = (skill: Skill) =>
  portfolioData.experience.flatMap((exp) =>
    exp.highlights
      .filter((highlight) => mentions(highlight, skill))
      .map((highlight) => ({ role: exp.role, org: exp.org, highlight })),
  );
