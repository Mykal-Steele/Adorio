import { Braces, FileText, Terminal } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { TechLogo, skillIdForLanguage } from './TechLogo';

export function FileIcon({ path, size = 16 }: { path: string; size?: number }) {
  const [, folder, id] = path.split('/');
  if (folder === 'skills' && id) return <TechLogo id={id} size={size} />;
  if (folder === 'projects' && id) {
    const language = portfolioData.projects.find((p) => p.id === id)?.language;
    return language ? (
      <TechLogo id={skillIdForLanguage(language)} size={size} />
    ) : (
      <FileText size={size} color="var(--ide-text-5)" />
    );
  }
  if (path === '/projects') return <Braces size={size} color="var(--ide-text-5)" />;
  if (path === '/contact') return <Terminal size={size} color="var(--ide-text-5)" />;
  return <FileText size={size} color="var(--ide-text-5)" />;
}
