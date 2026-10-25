import { portfolioData, type Project, type Skill } from './portfolio';

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

// Whole-word match, so "Java" doesn't match "JavaScript" and "SQL" doesn't match "PostgreSQL"
function mentions(text: string, skill: Skill) {
  const name = skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Za-z0-9.])${name}($|[^A-Za-z0-9])`, 'i').test(text);
}

function usesSkill(project: Project, skill: Skill) {
  if (project.language === skill.name) return true;
  const tagMatch = project.tags.some((tag) => {
    const t = normalize(tag);
    // "#POSTGRES" counts for postgresql, but "#JAVA" stays out of javascript
    return t === skill.id || (t.length >= 6 && skill.id.startsWith(t));
  });
  if (tagMatch) return true;
  // "My role" mentions platforms the work ran on, not what it was built with, so it's left out
  const writeUp = [
    project.summary,
    ...(project.decisions ?? []).flatMap((d) => [d.title, d.reason]),
  ].join(' ');
  return mentions(writeUp, skill);
}

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
