import { Braces, FileText, Terminal } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { TechLogo, skillIdForLanguage } from './TechLogo';

export function FileIcon({ path }: { path: string }) {
  const [, folder, id] = path.split('/');
  if (folder === 'skills' && id) return <TechLogo id={id} size={14} />;
  if (folder === 'projects' && id) {
    const language = portfolioData.projects.find((p) => p.id === id)?.language;
    return language ? (
      <TechLogo id={skillIdForLanguage(language)} size={14} />
    ) : (
      <FileText size={14} color="var(--ide-text-5)" />
    );
  }
  if (path === '/projects') return <Braces size={14} color="var(--ide-text-5)" />;
  if (path === '/contact') return <Terminal size={14} color="var(--ide-text-5)" />;
  return <FileText size={14} color="var(--ide-text-5)" />;
}
