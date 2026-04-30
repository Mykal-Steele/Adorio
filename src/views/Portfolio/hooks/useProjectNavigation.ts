'use client';

import { useRouter } from 'next/navigation';
import { useIDE } from '../context/IDEContext';

export function useProjectNavigation() {
  const router = useRouter();
  const { addProjectTab } = useIDE();

  const openProject = (id: string) => {
    addProjectTab(id);
    router.push(`/projects/${id}`);
  };

  return { openProject };
}
