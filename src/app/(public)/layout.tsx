import { ReactNode } from 'react';
import { PortfolioShell } from '@/views/Portfolio/IDELayout';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PortfolioShell>{children}</PortfolioShell>;
}
