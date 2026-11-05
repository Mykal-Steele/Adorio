import { portfolioData } from './portfolio';

const EXT_BY_LANGUAGE: Record<string, string> = {
  JavaScript: '.js',
  TypeScript: '.ts',
  Python: '.py',
  Java: '.java',
};

export const ROOT_FILES = [
  { name: 'about_me.md', path: '/' },
  { name: 'projects.json', path: '/projects' },
  { name: 'contact.sh', path: '/contact' },
];

export function projectFileName(id: string) {
  const language = portfolioData.projects.find((p) => p.id === id)?.language;
  return `${id}${(language && EXT_BY_LANGUAGE[language]) ?? '.md'}`;
}

export const CERTIFICATES_INDEX = { name: 'certificates.json', path: '/certificates' };

export const certificateFileName = (id: string) => `${id}.md`;

// The file name an open page shows in its tab
export function fileNameForPath(path: string) {
  const root = ROOT_FILES.find((f) => f.path === path);
  if (root) return root.name;
  if (path === CERTIFICATES_INDEX.path) return CERTIFICATES_INDEX.name;
  const [, folder, id] = path.split('/');
  if (folder === 'projects' && id) return projectFileName(id);
  if (folder === 'skills' && id) return `${id}.md`;
  if (folder === 'certificates' && id) return certificateFileName(id);
  return path;
}

// Projects start open. Skills and certificates start closed unless the page on screen is
// inside them, so the active file is never hidden.
export function initialOpenFolders(pathname: string) {
  return {
    projects: true,
    skills: pathname.startsWith('/skills/'),
    certificates: pathname === '/certificates' || pathname.startsWith('/certificates/'),
  };
}
